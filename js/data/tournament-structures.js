// ============================================================================
// Tournament Structures — Payout presets + stack generator
// ============================================================================
// Provides common tournament payout structures and a realistic table
// stack generator for ICM calculations. Used by scenario-generator.js
// and tournament-drill.js when format=MTT.
// ============================================================================

window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

GTO.Data.TournamentStructures = {

  // -----------------------------------------------------------------------
  // Payout presets — fractions of prize pool
  // -----------------------------------------------------------------------
  presets: {
    '6max_sng': {
      label: '6-Max SNG',
      players: 6,
      payouts: [0.65, 0.35]
    },
    '9max_sng': {
      label: '9-Max SNG',
      players: 9,
      payouts: [0.50, 0.30, 0.20]
    },
    'mtt_ft': {
      label: 'MTT Final Table',
      players: 9,
      payouts: [0.30, 0.20, 0.14, 0.10, 0.08, 0.06, 0.05, 0.04, 0.03]
    },
    'mtt_turbo': {
      label: 'MTT Turbo',
      players: 6,
      payouts: [0.40, 0.28, 0.18, 0.14]
    },
    'satellite': {
      label: 'Satellite (2 seats)',
      players: 6,
      payouts: [0.50, 0.50]
    },
    'pko': {
      label: 'PKO (30% bounty)',
      players: 9,
      payouts: [0.21, 0.14, 0.10, 0.07, 0.05, 0.04, 0.04, 0.03, 0.02],
      bountyPct: 0.30
    }
  },

  // -----------------------------------------------------------------------
  // Get structure by key, with fallback
  // -----------------------------------------------------------------------
  get: function(key) {
    return this.presets[key] || this.presets['9max_sng'];
  },

  // -----------------------------------------------------------------------
  // Convert payout fractions to dollar amounts
  // @param {string} structureKey
  // @param {number} buyIn - buy-in amount (default 100)
  // @returns {number[]} dollar prize amounts
  // -----------------------------------------------------------------------
  getPrizes: function(structureKey, buyIn) {
    var structure = this.get(structureKey);
    buyIn = buyIn || 100;
    var prizePool = buyIn * structure.players;
    return structure.payouts.map(function(p) { return p * prizePool; });
  },

  // -----------------------------------------------------------------------
  // Generate realistic table stacks
  // @param {Object} config
  // @param {number}  config.players     - number of players at table (2-9)
  // @param {number}  config.heroIdx     - hero's seat index (0-based)
  // @param {number}  config.heroStackBB - hero's stack in BB
  // @param {number}  config.avgStackBB  - average stack in BB (default: derived)
  // @param {string}  config.stage       - 'early'|'normal'|'bubble'|'ft'
  // @returns {number[]} array of stacks in BB
  // -----------------------------------------------------------------------
  generateTableStacks: function(config) {
    var players = config.players || 6;
    var heroIdx = config.heroIdx || 0;
    var heroStack = config.heroStackBB || 15;
    var stage = config.stage || 'normal';

    // Average stack derived from hero stack if not provided
    var avgStack = config.avgStackBB || heroStack;

    // Variance multiplier by stage
    var varianceMap = {
      'early':  0.15,  // tight distribution
      'normal': 0.35,  // moderate
      'bubble': 0.55,  // wide — some short stacks
      'ft':     0.70   // very wide — chip leaders + short stacks
    };
    var variance = varianceMap[stage] || 0.35;

    var stacks = [];
    var totalTarget = avgStack * players;
    var remaining = totalTarget - heroStack;

    for (var i = 0; i < players; i++) {
      if (i === heroIdx) {
        stacks.push(heroStack);
        continue;
      }

      // Generate stack with normal-ish distribution around average
      var othersLeft = players - stacks.length;
      var expectedPer = remaining / Math.max(1, othersLeft - (i > heroIdx ? 0 : 1));

      // Random factor with stage-based variance
      var factor = 1.0 + (Math.random() * 2 - 1) * variance;

      // Ensure minimum 1bb stack
      var stack = Math.max(1, Math.round(expectedPer * factor));

      // Don't let any single player eat all remaining chips
      var maxAllowed = remaining - (players - i - 1 - (i < heroIdx ? 1 : 0));
      stack = Math.min(stack, Math.max(1, maxAllowed));

      stacks.push(stack);
      if (i !== heroIdx) remaining -= stack;
    }

    // Stage-specific adjustments
    if (stage === 'bubble') {
      // Ensure at least one short stack (< 5bb)
      this._ensureShortStack(stacks, heroIdx, 5);
    } else if (stage === 'ft') {
      // Ensure one big stack (2x+ average) and one short stack
      this._ensureBigStack(stacks, heroIdx, avgStack * 2);
      this._ensureShortStack(stacks, heroIdx, 5);
    }

    return stacks;
  },

  // -----------------------------------------------------------------------
  // Pick a random stage weighted towards interesting spots
  // -----------------------------------------------------------------------
  randomStage: function() {
    var roll = Math.random();
    if (roll < 0.15) return 'early';
    if (roll < 0.50) return 'normal';
    if (roll < 0.80) return 'bubble';
    return 'ft';
  },

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------
  _ensureShortStack: function(stacks, heroIdx, maxBB) {
    // Find a non-hero player with a large stack, give some to make another short
    var shortIdx = -1;
    for (var i = 0; i < stacks.length; i++) {
      if (i !== heroIdx && stacks[i] > maxBB * 2) {
        shortIdx = i;
        break;
      }
    }
    if (shortIdx === -1) return;

    // Find another non-hero player to make short
    for (var i = 0; i < stacks.length; i++) {
      if (i !== heroIdx && i !== shortIdx && stacks[i] > maxBB) {
        var transfer = stacks[i] - Math.max(1, Math.floor(Math.random() * maxBB));
        stacks[shortIdx] += transfer;
        stacks[i] -= transfer;
        return;
      }
    }
  },

  _ensureBigStack: function(stacks, heroIdx, minBB) {
    // Check if someone already has a big stack
    for (var i = 0; i < stacks.length; i++) {
      if (i !== heroIdx && stacks[i] >= minBB) return;
    }
    // Consolidate chips to create one big stack
    var bigIdx = -1;
    var donorIdx = -1;
    for (var i = 0; i < stacks.length; i++) {
      if (i === heroIdx) continue;
      if (bigIdx === -1) { bigIdx = i; continue; }
      if (donorIdx === -1) { donorIdx = i; break; }
    }
    if (bigIdx !== -1 && donorIdx !== -1) {
      var transfer = Math.floor(stacks[donorIdx] * 0.5);
      stacks[bigIdx] += transfer;
      stacks[donorIdx] -= transfer;
    }
  }
};
