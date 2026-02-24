#!/usr/bin/env node
// ============================================================================
// Postflop Pre-computation Script
// ============================================================================
// Batch-solves common postflop spots using the WASM solver in Node.js.
// Each spot is solved in a child process to get fresh WASM memory.
//
// Usage:
//   node scripts/precompute-postflop.mjs                    # all spots (100bb)
//   node scripts/precompute-postflop.mjs --depth 40bb       # 40bb stack depth
//   node scripts/precompute-postflop.mjs --depth 25bb       # 25bb stack depth
//   node scripts/precompute-postflop.mjs --depth 15bb       # 15bb stack depth
//   node scripts/precompute-postflop.mjs --iterations 100   # fewer iterations
//   node scripts/precompute-postflop.mjs --matchup SB_vs_BB # single matchup
//   node scripts/precompute-postflop.mjs --board A72r       # single board
//   node scripts/precompute-postflop.mjs --child <json>     # internal: run single solve
//
// Depth configs (pot normalized to 100 in all cases):
//   100bb: stack=450  (SPR ~4.5, deep play, multiple streets)
//   40bb:  stack=175  (SPR ~1.75, shallower, more turn/river jams)
//   25bb:  stack=100  (SPR ~1.0, often 1-2 streets of play)
//   15bb:  stack=50   (SPR ~0.5, flop jam-or-fold territory)
//
// Performance: ~2-5 min per spot (single-threaded WASM). Full batch (~115 spots)
// takes several hours. Use --matchup/--board to solve selectively.
//
// Requirements: Node.js 18+ (WebAssembly + ESM support), ~2GB free RAM
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync, fork } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Parse CLI arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const idx = args.indexOf('--' + name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : defaultVal;
}
function hasArg(name) {
  return args.indexOf('--' + name) >= 0;
}

const MAX_ITERATIONS = parseInt(getArg('iterations', '100'), 10);
const TARGET_EXPLOIT_PCT = parseFloat(getArg('target', '1.0'));  // % of pot
const FILTER_MATCHUP = getArg('matchup', null);
const FILTER_BOARD = getArg('board', null);
const IS_CHILD = hasArg('child');

// ---------------------------------------------------------------------------
// Depth configuration — maps stack depth to solver pot/stack settings
// ---------------------------------------------------------------------------
const DEPTH_CONFIGS = {
  '100bb': { pot: 100, stack: 450, betSizes: {
    oopFlopBet: '33%', oopFlopRaise: '60%',
    oopTurnBet: '67%', oopTurnRaise: '60%', oopTurnDonk: '',
    oopRiverBet: '67%', oopRiverRaise: '60%', oopRiverDonk: '',
    ipFlopBet: '33%', ipFlopRaise: '60%',
    ipTurnBet: '67%', ipTurnRaise: '60%',
    ipRiverBet: '67%', ipRiverRaise: '60%',
  }},
  '40bb': { pot: 100, stack: 175, betSizes: {
    oopFlopBet: '33%', oopFlopRaise: '60%',
    oopTurnBet: '50%', oopTurnRaise: '60%', oopTurnDonk: '',
    oopRiverBet: '67%', oopRiverRaise: '60%', oopRiverDonk: '',
    ipFlopBet: '33%', ipFlopRaise: '60%',
    ipTurnBet: '50%', ipTurnRaise: '60%',
    ipRiverBet: '67%', ipRiverRaise: '60%',
  }},
  '25bb': { pot: 100, stack: 100, betSizes: {
    oopFlopBet: '33%', oopFlopRaise: '60%',
    oopTurnBet: '50%', oopTurnRaise: '60%', oopTurnDonk: '',
    oopRiverBet: '67%', oopRiverRaise: '60%', oopRiverDonk: '',
    ipFlopBet: '33%', ipFlopRaise: '60%',
    ipTurnBet: '50%', ipTurnRaise: '60%',
    ipRiverBet: '67%', ipRiverRaise: '60%',
  }},
  '15bb': { pot: 100, stack: 50, betSizes: {
    oopFlopBet: '50%', oopFlopRaise: '60%',
    oopTurnBet: '67%', oopTurnRaise: '60%', oopTurnDonk: '',
    oopRiverBet: '67%', oopRiverRaise: '60%', oopRiverDonk: '',
    ipFlopBet: '50%', ipFlopRaise: '60%',
    ipTurnBet: '67%', ipTurnRaise: '60%',
    ipRiverBet: '67%', ipRiverRaise: '60%',
  }},
};

const DEPTH = getArg('depth', '100bb');
if (!DEPTH_CONFIGS[DEPTH]) {
  console.error(`[precompute] Unknown depth: ${DEPTH}. Valid: ${Object.keys(DEPTH_CONFIGS).join(', ')}`);
  process.exit(1);
}
const DEPTH_CFG = DEPTH_CONFIGS[DEPTH];
const STARTING_POT = DEPTH_CFG.pot;
const EFFECTIVE_STACK = DEPTH_CFG.stack;

// ---------------------------------------------------------------------------
// Card / Range utilities
// ---------------------------------------------------------------------------
const RANKS = '23456789TJQKA';
const SUITS = 'cdhs';

function cardId(rankChar, suitChar) {
  return 4 * RANKS.indexOf(rankChar) + SUITS.indexOf(suitChar);
}

function parseBoard(cards) {
  const board = new Uint8Array(cards.length);
  for (let i = 0; i < cards.length; i++) {
    board[i] = cardId(cards[i][0], cards[i][1]);
  }
  return board;
}

function cardPairIndex(c1, c2) {
  if (c1 > c2) { const tmp = c1; c1 = c2; c2 = tmp; }
  return c1 * (101 - c1) / 2 + c2 - 1;
}

function parseRange(text) {
  const range = new Float32Array(1326);
  if (!text || !text.trim()) return range;

  const parts = text.split(',');
  for (const raw of parts) {
    let part = raw.trim();
    if (!part) continue;

    let weight = 1.0;
    const colonIdx = part.indexOf(':');
    if (colonIdx >= 0) {
      weight = parseFloat(part.substring(colonIdx + 1));
      part = part.substring(0, colonIdx);
    }

    const dashIdx = part.indexOf('-');
    if (dashIdx >= 0) {
      const start = part.substring(0, dashIdx);
      const end = part.substring(dashIdx + 1);
      const hands = expandRange(start, end);
      for (const h of hands) setHandWeight(range, h, weight);
      continue;
    }

    setHandWeight(range, part, weight);
  }
  return range;
}

function expandRange(start, end) {
  const hands = [];
  if (start.length === 2 && start[0] === start[1] && end.length === 2 && end[0] === end[1]) {
    const r1 = RANKS.indexOf(start[0]);
    const r2 = RANKS.indexOf(end[0]);
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
      hands.push(RANKS[r] + RANKS[r]);
    }
  } else if (start.length === 3 && start[2] === 's' && end.length === 3 && end[2] === 's') {
    const high = RANKS.indexOf(start[0]);
    const r1 = RANKS.indexOf(start[1]);
    const r2 = RANKS.indexOf(end[1]);
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
      hands.push(RANKS[high] + RANKS[r] + 's');
    }
  } else if (start.length === 3 && start[2] === 'o' && end.length === 3 && end[2] === 'o') {
    const high = RANKS.indexOf(start[0]);
    const r1 = RANKS.indexOf(start[1]);
    const r2 = RANKS.indexOf(end[1]);
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
      hands.push(RANKS[high] + RANKS[r] + 'o');
    }
  }
  return hands;
}

function setHandWeight(range, hand, weight) {
  if (hand.length === 2 && hand[0] === hand[1]) {
    const r = RANKS.indexOf(hand[0]);
    for (let s1 = 0; s1 < 4; s1++)
      for (let s2 = s1 + 1; s2 < 4; s2++)
        range[cardPairIndex(4 * r + s1, 4 * r + s2)] = weight;
  } else if (hand.length === 3 && hand[2] === 's') {
    const r1 = RANKS.indexOf(hand[0]), r2 = RANKS.indexOf(hand[1]);
    for (let s = 0; s < 4; s++)
      range[cardPairIndex(4 * r1 + s, 4 * r2 + s)] = weight;
  } else if (hand.length === 3 && hand[2] === 'o') {
    const r1 = RANKS.indexOf(hand[0]), r2 = RANKS.indexOf(hand[1]);
    for (let s1 = 0; s1 < 4; s1++)
      for (let s2 = 0; s2 < 4; s2++) {
        if (s1 === s2) continue;
        range[cardPairIndex(4 * r1 + s1, 4 * r2 + s2)] = weight;
      }
  } else if (hand.length === 2 && hand[0] !== hand[1]) {
    const r1 = RANKS.indexOf(hand[0]), r2 = RANKS.indexOf(hand[1]);
    for (let s1 = 0; s1 < 4; s1++)
      for (let s2 = 0; s2 < 4; s2++) {
        const c1 = 4 * r1 + s1, c2 = 4 * r2 + s2;
        if (c1 !== c2) range[cardPairIndex(c1, c2)] = weight;
      }
  }
}

// ---------------------------------------------------------------------------
// Position matchup definitions
// ---------------------------------------------------------------------------

const MATCHUPS = {
  SB_vs_BB: {
    oop: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,' +
         'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
         'AKo,AQo,AJo,ATo,A9o,' +
         'KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,' +
         'KQo,KJo,KTo,' +
         'QJs,QTs,Q9s,Q8s,Q7s,' +
         'QJo,QTo,' +
         'JTs,J9s,J8s,J7s,' +
         'JTo,' +
         'T9s,T8s,T7s,' +
         '98s,97s,96s,' +
         '87s,86s,85s,' +
         '76s,75s,74s,' +
         '65s,64s,63s,' +
         '54s,53s,' +
         '43s',
    ip:  'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,' +
         'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
         'AKo,AQo,AJo,ATo,A9o,A8o,A7o,' +
         'KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,K4s,' +
         'KQo,KJo,KTo,K9o,' +
         'QJs,QTs,Q9s,Q8s,Q7s,Q6s,' +
         'QJo,QTo,Q9o,' +
         'JTs,J9s,J8s,J7s,J6s,' +
         'JTo,J9o,' +
         'T9s,T8s,T7s,T6s,' +
         'T9o,' +
         '98s,97s,96s,95s,' +
         '87s,86s,85s,84s,' +
         '76s,75s,74s,' +
         '65s,64s,63s,' +
         '54s,53s,52s,' +
         '43s,42s,32s'
  },
  BTN_vs_BB: {
    oop: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,' +
         'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
         'AKo,AQo,AJo,ATo,A9o,' +
         'KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,' +
         'KQo,KJo,KTo,' +
         'QJs,QTs,Q9s,Q8s,Q7s,' +
         'QJo,QTo,' +
         'JTs,J9s,J8s,' +
         'JTo,' +
         'T9s,T8s,T7s,' +
         '98s,97s,' +
         '87s,86s,' +
         '76s,75s,' +
         '65s,64s,' +
         '54s,53s,' +
         '43s',
    ip:  'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,' +
         'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,' +
         'AKo,AQo,AJo,ATo,A9o,' +
         'KQs,KJs,KTs,K9s,K8s,K7s,K6s,K5s,' +
         'KQo,KJo,KTo,K9o,' +
         'QJs,QTs,Q9s,Q8s,Q7s,' +
         'QJo,QTo,Q9o,' +
         'JTs,J9s,J8s,J7s,' +
         'JTo,J9o,' +
         'T9s,T8s,T7s,' +
         'T9o,' +
         '98s,97s,96s,' +
         '87s,86s,85s,' +
         '76s,75s,74s,' +
         '65s,64s,' +
         '54s,53s,' +
         '43s'
  },
  CO_vs_BB: {
    oop: 'AA,KK,QQ,JJ,TT,99,88,77,66,' +
         'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,' +
         'AKo,AQo,AJo,ATo,' +
         'KQs,KJs,KTs,K9s,K8s,' +
         'KQo,KJo,' +
         'QJs,QTs,Q9s,Q8s,' +
         'QJo,' +
         'JTs,J9s,J8s,' +
         'T9s,T8s,' +
         '98s,97s,' +
         '87s,86s,' +
         '76s,75s,' +
         '65s,64s,' +
         '54s',
    ip:  'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,' +
         'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,A3s,' +
         'AKo,AQo,AJo,ATo,' +
         'KQs,KJs,KTs,K9s,K8s,K7s,' +
         'KQo,KJo,KTo,' +
         'QJs,QTs,Q9s,Q8s,Q7s,' +
         'QJo,QTo,' +
         'JTs,J9s,J8s,' +
         'JTo,' +
         'T9s,T8s,T7s,' +
         '98s,97s,' +
         '87s,86s,' +
         '76s,75s,' +
         '65s,64s,' +
         '54s,53s'
  },
  UTG_vs_BB: {
    oop: 'AA,KK,QQ,JJ,TT,99,88,77,' +
         'AKs,AQs,AJs,ATs,A9s,A5s,' +
         'AKo,AQo,AJo,' +
         'KQs,KJs,KTs,' +
         'QJs,QTs,' +
         'JTs,T9s,' +
         '98s,87s,76s,65s',
    ip:  'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,' +
         'AKs,AQs,AJs,ATs,A9s,A8s,A7s,A5s,A4s,A3s,' +
         'AKo,AQo,AJo,ATo,' +
         'KQs,KJs,KTs,K9s,K8s,K7s,' +
         'KQo,KJo,KTo,' +
         'QJs,QTs,Q9s,Q8s,' +
         'QJo,QTo,' +
         'JTs,J9s,J8s,' +
         'JTo,' +
         'T9s,T8s,' +
         '98s,97s,' +
         '87s,86s,' +
         '76s,75s,' +
         '65s,64s,' +
         '54s'
  },
  BTN_vs_SB: {
    oop: 'AA,KK,QQ,JJ,TT,99,88,77,' +
         'AKs,AQs,AJs,ATs,A9s,A8s,A7s,' +
         'A5s,A4s,A3s,A2s,' +
         'AKo,AQo,AJo,ATo,' +
         'KQs,KJs,KTs,K9s,' +
         'KQo,KJo,' +
         'QJs,QTs,Q9s,' +
         'JTs,J9s,' +
         'T9s,98s,' +
         '87s,76s,65s',
    ip:  'AA,KK,QQ,JJ,TT,99,88,77,66,' +
         'AKs,AQs,AJs,ATs,A9s,A8s,' +
         'A5s,A4s,' +
         'AKo,AQo,AJo,ATo,' +
         'KQs,KJs,KTs,K9s,' +
         'KQo,KJo,' +
         'QJs,QTs,Q9s,' +
         'QJo,' +
         'JTs,J9s,' +
         'T9s,T8s,' +
         '98s,97s,' +
         '87s,86s,' +
         '76s,65s,54s'
  }
};

// ---------------------------------------------------------------------------
// Board definitions
// ---------------------------------------------------------------------------

const FLOP_BOARDS = [
  { board: ['Ac','7d','2h'], texture: 'dry_rainbow',      label: 'A72r' },
  { board: ['Ks','8d','3h'], texture: 'dry_rainbow',      label: 'K83r' },
  { board: ['Qh','6c','2d'], texture: 'dry_rainbow',      label: 'Q62r' },
  { board: ['Ad','Td','5h'], texture: 'dry_twotone',      label: 'AT5dd' },
  { board: ['Kh','9h','2c'], texture: 'dry_twotone',      label: 'K92hh' },
  { board: ['Qc','7c','4d'], texture: 'dry_twotone',      label: 'Q74cc' },
  { board: ['Jc','Td','9h'], texture: 'wet_rainbow',      label: 'JT9r' },
  { board: ['Th','8c','7d'], texture: 'wet_rainbow',      label: 'T87r' },
  { board: ['9s','8c','7d'], texture: 'wet_rainbow',      label: '987r' },
  { board: ['Jd','Td','8h'], texture: 'wet_twotone',      label: 'JT8dd' },
  { board: ['Th','9h','7c'], texture: 'wet_twotone',      label: 'T97hh' },
  { board: ['8c','7c','6d'], texture: 'wet_twotone',      label: '876cc' },
  { board: ['Ks','Ts','4s'], texture: 'monotone',         label: 'KT4sss' },
  { board: ['Qh','7h','3h'], texture: 'monotone',         label: 'Q73hhh' },
  { board: ['Kd','Kh','4c'], texture: 'paired_dry',       label: 'KK4r' },
  { board: ['7c','7d','2h'], texture: 'paired_dry',       label: '772r' },
  { board: ['As','Ah','8c'], texture: 'paired_dry',       label: 'AA8r' },
  { board: ['Ac','Kd','Jh'], texture: 'highly_connected', label: 'AKJr' },
  { board: ['Kh','Qd','Tc'], texture: 'highly_connected', label: 'KQTr' },
  { board: ['As','Qd','Jc'], texture: 'highly_connected', label: 'AQJr' },
  { board: ['5d','3h','2c'], texture: 'dry_rainbow',      label: '532r' },
  { board: ['6c','4d','3h'], texture: 'wet_rainbow',      label: '643r' },
  { board: ['7h','5d','4c'], texture: 'wet_rainbow',      label: '754r' },
];

// ---------------------------------------------------------------------------
// Bet sizing: from depth config (varies by stack depth)
// This keeps the game tree small enough for practical batch solving.
// The check/bet frequencies still provide actionable GTO insight.
// ---------------------------------------------------------------------------
const BET_SIZES = DEPTH_CFG.betSizes;

// ---------------------------------------------------------------------------
// Child process mode: solve a single spot
// ---------------------------------------------------------------------------
if (IS_CHILD) {
  const config = JSON.parse(getArg('child', '{}'));

  const wasmPath = join(PROJECT_ROOT, 'js', 'solver', 'pkg', 'gto_solver_wasm_bg.wasm');
  const gluePath = join(PROJECT_ROOT, 'js', 'solver', 'pkg', 'gto_solver_wasm.js');
  const wasmBytes = readFileSync(wasmPath);
  const glue = await import(gluePath);
  glue.initSync({ module: wasmBytes });
  const { GameManager } = glue;

  const oopRange = parseRange(config.oopRange);
  const ipRange = parseRange(config.ipRange);
  const board = parseBoard(config.board);

  const manager = GameManager.new();
  const err = manager.init(
    oopRange, ipRange, board,
    STARTING_POT, EFFECTIVE_STACK,
    0, 0, false,
    BET_SIZES.oopFlopBet, BET_SIZES.oopFlopRaise,
    BET_SIZES.oopTurnBet, BET_SIZES.oopTurnRaise, BET_SIZES.oopTurnDonk,
    BET_SIZES.oopRiverBet, BET_SIZES.oopRiverRaise, BET_SIZES.oopRiverDonk,
    BET_SIZES.ipFlopBet, BET_SIZES.ipFlopRaise,
    BET_SIZES.ipTurnBet, BET_SIZES.ipTurnRaise,
    BET_SIZES.ipRiverBet, BET_SIZES.ipRiverRaise,
    1.5, 0.15, 0.1, '', ''
  );

  if (err) {
    console.log(JSON.stringify({ error: err }));
    process.exit(0);
  }

  manager.allocate_memory(true);

  const target = STARTING_POT * TARGET_EXPLOIT_PCT / 100;
  let iteration = 0;
  let exploit = manager.exploitability();

  while (iteration < MAX_ITERATIONS && exploit > target) {
    const batchSize = iteration < 20 ? 1 : 10;
    for (let i = 0; i < batchSize && iteration < MAX_ITERATIONS; i++) {
      manager.solve_step(iteration);
      iteration++;
    }
    exploit = manager.exploitability();
  }

  manager.finalize();

  const results = manager.get_results();
  const actions = manager.actions();
  const player = manager.current_player();
  const numActions = manager.num_actions();
  const oopCards = manager.private_cards(0);
  const ipCards = manager.private_cards(1);

  const oopLen = oopCards.length;
  const ipLen = ipCards.length;

  let offset = 0;
  const oopPot = results[offset++];
  const ipPot = results[offset++];
  const isEmptyFlag = results[offset++];

  const oopWeights = Array.from(results.slice(offset, offset + oopLen));
  offset += oopLen;
  const ipWeights = Array.from(results.slice(offset, offset + ipLen));
  offset += ipLen;

  // Skip normalized weights
  offset += oopLen + ipLen;

  let avgEquity = [0, 0];
  let avgEV = [0, 0];

  if (isEmptyFlag === 0) {
    const oopEquity = Array.from(results.slice(offset, offset + oopLen));
    offset += oopLen;
    const ipEquity = Array.from(results.slice(offset, offset + ipLen));
    offset += ipLen;
    const oopEV = Array.from(results.slice(offset, offset + oopLen));
    offset += oopLen;
    const ipEV = Array.from(results.slice(offset, offset + ipLen));
    offset += ipLen;

    // Skip EQR
    offset += oopLen + ipLen;

    for (let p = 0; p < 2; p++) {
      const eq = p === 0 ? oopEquity : ipEquity;
      const ev = p === 0 ? oopEV : ipEV;
      const w = p === 0 ? oopWeights : ipWeights;
      const len = p === 0 ? oopLen : ipLen;
      let wSum = 0, eqSum = 0, evSum = 0;
      for (let i = 0; i < len; i++) {
        wSum += w[i]; eqSum += eq[i] * w[i]; evSum += ev[i] * w[i];
      }
      if (wSum > 0) {
        avgEquity[p] = Math.round(eqSum / wSum * 1000) / 1000;
        avgEV[p] = Math.round(evSum / wSum * 100) / 100;
      }
    }
  }

  // Strategy
  let aggregateStrategy = null;
  if (player !== 'terminal' && player !== 'chance') {
    const activeLen = player === 'oop' ? oopLen : ipLen;
    const activeWeights = player === 'oop' ? oopWeights : ipWeights;
    const strategyLen = numActions * activeLen;
    const strategy = Array.from(results.slice(offset, offset + strategyLen));

    aggregateStrategy = [];
    let totalWeight = 0;
    for (let c = 0; c < activeLen; c++) totalWeight += activeWeights[c];
    for (let a = 0; a < numActions; a++) {
      let sum = 0;
      for (let c = 0; c < activeLen; c++) {
        sum += strategy[a * activeLen + c] * activeWeights[c];
      }
      aggregateStrategy.push(totalWeight > 0 ? Math.round(sum / totalWeight * 1000) / 1000 : 0);
    }
  }

  console.log(JSON.stringify({
    iterations: iteration,
    exploitability: Math.round(exploit * 1000) / 1000,
    actions: actions,
    player: player,
    numActions: numActions,
    strategy: aggregateStrategy,
    oopEquity: avgEquity[0],
    ipEquity: avgEquity[1],
    oopEV: avgEV[0],
    ipEV: avgEV[1],
    oopCombos: oopLen,
    ipCombos: ipLen,
  }));

  process.exit(0);
}

// ---------------------------------------------------------------------------
// Parent process: orchestrate child processes for each spot
// ---------------------------------------------------------------------------

function solveInChildProcess(matchupKey, matchup, flopDef) {
  return new Promise((resolve) => {
    const config = {
      oopRange: matchup.oop,
      ipRange: matchup.ip,
      board: flopDef.board,
    };

    const configStr = JSON.stringify(config);
    const child = fork(__filename, [
      '--child', configStr,
      '--iterations', String(MAX_ITERATIONS),
      '--target', String(TARGET_EXPLOIT_PCT),
      '--depth', DEPTH,
    ], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      execArgv: ['--max-old-space-size=4096'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      resolve({ error: 'timeout (10 min)' });
    }, 600000);  // 10 min timeout

    child.on('exit', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        const lastErr = stderr.trim().split('\n').slice(-3).join(' | ');
        resolve({ error: `exit code ${code}: ${lastErr}` });
        return;
      }
      try {
        // Find the last line that looks like JSON
        const lines = stdout.trim().split('\n');
        const jsonLine = lines.filter(l => l.startsWith('{')).pop();
        if (!jsonLine) {
          resolve({ error: `no JSON output. stdout: ${stdout.slice(0, 200)}` });
          return;
        }
        const result = JSON.parse(jsonLine);
        resolve(result);
      } catch (e) {
        resolve({ error: `parse error: ${e.message}. stdout: ${stdout.slice(0, 200)}` });
      }
    });
  });
}

async function main() {
  // Load existing solutions (incremental build)
  const suffix = DEPTH === '100bb' ? '' : `-${DEPTH}`;
  const outputPath = join(PROJECT_ROOT, 'js', 'data', `postflop-solutions${suffix}.js`);
  let existingSolutions = {};
  if (existsSync(outputPath)) {
    try {
      const content = readFileSync(outputPath, 'utf-8');
      const match = content.match(/GTO\.Data\.PostflopSolutions[A-Za-z0-9_]*\s*=\s*(\{[\s\S]*\});/);
      if (match) existingSolutions = JSON.parse(match[1]);
    } catch (e) {
      // Fresh start
    }
  }

  const solutions = { ...existingSolutions };
  const matchupKeys = FILTER_MATCHUP
    ? [FILTER_MATCHUP]
    : Object.keys(MATCHUPS);
  const boards = FILTER_BOARD
    ? FLOP_BOARDS.filter(b => b.label === FILTER_BOARD)
    : FLOP_BOARDS;

  const totalSpots = matchupKeys.length * boards.length;
  let spotNum = 0;
  let errors = 0;
  let skipped = 0;

  console.log(`[precompute] Depth: ${DEPTH} (pot=${STARTING_POT}, stack=${EFFECTIVE_STACK}, SPR=${(EFFECTIVE_STACK/STARTING_POT).toFixed(1)})`);
  console.log(`[precompute] Solving ${totalSpots} spots (${matchupKeys.length} matchups x ${boards.length} boards)`);
  console.log(`[precompute] Max iterations: ${MAX_ITERATIONS}, Target exploitability: ${TARGET_EXPLOIT_PCT}% pot`);
  console.log(`[precompute] Bet sizes: flop ${BET_SIZES.ipFlopBet}, turn ${BET_SIZES.ipTurnBet}, river ${BET_SIZES.ipRiverBet}, raises ${BET_SIZES.ipFlopRaise}`);
  console.log(`[precompute] Output: postflop-solutions${suffix}.js`);
  console.log(`[precompute] Each spot runs in a child process with fresh WASM memory`);
  console.log('');

  for (const matchupKey of matchupKeys) {
    if (!MATCHUPS[matchupKey]) {
      console.log(`[precompute] Unknown matchup: ${matchupKey}`);
      continue;
    }
    const matchup = MATCHUPS[matchupKey];
    if (!solutions[matchupKey]) solutions[matchupKey] = {};

    for (const flopDef of boards) {
      spotNum++;
      const key = flopDef.label;

      // Skip if already solved (incremental build)
      if (solutions[matchupKey][key] && !solutions[matchupKey][key].error && !FILTER_BOARD && !FILTER_MATCHUP) {
        skipped++;
        console.log(`[precompute] [${spotNum}/${totalSpots}] ${matchupKey}/${key} — already solved, skipping`);
        continue;
      }

      const startTime = Date.now();
      console.log(`[precompute] [${spotNum}/${totalSpots}] ${matchupKey}/${key} — solving...`);

      const result = await solveInChildProcess(matchupKey, matchup, flopDef);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (result.error) {
        console.log(`  ERROR: ${result.error} (${elapsed}s)`);
        errors++;
        solutions[matchupKey][key] = { error: result.error };
      } else {
        console.log(`  OK: ${result.iterations} iter, exploit=${result.exploitability}, actions=${result.actions} (${elapsed}s)`);
        solutions[matchupKey][key] = {
          board: flopDef.board.join(''),
          texture: flopDef.texture,
          actions: result.actions,
          player: result.player,
          numActions: result.numActions,
          strategy: result.strategy,
          oopEquity: result.oopEquity,
          ipEquity: result.ipEquity,
          oopEV: result.oopEV,
          ipEV: result.ipEV,
          exploitability: result.exploitability,
          iterations: result.iterations,
          oopCombos: result.oopCombos,
          ipCombos: result.ipCombos,
        };
      }

      // Save after each spot (incremental)
      writeSolutions(solutions, outputPath, totalSpots, errors, skipped);
    }
  }

  console.log(`\n[precompute] Done. ${totalSpots - errors - skipped} solved, ${skipped} skipped, ${errors} errors.`);
  console.log(`[precompute] Output: ${outputPath}`);

  // Write index (per-depth)
  const indexData = {
    depth: DEPTH,
    matchups: Object.keys(MATCHUPS),
    boards: FLOP_BOARDS.map(b => ({ label: b.label, board: b.board.join(''), texture: b.texture })),
    settings: { pot: STARTING_POT, stack: EFFECTIVE_STACK, maxIterations: MAX_ITERATIONS, targetExploitability: TARGET_EXPLOIT_PCT, betSizes: BET_SIZES },
    generated: new Date().toISOString()
  };
  const indexPath = join(PROJECT_ROOT, 'js', 'data', `postflop-solution-index${suffix}.js`);
  const varSuffix = DEPTH === '100bb' ? '' : '_' + DEPTH.replace('bb', 'BB');
  const indexContent = `// Pre-computed Postflop Solutions — Index/Metadata (${DEPTH})\n// Auto-generated by scripts/precompute-postflop.mjs\n\nwindow.GTO = window.GTO || {};\nGTO.Data = GTO.Data || {};\n\nGTO.Data.PostflopSolutionIndex${varSuffix} = ${JSON.stringify(indexData, null, 2)};\n`;
  writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`[precompute] Index: ${indexPath}`);
}

function writeSolutions(solutions, outputPath, totalSpots, errors, skipped) {
  const varSuffix = DEPTH === '100bb' ? '' : '_' + DEPTH.replace('bb', 'BB');
  const header = `// ============================================================================
// Pre-computed Postflop Solutions (${DEPTH})
// ============================================================================
// Auto-generated by scripts/precompute-postflop.mjs
// Generated: ${new Date().toISOString()}
// Depth: ${DEPTH} (pot=${STARTING_POT}, stack=${EFFECTIVE_STACK}, SPR=${(EFFECTIVE_STACK/STARTING_POT).toFixed(1)})
// Spots: ${totalSpots - errors - skipped} solved
// Settings: ${MAX_ITERATIONS} max iterations, ${TARGET_EXPLOIT_PCT}% target exploitability
// Bet sizes: flop ${BET_SIZES.ipFlopBet}, turn ${BET_SIZES.ipTurnBet}, river ${BET_SIZES.ipRiverBet}
// ============================================================================

window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

GTO.Data.PostflopSolutions${varSuffix} = `;

  const json = JSON.stringify(solutions, null, 2);
  writeFileSync(outputPath, header + json + ';\n', 'utf-8');
}

main().catch(err => {
  console.error('[precompute] Fatal error:', err);
  process.exit(1);
});
