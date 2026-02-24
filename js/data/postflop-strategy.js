window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

// Heuristic-Based Postflop Action Frequency Data
// Structure: GTO.Data.PostflopStrategy[spotType][boardTexture][handStrength] = action frequencies
// Betting spots: { check, bet_33, bet_67, bet_100 } summing to ~1.0
// Facing bet spots: { fold, call, raise } summing to ~1.0
//
// 12 spot categories x 8 board textures x 18 hand strengths x 3 SPR tiers
// Based on modern 6-max NLH solver heuristics

(function() {
  'use strict';

  // -------------------------------------------------------------------------
  // Constants
  // -------------------------------------------------------------------------

  var BOARD_TEXTURES = [
    'dry_rainbow', 'dry_twotone', 'wet_rainbow', 'wet_twotone',
    'monotone', 'paired_dry', 'paired_wet', 'highly_connected'
  ];

  var HAND_STRENGTHS = [
    'air', 'overcards', 'weak_draw', 'gutshot', 'combo_draw', 'oesd_or_fd',
    'underpair', 'weak_pair', 'second_pair', 'top_pair_weak', 'top_pair_strong',
    'overpair', 'two_pair', 'trips', 'set', 'straight', 'flush', 'full_house'
  ];

  // -------------------------------------------------------------------------
  // Utility: clamp, normalize, round
  // -------------------------------------------------------------------------

  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  function normalizeBet(obj) {
    var s = obj.check + obj.bet_33 + obj.bet_67 + obj.bet_100;
    if (s === 0) return { check: 1, bet_33: 0, bet_67: 0, bet_100: 0 };
    var r = {
      check:   Math.round(obj.check   / s * 100) / 100,
      bet_33:  Math.round(obj.bet_33  / s * 100) / 100,
      bet_67:  Math.round(obj.bet_67  / s * 100) / 100,
      bet_100: Math.round(obj.bet_100 / s * 100) / 100
    };
    var diff = 1.0 - (r.check + r.bet_33 + r.bet_67 + r.bet_100);
    r.check = Math.round((r.check + diff) * 100) / 100;
    return r;
  }

  function normalizeFacing(obj) {
    var s = obj.fold + obj.call + obj.raise;
    if (s === 0) return { fold: 1, call: 0, raise: 0 };
    var r = {
      fold:  Math.round(obj.fold  / s * 100) / 100,
      call:  Math.round(obj.call  / s * 100) / 100,
      raise: Math.round(obj.raise / s * 100) / 100
    };
    var diff = 1.0 - (r.fold + r.call + r.raise);
    r.fold = Math.round((r.fold + diff) * 100) / 100;
    return r;
  }

  // -------------------------------------------------------------------------
  // Base frequencies per hand strength for each of the 12 spot categories
  // 18 hand strengths per spot
  // -------------------------------------------------------------------------

  // ----- BETTING SPOTS (actions: check, bet_33, bet_67, bet_100) -----

  // IP c-bet flop: high frequency ~70%, mostly small sizing
  var base_IP_cbet_flop = {
    air:              { check: 0.35, bet_33: 0.45, bet_67: 0.15, bet_100: 0.05 },
    overcards:        { check: 0.28, bet_33: 0.48, bet_67: 0.18, bet_100: 0.06 },
    weak_draw:        { check: 0.30, bet_33: 0.40, bet_67: 0.20, bet_100: 0.10 },
    gutshot:          { check: 0.25, bet_33: 0.42, bet_67: 0.23, bet_100: 0.10 },
    combo_draw:       { check: 0.15, bet_33: 0.25, bet_67: 0.30, bet_100: 0.30 },
    oesd_or_fd:       { check: 0.20, bet_33: 0.30, bet_67: 0.30, bet_100: 0.20 },
    underpair:        { check: 0.45, bet_33: 0.35, bet_67: 0.13, bet_100: 0.07 },
    weak_pair:        { check: 0.40, bet_33: 0.40, bet_67: 0.15, bet_100: 0.05 },
    second_pair:      { check: 0.35, bet_33: 0.42, bet_67: 0.18, bet_100: 0.05 },
    top_pair_weak:    { check: 0.20, bet_33: 0.45, bet_67: 0.25, bet_100: 0.10 },
    top_pair_strong:  { check: 0.15, bet_33: 0.40, bet_67: 0.30, bet_100: 0.15 },
    overpair:         { check: 0.18, bet_33: 0.35, bet_67: 0.30, bet_100: 0.17 },
    two_pair:         { check: 0.22, bet_33: 0.20, bet_67: 0.28, bet_100: 0.30 },
    trips:            { check: 0.35, bet_33: 0.18, bet_67: 0.22, bet_100: 0.25 },
    set:              { check: 0.30, bet_33: 0.15, bet_67: 0.25, bet_100: 0.30 },
    straight:         { check: 0.20, bet_33: 0.12, bet_67: 0.30, bet_100: 0.38 },
    flush:            { check: 0.18, bet_33: 0.10, bet_67: 0.28, bet_100: 0.44 },
    full_house:       { check: 0.40, bet_33: 0.10, bet_67: 0.15, bet_100: 0.35 }
  };

  // OOP c-bet flop: lower frequency ~45%, more checking
  var base_OOP_cbet_flop = {
    air:              { check: 0.55, bet_33: 0.30, bet_67: 0.10, bet_100: 0.05 },
    overcards:        { check: 0.48, bet_33: 0.32, bet_67: 0.14, bet_100: 0.06 },
    weak_draw:        { check: 0.50, bet_33: 0.28, bet_67: 0.15, bet_100: 0.07 },
    gutshot:          { check: 0.45, bet_33: 0.30, bet_67: 0.17, bet_100: 0.08 },
    combo_draw:       { check: 0.25, bet_33: 0.22, bet_67: 0.28, bet_100: 0.25 },
    oesd_or_fd:       { check: 0.35, bet_33: 0.25, bet_67: 0.25, bet_100: 0.15 },
    underpair:        { check: 0.60, bet_33: 0.25, bet_67: 0.10, bet_100: 0.05 },
    weak_pair:        { check: 0.55, bet_33: 0.30, bet_67: 0.10, bet_100: 0.05 },
    second_pair:      { check: 0.50, bet_33: 0.32, bet_67: 0.13, bet_100: 0.05 },
    top_pair_weak:    { check: 0.35, bet_33: 0.38, bet_67: 0.20, bet_100: 0.07 },
    top_pair_strong:  { check: 0.25, bet_33: 0.35, bet_67: 0.25, bet_100: 0.15 },
    overpair:         { check: 0.28, bet_33: 0.30, bet_67: 0.27, bet_100: 0.15 },
    two_pair:         { check: 0.28, bet_33: 0.15, bet_67: 0.27, bet_100: 0.30 },
    trips:            { check: 0.38, bet_33: 0.12, bet_67: 0.22, bet_100: 0.28 },
    set:              { check: 0.32, bet_33: 0.10, bet_67: 0.25, bet_100: 0.33 },
    straight:         { check: 0.22, bet_33: 0.10, bet_67: 0.28, bet_100: 0.40 },
    flush:            { check: 0.20, bet_33: 0.08, bet_67: 0.27, bet_100: 0.45 },
    full_house:       { check: 0.42, bet_33: 0.08, bet_67: 0.15, bet_100: 0.35 }
  };

  // IP turn barrel: more polarized — strong hands & bluffs bet, medium checks
  var base_IP_turn_barrel = {
    air:              { check: 0.50, bet_33: 0.20, bet_67: 0.20, bet_100: 0.10 },
    overcards:        { check: 0.55, bet_33: 0.22, bet_67: 0.15, bet_100: 0.08 },
    weak_draw:        { check: 0.55, bet_33: 0.18, bet_67: 0.17, bet_100: 0.10 },
    gutshot:          { check: 0.45, bet_33: 0.20, bet_67: 0.25, bet_100: 0.10 },
    combo_draw:       { check: 0.20, bet_33: 0.12, bet_67: 0.33, bet_100: 0.35 },
    oesd_or_fd:       { check: 0.30, bet_33: 0.15, bet_67: 0.30, bet_100: 0.25 },
    underpair:        { check: 0.70, bet_33: 0.18, bet_67: 0.08, bet_100: 0.04 },
    weak_pair:        { check: 0.65, bet_33: 0.20, bet_67: 0.10, bet_100: 0.05 },
    second_pair:      { check: 0.60, bet_33: 0.22, bet_67: 0.13, bet_100: 0.05 },
    top_pair_weak:    { check: 0.40, bet_33: 0.25, bet_67: 0.25, bet_100: 0.10 },
    top_pair_strong:  { check: 0.20, bet_33: 0.25, bet_67: 0.35, bet_100: 0.20 },
    overpair:         { check: 0.22, bet_33: 0.20, bet_67: 0.35, bet_100: 0.23 },
    two_pair:         { check: 0.15, bet_33: 0.12, bet_67: 0.33, bet_100: 0.40 },
    trips:            { check: 0.25, bet_33: 0.10, bet_67: 0.28, bet_100: 0.37 },
    set:              { check: 0.18, bet_33: 0.08, bet_67: 0.30, bet_100: 0.44 },
    straight:         { check: 0.12, bet_33: 0.08, bet_67: 0.32, bet_100: 0.48 },
    flush:            { check: 0.10, bet_33: 0.05, bet_67: 0.30, bet_100: 0.55 },
    full_house:       { check: 0.30, bet_33: 0.05, bet_67: 0.20, bet_100: 0.45 }
  };

  // OOP turn barrel: similar polarization, even more checking
  var base_OOP_turn_barrel = {
    air:              { check: 0.60, bet_33: 0.18, bet_67: 0.15, bet_100: 0.07 },
    overcards:        { check: 0.65, bet_33: 0.18, bet_67: 0.12, bet_100: 0.05 },
    weak_draw:        { check: 0.62, bet_33: 0.15, bet_67: 0.15, bet_100: 0.08 },
    gutshot:          { check: 0.55, bet_33: 0.18, bet_67: 0.18, bet_100: 0.09 },
    combo_draw:       { check: 0.28, bet_33: 0.12, bet_67: 0.30, bet_100: 0.30 },
    oesd_or_fd:       { check: 0.38, bet_33: 0.15, bet_67: 0.27, bet_100: 0.20 },
    underpair:        { check: 0.75, bet_33: 0.15, bet_67: 0.06, bet_100: 0.04 },
    weak_pair:        { check: 0.72, bet_33: 0.15, bet_67: 0.08, bet_100: 0.05 },
    second_pair:      { check: 0.68, bet_33: 0.18, bet_67: 0.10, bet_100: 0.04 },
    top_pair_weak:    { check: 0.48, bet_33: 0.22, bet_67: 0.22, bet_100: 0.08 },
    top_pair_strong:  { check: 0.28, bet_33: 0.22, bet_67: 0.30, bet_100: 0.20 },
    overpair:         { check: 0.30, bet_33: 0.18, bet_67: 0.30, bet_100: 0.22 },
    two_pair:         { check: 0.20, bet_33: 0.10, bet_67: 0.30, bet_100: 0.40 },
    trips:            { check: 0.30, bet_33: 0.08, bet_67: 0.27, bet_100: 0.35 },
    set:              { check: 0.22, bet_33: 0.06, bet_67: 0.28, bet_100: 0.44 },
    straight:         { check: 0.15, bet_33: 0.06, bet_67: 0.30, bet_100: 0.49 },
    flush:            { check: 0.12, bet_33: 0.04, bet_67: 0.29, bet_100: 0.55 },
    full_house:       { check: 0.35, bet_33: 0.04, bet_67: 0.18, bet_100: 0.43 }
  };

  // IP river bet: most polarized — value or bluff, medium almost always checks
  var base_IP_river_bet = {
    air:              { check: 0.60, bet_33: 0.10, bet_67: 0.15, bet_100: 0.15 },
    overcards:        { check: 0.88, bet_33: 0.05, bet_67: 0.04, bet_100: 0.03 },
    weak_draw:        { check: 0.85, bet_33: 0.05, bet_67: 0.05, bet_100: 0.05 },
    gutshot:          { check: 0.82, bet_33: 0.06, bet_67: 0.06, bet_100: 0.06 },
    combo_draw:       { check: 0.78, bet_33: 0.07, bet_67: 0.08, bet_100: 0.07 },
    oesd_or_fd:       { check: 0.80, bet_33: 0.05, bet_67: 0.07, bet_100: 0.08 },
    underpair:        { check: 0.85, bet_33: 0.08, bet_67: 0.04, bet_100: 0.03 },
    weak_pair:        { check: 0.82, bet_33: 0.10, bet_67: 0.05, bet_100: 0.03 },
    second_pair:      { check: 0.78, bet_33: 0.12, bet_67: 0.07, bet_100: 0.03 },
    top_pair_weak:    { check: 0.55, bet_33: 0.22, bet_67: 0.15, bet_100: 0.08 },
    top_pair_strong:  { check: 0.30, bet_33: 0.20, bet_67: 0.30, bet_100: 0.20 },
    overpair:         { check: 0.25, bet_33: 0.18, bet_67: 0.32, bet_100: 0.25 },
    two_pair:         { check: 0.12, bet_33: 0.10, bet_67: 0.33, bet_100: 0.45 },
    trips:            { check: 0.15, bet_33: 0.08, bet_67: 0.30, bet_100: 0.47 },
    set:              { check: 0.10, bet_33: 0.05, bet_67: 0.28, bet_100: 0.57 },
    straight:         { check: 0.08, bet_33: 0.05, bet_67: 0.30, bet_100: 0.57 },
    flush:            { check: 0.06, bet_33: 0.04, bet_67: 0.25, bet_100: 0.65 },
    full_house:       { check: 0.15, bet_33: 0.03, bet_67: 0.17, bet_100: 0.65 }
  };

  // OOP river bet: most polarized OOP
  var base_OOP_river_bet = {
    air:              { check: 0.68, bet_33: 0.08, bet_67: 0.12, bet_100: 0.12 },
    overcards:        { check: 0.92, bet_33: 0.03, bet_67: 0.03, bet_100: 0.02 },
    weak_draw:        { check: 0.90, bet_33: 0.04, bet_67: 0.03, bet_100: 0.03 },
    gutshot:          { check: 0.88, bet_33: 0.04, bet_67: 0.04, bet_100: 0.04 },
    combo_draw:       { check: 0.82, bet_33: 0.06, bet_67: 0.06, bet_100: 0.06 },
    oesd_or_fd:       { check: 0.85, bet_33: 0.05, bet_67: 0.05, bet_100: 0.05 },
    underpair:        { check: 0.90, bet_33: 0.06, bet_67: 0.02, bet_100: 0.02 },
    weak_pair:        { check: 0.87, bet_33: 0.08, bet_67: 0.03, bet_100: 0.02 },
    second_pair:      { check: 0.83, bet_33: 0.10, bet_67: 0.05, bet_100: 0.02 },
    top_pair_weak:    { check: 0.62, bet_33: 0.18, bet_67: 0.13, bet_100: 0.07 },
    top_pair_strong:  { check: 0.35, bet_33: 0.18, bet_67: 0.27, bet_100: 0.20 },
    overpair:         { check: 0.30, bet_33: 0.15, bet_67: 0.30, bet_100: 0.25 },
    two_pair:         { check: 0.15, bet_33: 0.08, bet_67: 0.30, bet_100: 0.47 },
    trips:            { check: 0.18, bet_33: 0.06, bet_67: 0.28, bet_100: 0.48 },
    set:              { check: 0.12, bet_33: 0.04, bet_67: 0.26, bet_100: 0.58 },
    straight:         { check: 0.10, bet_33: 0.04, bet_67: 0.28, bet_100: 0.58 },
    flush:            { check: 0.08, bet_33: 0.03, bet_67: 0.24, bet_100: 0.65 },
    full_house:       { check: 0.18, bet_33: 0.02, bet_67: 0.15, bet_100: 0.65 }
  };

  // ----- FACING BET SPOTS (actions: fold, call, raise) -----

  // IP facing c-bet
  var base_IP_facing_cbet = {
    air:              { fold: 0.80, call: 0.15, raise: 0.05 },
    overcards:        { fold: 0.50, call: 0.40, raise: 0.10 },
    weak_draw:        { fold: 0.40, call: 0.48, raise: 0.12 },
    gutshot:          { fold: 0.35, call: 0.50, raise: 0.15 },
    combo_draw:       { fold: 0.05, call: 0.50, raise: 0.45 },
    oesd_or_fd:       { fold: 0.10, call: 0.58, raise: 0.32 },
    underpair:        { fold: 0.35, call: 0.55, raise: 0.10 },
    weak_pair:        { fold: 0.30, call: 0.60, raise: 0.10 },
    second_pair:      { fold: 0.15, call: 0.72, raise: 0.13 },
    top_pair_weak:    { fold: 0.05, call: 0.78, raise: 0.17 },
    top_pair_strong:  { fold: 0.02, call: 0.73, raise: 0.25 },
    overpair:         { fold: 0.02, call: 0.68, raise: 0.30 },
    two_pair:         { fold: 0.01, call: 0.44, raise: 0.55 },
    trips:            { fold: 0.01, call: 0.50, raise: 0.49 },
    set:              { fold: 0.00, call: 0.40, raise: 0.60 },
    straight:         { fold: 0.00, call: 0.35, raise: 0.65 },
    flush:            { fold: 0.00, call: 0.38, raise: 0.62 },
    full_house:       { fold: 0.00, call: 0.45, raise: 0.55 }
  };

  // OOP facing c-bet
  var base_OOP_facing_cbet = {
    air:              { fold: 0.85, call: 0.12, raise: 0.03 },
    overcards:        { fold: 0.55, call: 0.37, raise: 0.08 },
    weak_draw:        { fold: 0.45, call: 0.45, raise: 0.10 },
    gutshot:          { fold: 0.40, call: 0.47, raise: 0.13 },
    combo_draw:       { fold: 0.05, call: 0.48, raise: 0.47 },
    oesd_or_fd:       { fold: 0.12, call: 0.55, raise: 0.33 },
    underpair:        { fold: 0.40, call: 0.52, raise: 0.08 },
    weak_pair:        { fold: 0.35, call: 0.57, raise: 0.08 },
    second_pair:      { fold: 0.18, call: 0.70, raise: 0.12 },
    top_pair_weak:    { fold: 0.05, call: 0.75, raise: 0.20 },
    top_pair_strong:  { fold: 0.02, call: 0.68, raise: 0.30 },
    overpair:         { fold: 0.02, call: 0.63, raise: 0.35 },
    two_pair:         { fold: 0.01, call: 0.39, raise: 0.60 },
    trips:            { fold: 0.01, call: 0.44, raise: 0.55 },
    set:              { fold: 0.00, call: 0.35, raise: 0.65 },
    straight:         { fold: 0.00, call: 0.30, raise: 0.70 },
    flush:            { fold: 0.00, call: 0.33, raise: 0.67 },
    full_house:       { fold: 0.00, call: 0.40, raise: 0.60 }
  };

  // IP facing turn bet
  var base_IP_facing_turn_bet = {
    air:              { fold: 0.85, call: 0.10, raise: 0.05 },
    overcards:        { fold: 0.72, call: 0.22, raise: 0.06 },
    weak_draw:        { fold: 0.50, call: 0.40, raise: 0.10 },
    gutshot:          { fold: 0.55, call: 0.35, raise: 0.10 },
    combo_draw:       { fold: 0.08, call: 0.50, raise: 0.42 },
    oesd_or_fd:       { fold: 0.15, call: 0.55, raise: 0.30 },
    underpair:        { fold: 0.55, call: 0.38, raise: 0.07 },
    weak_pair:        { fold: 0.50, call: 0.42, raise: 0.08 },
    second_pair:      { fold: 0.35, call: 0.55, raise: 0.10 },
    top_pair_weak:    { fold: 0.12, call: 0.72, raise: 0.16 },
    top_pair_strong:  { fold: 0.05, call: 0.70, raise: 0.25 },
    overpair:         { fold: 0.04, call: 0.66, raise: 0.30 },
    two_pair:         { fold: 0.01, call: 0.42, raise: 0.57 },
    trips:            { fold: 0.01, call: 0.45, raise: 0.54 },
    set:              { fold: 0.00, call: 0.35, raise: 0.65 },
    straight:         { fold: 0.00, call: 0.30, raise: 0.70 },
    flush:            { fold: 0.00, call: 0.33, raise: 0.67 },
    full_house:       { fold: 0.00, call: 0.38, raise: 0.62 }
  };

  // OOP facing turn bet
  var base_OOP_facing_turn_bet = {
    air:              { fold: 0.90, call: 0.07, raise: 0.03 },
    overcards:        { fold: 0.78, call: 0.18, raise: 0.04 },
    weak_draw:        { fold: 0.55, call: 0.37, raise: 0.08 },
    gutshot:          { fold: 0.60, call: 0.30, raise: 0.10 },
    combo_draw:       { fold: 0.10, call: 0.45, raise: 0.45 },
    oesd_or_fd:       { fold: 0.18, call: 0.52, raise: 0.30 },
    underpair:        { fold: 0.60, call: 0.33, raise: 0.07 },
    weak_pair:        { fold: 0.55, call: 0.38, raise: 0.07 },
    second_pair:      { fold: 0.40, call: 0.50, raise: 0.10 },
    top_pair_weak:    { fold: 0.15, call: 0.68, raise: 0.17 },
    top_pair_strong:  { fold: 0.05, call: 0.65, raise: 0.30 },
    overpair:         { fold: 0.04, call: 0.61, raise: 0.35 },
    two_pair:         { fold: 0.01, call: 0.37, raise: 0.62 },
    trips:            { fold: 0.01, call: 0.40, raise: 0.59 },
    set:              { fold: 0.00, call: 0.30, raise: 0.70 },
    straight:         { fold: 0.00, call: 0.25, raise: 0.75 },
    flush:            { fold: 0.00, call: 0.28, raise: 0.72 },
    full_house:       { fold: 0.00, call: 0.35, raise: 0.65 }
  };

  // IP facing river bet
  var base_IP_facing_river_bet = {
    air:              { fold: 0.90, call: 0.07, raise: 0.03 },
    overcards:        { fold: 0.88, call: 0.10, raise: 0.02 },
    weak_draw:        { fold: 0.88, call: 0.09, raise: 0.03 },
    gutshot:          { fold: 0.87, call: 0.10, raise: 0.03 },
    combo_draw:       { fold: 0.83, call: 0.12, raise: 0.05 },
    oesd_or_fd:       { fold: 0.85, call: 0.10, raise: 0.05 },
    underpair:        { fold: 0.65, call: 0.30, raise: 0.05 },
    weak_pair:        { fold: 0.60, call: 0.35, raise: 0.05 },
    second_pair:      { fold: 0.40, call: 0.52, raise: 0.08 },
    top_pair_weak:    { fold: 0.18, call: 0.68, raise: 0.14 },
    top_pair_strong:  { fold: 0.08, call: 0.70, raise: 0.22 },
    overpair:         { fold: 0.06, call: 0.64, raise: 0.30 },
    two_pair:         { fold: 0.02, call: 0.40, raise: 0.58 },
    trips:            { fold: 0.02, call: 0.38, raise: 0.60 },
    set:              { fold: 0.01, call: 0.30, raise: 0.69 },
    straight:         { fold: 0.01, call: 0.28, raise: 0.71 },
    flush:            { fold: 0.01, call: 0.30, raise: 0.69 },
    full_house:       { fold: 0.00, call: 0.25, raise: 0.75 }
  };

  // OOP facing river bet
  var base_OOP_facing_river_bet = {
    air:              { fold: 0.93, call: 0.05, raise: 0.02 },
    overcards:        { fold: 0.91, call: 0.07, raise: 0.02 },
    weak_draw:        { fold: 0.90, call: 0.08, raise: 0.02 },
    gutshot:          { fold: 0.89, call: 0.08, raise: 0.03 },
    combo_draw:       { fold: 0.85, call: 0.10, raise: 0.05 },
    oesd_or_fd:       { fold: 0.87, call: 0.08, raise: 0.05 },
    underpair:        { fold: 0.70, call: 0.25, raise: 0.05 },
    weak_pair:        { fold: 0.65, call: 0.30, raise: 0.05 },
    second_pair:      { fold: 0.45, call: 0.47, raise: 0.08 },
    top_pair_weak:    { fold: 0.22, call: 0.63, raise: 0.15 },
    top_pair_strong:  { fold: 0.10, call: 0.65, raise: 0.25 },
    overpair:         { fold: 0.07, call: 0.60, raise: 0.33 },
    two_pair:         { fold: 0.02, call: 0.35, raise: 0.63 },
    trips:            { fold: 0.02, call: 0.33, raise: 0.65 },
    set:              { fold: 0.01, call: 0.25, raise: 0.74 },
    straight:         { fold: 0.01, call: 0.22, raise: 0.77 },
    flush:            { fold: 0.01, call: 0.25, raise: 0.74 },
    full_house:       { fold: 0.00, call: 0.20, raise: 0.80 }
  };

  // -------------------------------------------------------------------------
  // Board texture modifiers (same as before, applied to all 18 strengths)
  // -------------------------------------------------------------------------

  var betTextureModifiers = {
    dry_rainbow:       { checkAdj: 0,     bet33Adj: 0,     bet67Adj: 0,     bet100Adj: 0    },
    dry_twotone:       { checkAdj: 0.05,  bet33Adj: -0.05, bet67Adj: 0.03,  bet100Adj: 0.02 },
    wet_rainbow:       { checkAdj: 0.08,  bet33Adj: -0.06, bet67Adj: 0.02,  bet100Adj: 0.02 },
    wet_twotone:       { checkAdj: 0.15,  bet33Adj: -0.10, bet67Adj: 0.02,  bet100Adj: 0.03 },
    monotone:          { checkAdj: 0.25,  bet33Adj: -0.18, bet67Adj: -0.02, bet100Adj: 0.05 },
    paired_dry:        { checkAdj: -0.08, bet33Adj: 0.10,  bet67Adj: -0.02, bet100Adj: -0.03},
    paired_wet:        { checkAdj: -0.03, bet33Adj: 0.06,  bet67Adj: 0.00,  bet100Adj: -0.01},
    highly_connected:  { checkAdj: 0.12,  bet33Adj: -0.10, bet67Adj: 0.03,  bet100Adj: 0.03 }
  };

  var facingTextureModifiers = {
    dry_rainbow:       { foldAdj: 0,     callAdj: 0,     raiseAdj: 0    },
    dry_twotone:       { foldAdj: 0.02,  callAdj: -0.01, raiseAdj: -0.01 },
    wet_rainbow:       { foldAdj: 0.03,  callAdj: -0.01, raiseAdj: -0.02 },
    wet_twotone:       { foldAdj: 0.05,  callAdj: -0.02, raiseAdj: -0.03 },
    monotone:          { foldAdj: 0.12,  callAdj: -0.05, raiseAdj: -0.07 },
    paired_dry:        { foldAdj: -0.03, callAdj: 0.02,  raiseAdj: 0.01  },
    paired_wet:        { foldAdj: -0.01, callAdj: 0.01,  raiseAdj: 0.00  },
    highly_connected:  { foldAdj: 0.04,  callAdj: -0.01, raiseAdj: -0.03 }
  };

  // Per hand-strength texture overrides for betting spots
  var betHandTextureOverrides = {
    monotone: {
      air:            { checkAdj: 0.15,  bet33Adj: -0.10, bet67Adj: -0.03, bet100Adj: -0.02 },
      overcards:      { checkAdj: 0.12,  bet33Adj: -0.08, bet67Adj: -0.02, bet100Adj: -0.02 },
      weak_draw:      { checkAdj: 0.10,  bet33Adj: -0.08, bet67Adj: -0.02, bet100Adj: 0.00  },
      weak_pair:      { checkAdj: 0.15,  bet33Adj: -0.10, bet67Adj: -0.03, bet100Adj: -0.02 },
      underpair:      { checkAdj: 0.15,  bet33Adj: -0.10, bet67Adj: -0.03, bet100Adj: -0.02 },
      second_pair:    { checkAdj: 0.12,  bet33Adj: -0.08, bet67Adj: -0.02, bet100Adj: -0.02 },
      oesd_or_fd:     { checkAdj: -0.10, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.10  },
      combo_draw:     { checkAdj: -0.10, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.10  },
      top_pair_weak:  { checkAdj: 0.10,  bet33Adj: -0.05, bet67Adj: -0.03, bet100Adj: -0.02 },
      top_pair_strong:{ checkAdj: 0.08,  bet33Adj: -0.03, bet67Adj: -0.03, bet100Adj: -0.02 },
      overpair:       { checkAdj: 0.10,  bet33Adj: -0.05, bet67Adj: -0.03, bet100Adj: -0.02 },
      flush:          { checkAdj: -0.10, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.10  }
    },
    wet_twotone: {
      oesd_or_fd:     { checkAdj: -0.05, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.05  },
      combo_draw:     { checkAdj: -0.05, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.05  },
      gutshot:        { checkAdj: -0.03, bet33Adj: -0.02, bet67Adj: 0.03,  bet100Adj: 0.02  }
    },
    highly_connected: {
      oesd_or_fd:     { checkAdj: -0.05, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.05  },
      combo_draw:     { checkAdj: -0.05, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.05  },
      gutshot:        { checkAdj: -0.03, bet33Adj: -0.02, bet67Adj: 0.03,  bet100Adj: 0.02  },
      weak_pair:      { checkAdj: 0.05,  bet33Adj: -0.03, bet67Adj: -0.01, bet100Adj: -0.01 }
    },
    paired_dry: {
      air:            { checkAdj: -0.05, bet33Adj: 0.05,  bet67Adj: 0.00,  bet100Adj: 0.00  },
      two_pair:       { checkAdj: -0.05, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.05  },
      trips:          { checkAdj: -0.05, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.05  },
      set:            { checkAdj: -0.05, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.05  },
      full_house:     { checkAdj: -0.05, bet33Adj: -0.05, bet67Adj: 0.05,  bet100Adj: 0.05  }
    }
  };

  // Per hand-strength texture overrides for facing-bet spots
  var facingHandTextureOverrides = {
    monotone: {
      air:              { foldAdj: 0.08,  callAdj: -0.05, raiseAdj: -0.03 },
      overcards:        { foldAdj: 0.10,  callAdj: -0.06, raiseAdj: -0.04 },
      weak_draw:        { foldAdj: 0.10,  callAdj: -0.05, raiseAdj: -0.05 },
      weak_pair:        { foldAdj: 0.12,  callAdj: -0.08, raiseAdj: -0.04 },
      underpair:        { foldAdj: 0.12,  callAdj: -0.08, raiseAdj: -0.04 },
      second_pair:      { foldAdj: 0.10,  callAdj: -0.06, raiseAdj: -0.04 },
      top_pair_weak:    { foldAdj: 0.08,  callAdj: -0.04, raiseAdj: -0.04 },
      top_pair_strong:  { foldAdj: 0.05,  callAdj: -0.02, raiseAdj: -0.03 },
      overpair:         { foldAdj: 0.05,  callAdj: -0.02, raiseAdj: -0.03 },
      oesd_or_fd:       { foldAdj: -0.05, callAdj: 0.00,  raiseAdj: 0.05  },
      combo_draw:       { foldAdj: -0.05, callAdj: 0.00,  raiseAdj: 0.05  },
      two_pair:         { foldAdj: -0.01, callAdj: -0.05, raiseAdj: 0.06  },
      trips:            { foldAdj: -0.01, callAdj: -0.05, raiseAdj: 0.06  },
      set:              { foldAdj: -0.01, callAdj: -0.05, raiseAdj: 0.06  },
      flush:            { foldAdj: -0.02, callAdj: -0.03, raiseAdj: 0.05  }
    },
    wet_twotone: {
      oesd_or_fd:       { foldAdj: -0.03, callAdj: 0.00,  raiseAdj: 0.03  },
      combo_draw:       { foldAdj: -0.03, callAdj: 0.00,  raiseAdj: 0.03  },
      gutshot:          { foldAdj: -0.02, callAdj: 0.02,  raiseAdj: 0.00  }
    },
    highly_connected: {
      oesd_or_fd:       { foldAdj: -0.03, callAdj: 0.00,  raiseAdj: 0.03  },
      combo_draw:       { foldAdj: -0.03, callAdj: 0.00,  raiseAdj: 0.03  },
      gutshot:          { foldAdj: -0.02, callAdj: 0.02,  raiseAdj: 0.00  },
      weak_pair:        { foldAdj: 0.03,  callAdj: -0.02, raiseAdj: -0.01 }
    },
    paired_dry: {
      air:              { foldAdj: -0.03, callAdj: 0.03,  raiseAdj: 0.00  },
      weak_pair:        { foldAdj: -0.02, callAdj: 0.02,  raiseAdj: 0.00  },
      trips:            { foldAdj: -0.01, callAdj: -0.04, raiseAdj: 0.05  },
      full_house:       { foldAdj: -0.01, callAdj: -0.04, raiseAdj: 0.05  }
    }
  };

  // -------------------------------------------------------------------------
  // SPR modifiers
  // Low SPR (<3): More polarized, strong hands bet bigger, less bluffing
  // Medium SPR (3-8): Baseline (no adjustment)
  // High SPR (>8): More small bets, strong hands can slow-play
  // -------------------------------------------------------------------------

  var sprBetModifiers = {
    low: {  // < 3 SPR
      air:              { checkAdj: 0.10,  bet33Adj: -0.10, bet67Adj: -0.05, bet100Adj: 0.05 },
      overcards:        { checkAdj: 0.08,  bet33Adj: -0.08, bet67Adj: -0.03, bet100Adj: 0.03 },
      weak_draw:        { checkAdj: 0.10,  bet33Adj: -0.08, bet67Adj: -0.05, bet100Adj: 0.03 },
      gutshot:          { checkAdj: 0.10,  bet33Adj: -0.08, bet67Adj: -0.05, bet100Adj: 0.03 },
      combo_draw:       { checkAdj: -0.05, bet33Adj: -0.10, bet67Adj: 0.05,  bet100Adj: 0.10 },
      oesd_or_fd:       { checkAdj: 0.05,  bet33Adj: -0.08, bet67Adj: -0.02, bet100Adj: 0.05 },
      underpair:        { checkAdj: 0.10,  bet33Adj: -0.05, bet67Adj: -0.03, bet100Adj: -0.02 },
      weak_pair:        { checkAdj: 0.08,  bet33Adj: -0.05, bet67Adj: -0.02, bet100Adj: -0.01 },
      second_pair:      { checkAdj: 0.05,  bet33Adj: -0.03, bet67Adj: -0.02, bet100Adj: 0.00  },
      top_pair_weak:    { checkAdj: 0.00,  bet33Adj: -0.08, bet67Adj: 0.03,  bet100Adj: 0.05  },
      top_pair_strong:  { checkAdj: -0.05, bet33Adj: -0.10, bet67Adj: 0.05,  bet100Adj: 0.10  },
      overpair:         { checkAdj: -0.05, bet33Adj: -0.10, bet67Adj: 0.05,  bet100Adj: 0.10  },
      two_pair:         { checkAdj: -0.08, bet33Adj: -0.10, bet67Adj: 0.05,  bet100Adj: 0.13  },
      trips:            { checkAdj: -0.08, bet33Adj: -0.10, bet67Adj: 0.05,  bet100Adj: 0.13  },
      set:              { checkAdj: -0.10, bet33Adj: -0.10, bet67Adj: 0.05,  bet100Adj: 0.15  },
      straight:         { checkAdj: -0.05, bet33Adj: -0.10, bet67Adj: 0.05,  bet100Adj: 0.10  },
      flush:            { checkAdj: -0.05, bet33Adj: -0.10, bet67Adj: 0.05,  bet100Adj: 0.10  },
      full_house:       { checkAdj: -0.10, bet33Adj: -0.08, bet67Adj: 0.05,  bet100Adj: 0.13  }
    },
    high: { // > 8 SPR
      air:              { checkAdj: -0.05, bet33Adj: 0.08,  bet67Adj: -0.02, bet100Adj: -0.01 },
      overcards:        { checkAdj: -0.03, bet33Adj: 0.06,  bet67Adj: -0.02, bet100Adj: -0.01 },
      weak_draw:        { checkAdj: -0.03, bet33Adj: 0.05,  bet67Adj: -0.01, bet100Adj: -0.01 },
      gutshot:          { checkAdj: -0.03, bet33Adj: 0.05,  bet67Adj: -0.01, bet100Adj: -0.01 },
      combo_draw:       { checkAdj: 0.00,  bet33Adj: 0.05,  bet67Adj: 0.00,  bet100Adj: -0.05 },
      oesd_or_fd:       { checkAdj: -0.02, bet33Adj: 0.05,  bet67Adj: 0.00,  bet100Adj: -0.03 },
      underpair:        { checkAdj: -0.03, bet33Adj: 0.05,  bet67Adj: -0.01, bet100Adj: -0.01 },
      weak_pair:        { checkAdj: -0.03, bet33Adj: 0.05,  bet67Adj: -0.01, bet100Adj: -0.01 },
      second_pair:      { checkAdj: -0.03, bet33Adj: 0.05,  bet67Adj: -0.01, bet100Adj: -0.01 },
      top_pair_weak:    { checkAdj: 0.03,  bet33Adj: 0.05,  bet67Adj: -0.05, bet100Adj: -0.03 },
      top_pair_strong:  { checkAdj: 0.05,  bet33Adj: 0.05,  bet67Adj: -0.05, bet100Adj: -0.05 },
      overpair:         { checkAdj: 0.05,  bet33Adj: 0.05,  bet67Adj: -0.05, bet100Adj: -0.05 },
      two_pair:         { checkAdj: 0.08,  bet33Adj: 0.05,  bet67Adj: -0.05, bet100Adj: -0.08 },
      trips:            { checkAdj: 0.10,  bet33Adj: 0.05,  bet67Adj: -0.05, bet100Adj: -0.10 },
      set:              { checkAdj: 0.12,  bet33Adj: 0.05,  bet67Adj: -0.08, bet100Adj: -0.09 },
      straight:         { checkAdj: 0.05,  bet33Adj: 0.05,  bet67Adj: -0.03, bet100Adj: -0.07 },
      flush:            { checkAdj: 0.05,  bet33Adj: 0.05,  bet67Adj: -0.03, bet100Adj: -0.07 },
      full_house:       { checkAdj: 0.12,  bet33Adj: 0.03,  bet67Adj: -0.05, bet100Adj: -0.10 }
    }
  };

  var sprFacingModifiers = {
    low: {
      air:              { foldAdj: 0.05,  callAdj: -0.03, raiseAdj: -0.02 },
      overcards:        { foldAdj: 0.05,  callAdj: -0.03, raiseAdj: -0.02 },
      weak_draw:        { foldAdj: 0.05,  callAdj: -0.03, raiseAdj: -0.02 },
      gutshot:          { foldAdj: 0.05,  callAdj: -0.03, raiseAdj: -0.02 },
      combo_draw:       { foldAdj: -0.02, callAdj: -0.05, raiseAdj: 0.07  },
      oesd_or_fd:       { foldAdj: 0.03,  callAdj: -0.02, raiseAdj: -0.01 },
      underpair:        { foldAdj: 0.05,  callAdj: -0.03, raiseAdj: -0.02 },
      weak_pair:        { foldAdj: 0.05,  callAdj: -0.03, raiseAdj: -0.02 },
      second_pair:      { foldAdj: 0.03,  callAdj: -0.01, raiseAdj: -0.02 },
      top_pair_weak:    { foldAdj: 0.02,  callAdj: -0.03, raiseAdj: 0.01  },
      top_pair_strong:  { foldAdj: -0.02, callAdj: -0.05, raiseAdj: 0.07  },
      overpair:         { foldAdj: -0.02, callAdj: -0.05, raiseAdj: 0.07  },
      two_pair:         { foldAdj: -0.01, callAdj: -0.07, raiseAdj: 0.08  },
      trips:            { foldAdj: -0.01, callAdj: -0.07, raiseAdj: 0.08  },
      set:              { foldAdj: 0.00,  callAdj: -0.08, raiseAdj: 0.08  },
      straight:         { foldAdj: 0.00,  callAdj: -0.08, raiseAdj: 0.08  },
      flush:            { foldAdj: 0.00,  callAdj: -0.08, raiseAdj: 0.08  },
      full_house:       { foldAdj: 0.00,  callAdj: -0.08, raiseAdj: 0.08  }
    },
    high: {
      air:              { foldAdj: -0.03, callAdj: 0.03,  raiseAdj: 0.00  },
      overcards:        { foldAdj: -0.03, callAdj: 0.03,  raiseAdj: 0.00  },
      weak_draw:        { foldAdj: -0.03, callAdj: 0.03,  raiseAdj: 0.00  },
      gutshot:          { foldAdj: -0.03, callAdj: 0.03,  raiseAdj: 0.00  },
      combo_draw:       { foldAdj: 0.00,  callAdj: 0.05,  raiseAdj: -0.05 },
      oesd_or_fd:       { foldAdj: -0.02, callAdj: 0.03,  raiseAdj: -0.01 },
      underpair:        { foldAdj: -0.03, callAdj: 0.03,  raiseAdj: 0.00  },
      weak_pair:        { foldAdj: -0.03, callAdj: 0.03,  raiseAdj: 0.00  },
      second_pair:      { foldAdj: -0.02, callAdj: 0.03,  raiseAdj: -0.01 },
      top_pair_weak:    { foldAdj: -0.02, callAdj: 0.04,  raiseAdj: -0.02 },
      top_pair_strong:  { foldAdj: -0.01, callAdj: 0.04,  raiseAdj: -0.03 },
      overpair:         { foldAdj: -0.01, callAdj: 0.04,  raiseAdj: -0.03 },
      two_pair:         { foldAdj: 0.00,  callAdj: 0.05,  raiseAdj: -0.05 },
      trips:            { foldAdj: 0.00,  callAdj: 0.05,  raiseAdj: -0.05 },
      set:              { foldAdj: 0.00,  callAdj: 0.06,  raiseAdj: -0.06 },
      straight:         { foldAdj: 0.00,  callAdj: 0.05,  raiseAdj: -0.05 },
      flush:            { foldAdj: 0.00,  callAdj: 0.05,  raiseAdj: -0.05 },
      full_house:       { foldAdj: 0.00,  callAdj: 0.06,  raiseAdj: -0.06 }
    }
  };

  // -------------------------------------------------------------------------
  // Generation functions
  // -------------------------------------------------------------------------

  function applyBetModifiers(base, texture) {
    var mod = betTextureModifiers[texture];
    var handOverrides = betHandTextureOverrides[texture] || {};
    var result = {};

    for (var i = 0; i < HAND_STRENGTHS.length; i++) {
      var hs = HAND_STRENGTHS[i];
      var b = base[hs];
      if (!b) continue;
      var ho = handOverrides[hs] || { checkAdj: 0, bet33Adj: 0, bet67Adj: 0, bet100Adj: 0 };

      result[hs] = normalizeBet({
        check:   clamp(b.check   + mod.checkAdj   + ho.checkAdj),
        bet_33:  clamp(b.bet_33  + mod.bet33Adj   + ho.bet33Adj),
        bet_67:  clamp(b.bet_67  + mod.bet67Adj   + ho.bet67Adj),
        bet_100: clamp(b.bet_100 + mod.bet100Adj  + ho.bet100Adj)
      });
    }
    return result;
  }

  function applyFacingModifiers(base, texture) {
    var mod = facingTextureModifiers[texture];
    var handOverrides = facingHandTextureOverrides[texture] || {};
    var result = {};

    for (var i = 0; i < HAND_STRENGTHS.length; i++) {
      var hs = HAND_STRENGTHS[i];
      var b = base[hs];
      if (!b) continue;
      var ho = handOverrides[hs] || { foldAdj: 0, callAdj: 0, raiseAdj: 0 };

      result[hs] = normalizeFacing({
        fold:  clamp(b.fold  + mod.foldAdj  + ho.foldAdj),
        call:  clamp(b.call  + mod.callAdj  + ho.callAdj),
        raise: clamp(b.raise + mod.raiseAdj + ho.raiseAdj)
      });
    }
    return result;
  }

  function generateBettingSpot(base) {
    var spot = {};
    for (var i = 0; i < BOARD_TEXTURES.length; i++) {
      spot[BOARD_TEXTURES[i]] = applyBetModifiers(base, BOARD_TEXTURES[i]);
    }
    return spot;
  }

  function generateFacingSpot(base) {
    var spot = {};
    for (var i = 0; i < BOARD_TEXTURES.length; i++) {
      spot[BOARD_TEXTURES[i]] = applyFacingModifiers(base, BOARD_TEXTURES[i]);
    }
    return spot;
  }

  // -------------------------------------------------------------------------
  // Build the complete PostflopStrategy object
  // -------------------------------------------------------------------------

  GTO.Data.PostflopStrategy = {
    // Betting spots (6)
    IP_cbet_flop:    generateBettingSpot(base_IP_cbet_flop),
    OOP_cbet_flop:   generateBettingSpot(base_OOP_cbet_flop),
    IP_turn_barrel:  generateBettingSpot(base_IP_turn_barrel),
    OOP_turn_barrel: generateBettingSpot(base_OOP_turn_barrel),
    IP_river_bet:    generateBettingSpot(base_IP_river_bet),
    OOP_river_bet:   generateBettingSpot(base_OOP_river_bet),

    // Facing bet spots (6)
    IP_facing_cbet:       generateFacingSpot(base_IP_facing_cbet),
    OOP_facing_cbet:      generateFacingSpot(base_OOP_facing_cbet),
    IP_facing_turn_bet:   generateFacingSpot(base_IP_facing_turn_bet),
    OOP_facing_turn_bet:  generateFacingSpot(base_OOP_facing_turn_bet),
    IP_facing_river_bet:  generateFacingSpot(base_IP_facing_river_bet),
    OOP_facing_river_bet: generateFacingSpot(base_OOP_facing_river_bet)
  };

  // -------------------------------------------------------------------------
  // isFacingBetSpot helper (was previously undefined!)
  // -------------------------------------------------------------------------

  GTO.Data.isFacingBetSpot = function(spotType) {
    return spotType && spotType.indexOf('facing') >= 0;
  };

  // -------------------------------------------------------------------------
  // Lookup helper with optional SPR
  // -------------------------------------------------------------------------

  // Renamed to _lookupPostflopHeuristic — solver-backed lookup in postflop-lookup.js
  // is the primary entry point. This is the fallback for turn/river spots.
  GTO.Data._lookupPostflopHeuristic = function(spotType, boardTexture, handStrength, spr) {
    var spot = this.PostflopStrategy[spotType];
    if (!spot) return null;
    var texture = spot[boardTexture];
    if (!texture) return null;
    var freqs = texture[handStrength];
    if (!freqs) return null;

    // Apply SPR modifier if provided
    if (spr !== undefined && spr !== null) {
      var sprTier = spr < 3 ? 'low' : (spr > 8 ? 'high' : null);
      if (sprTier) {
        var isFacing = this.isFacingBetSpot(spotType);
        if (isFacing) {
          var sprMod = sprFacingModifiers[sprTier];
          var hsMod = sprMod[handStrength] || { foldAdj: 0, callAdj: 0, raiseAdj: 0 };
          freqs = normalizeFacing({
            fold:  clamp(freqs.fold  + hsMod.foldAdj),
            call:  clamp(freqs.call  + hsMod.callAdj),
            raise: clamp(freqs.raise + hsMod.raiseAdj)
          });
        } else {
          var sprMod = sprBetModifiers[sprTier];
          var hsMod = sprMod[handStrength] || { checkAdj: 0, bet33Adj: 0, bet67Adj: 0, bet100Adj: 0 };
          freqs = normalizeBet({
            check:   clamp(freqs.check   + hsMod.checkAdj),
            bet_33:  clamp(freqs.bet_33  + hsMod.bet33Adj),
            bet_67:  clamp(freqs.bet_67  + hsMod.bet67Adj),
            bet_100: clamp(freqs.bet_100 + hsMod.bet100Adj)
          });
        }
      }
    }

    return freqs;
  };

  // -------------------------------------------------------------------------
  // Metadata for consumers
  // -------------------------------------------------------------------------

  GTO.Data.PostflopSpotTypes = {
    betting: [
      'IP_cbet_flop', 'OOP_cbet_flop',
      'IP_turn_barrel', 'OOP_turn_barrel',
      'IP_river_bet', 'OOP_river_bet'
    ],
    facing: [
      'IP_facing_cbet', 'OOP_facing_cbet',
      'IP_facing_turn_bet', 'OOP_facing_turn_bet',
      'IP_facing_river_bet', 'OOP_facing_river_bet'
    ]
  };

  GTO.Data.PostflopBoardTextures = BOARD_TEXTURES.slice();
  GTO.Data.PostflopHandStrengths = HAND_STRENGTHS.slice();

  GTO.Data.PostflopSpotLabels = {
    IP_cbet_flop:         'IP C-Bet (Flop)',
    OOP_cbet_flop:        'OOP C-Bet (Flop)',
    IP_turn_barrel:       'IP Turn Barrel',
    OOP_turn_barrel:      'OOP Turn Barrel',
    IP_river_bet:         'IP River Bet',
    OOP_river_bet:        'OOP River Bet',
    IP_facing_cbet:       'IP Facing C-Bet',
    OOP_facing_cbet:      'OOP Facing C-Bet',
    IP_facing_turn_bet:   'IP Facing Turn Bet',
    OOP_facing_turn_bet:  'OOP Facing Turn Bet',
    IP_facing_river_bet:  'IP Facing River Bet',
    OOP_facing_river_bet: 'OOP Facing River Bet'
  };

  GTO.Data.BoardTextureLabels = {
    dry_rainbow:      'Dry Rainbow',
    dry_twotone:      'Dry Two-Tone',
    wet_rainbow:      'Wet Rainbow',
    wet_twotone:      'Wet Two-Tone',
    monotone:         'Monotone',
    paired_dry:       'Paired Dry',
    paired_wet:       'Paired Wet',
    highly_connected: 'Highly Connected'
  };

  GTO.Data.HandStrengthLabels = {
    air:              'Air (No Pair, No Draw)',
    overcards:        'Overcards',
    weak_draw:        'Weak Draw (Backdoor)',
    gutshot:          'Gutshot Straight Draw',
    combo_draw:       'Combo Draw (Flush + Straight)',
    oesd_or_fd:       'OESD or Flush Draw',
    underpair:        'Underpair',
    weak_pair:        'Weak Pair (Bottom Pair)',
    second_pair:      'Second Pair',
    top_pair_weak:    'Top Pair Weak Kicker',
    top_pair_strong:  'Top Pair Strong Kicker',
    overpair:         'Overpair',
    two_pair:         'Two Pair',
    trips:            'Trips',
    set:              'Set',
    straight:         'Straight',
    flush:            'Flush',
    full_house:       'Full House or Better'
  };

})();
