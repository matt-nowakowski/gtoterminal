// ============================================================================
// Postflop Matchup Definitions — Client-side Data
// ============================================================================
// Extracted from scripts/precompute-postflop.mjs for browser use.
// Provides matchup ranges, board definitions, texture classifications,
// and depth configurations for the Explore postflop solver UI.
// ============================================================================

window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

// ---------------------------------------------------------------------------
// Position matchup ranges (OOP = out of position, IP = in position)
// These are the same ranges used by the precompute solver script.
// ---------------------------------------------------------------------------
GTO.Data.PostflopMatchups = {
  SB_vs_BB: {
    label: 'SB vs BB',
    oop: 'SB',
    ip: 'BB',
    oopRange: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,' +
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
    ipRange: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,' +
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
    label: 'BTN vs BB',
    oop: 'BTN',
    ip: 'BB',
    oopRange: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,' +
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
    ipRange: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,' +
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
    label: 'CO vs BB',
    oop: 'CO',
    ip: 'BB',
    oopRange: 'AA,KK,QQ,JJ,TT,99,88,77,66,' +
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
    ipRange: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,' +
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
    label: 'UTG vs BB',
    oop: 'UTG',
    ip: 'BB',
    oopRange: 'AA,KK,QQ,JJ,TT,99,88,77,' +
      'AKs,AQs,AJs,ATs,A9s,A5s,' +
      'AKo,AQo,AJo,' +
      'KQs,KJs,KTs,' +
      'QJs,QTs,' +
      'JTs,T9s,' +
      '98s,87s,76s,65s',
    ipRange: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,' +
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
    label: 'BTN vs SB',
    oop: 'BTN',
    ip: 'SB',
    oopRange: 'AA,KK,QQ,JJ,TT,99,88,77,' +
      'AKs,AQs,AJs,ATs,A9s,A8s,A7s,' +
      'A5s,A4s,A3s,A2s,' +
      'AKo,AQo,AJo,ATo,' +
      'KQs,KJs,KTs,K9s,' +
      'KQo,KJo,' +
      'QJs,QTs,Q9s,' +
      'JTs,J9s,' +
      'T9s,98s,' +
      '87s,76s,65s',
    ipRange: 'AA,KK,QQ,JJ,TT,99,88,77,66,' +
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
// Board definitions with texture classification
// ---------------------------------------------------------------------------
GTO.Data.PostflopBoards = [
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
  { board: ['7h','5d','4c'], texture: 'wet_rainbow',      label: '754r' }
];

// ---------------------------------------------------------------------------
// Texture → board label mapping for UI filter
// ---------------------------------------------------------------------------
GTO.Data.PostflopTextures = {
  dry_rainbow:      { label: 'Dry Rainbow',  boards: ['A72r', 'K83r', 'Q62r', '532r'] },
  dry_twotone:      { label: 'Dry Two-tone', boards: ['AT5dd', 'K92hh', 'Q74cc'] },
  wet_rainbow:      { label: 'Wet Rainbow',  boards: ['JT9r', 'T87r', '987r', '643r', '754r'] },
  wet_twotone:      { label: 'Wet Two-tone', boards: ['JT8dd', 'T97hh', '876cc'] },
  monotone:         { label: 'Monotone',     boards: ['KT4sss', 'Q73hhh'] },
  paired_dry:       { label: 'Paired',       boards: ['KK4r', '772r', 'AA8r'] },
  highly_connected: { label: 'Broadway',     boards: ['AKJr', 'KQTr', 'AQJr'] }
};

// ---------------------------------------------------------------------------
// Depth configurations (pot normalized to 100)
// ---------------------------------------------------------------------------
GTO.Data.PostflopDepths = {
  '100bb': { pot: 100, stack: 450, label: '100bb' },
  '40bb':  { pot: 100, stack: 175, label: '40bb' },
  '25bb':  { pot: 100, stack: 100, label: '25bb' },
  '15bb':  { pot: 100, stack: 50,  label: '15bb' }
};
