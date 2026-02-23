window.GTO = window.GTO || {};
GTO.AI = GTO.AI || {};

GTO.AI.PromptBuilder = {
  build: function(scenario, userAction, result) {
    if (scenario.type === 'preflop') return this._buildPreflop(scenario, userAction, result);
    if (scenario.type === 'postflop') return this._buildPostflop(scenario, userAction, result);
    if (scenario.type === 'tournament') return this._buildTournament(scenario, userAction, result);
    return 'Analyze this poker decision.';
  },

  _buildPreflop: function(s, action, r) {
    var parts = [
      'Preflop spot in 6-max ' + s.format + ' game, ' + s.stackDepth + ' effective.',
      'Hero is in ' + s.position + ' with ' + s.hand + '.'
    ];

    if (s.actionContext === 'rfi') parts.push('Action folds to hero.');
    else if (s.actionContext === 'vs_raise') parts.push(s.villainPosition + ' opens to 2.5bb.');
    else if (s.actionContext === 'vs_3bet') parts.push('Hero opened, ' + s.villainPosition + ' 3-bets to 8bb.');
    else if (s.actionContext === 'vs_4bet') parts.push(s.villainPosition + ' opened, hero 3-bet, ' + s.villainPosition + ' 4-bets to 20bb.');

    parts.push('Hero chose to ' + action.toUpperCase() + '.');
    parts.push('GTO frequencies: Fold ' + Math.round((r.gtoFreqs.fold||0)*100) + '%, Call ' + Math.round((r.gtoFreqs.call||0)*100) + '%, Raise ' + Math.round((r.gtoFreqs.raise||0)*100) + '%.');
    parts.push('Verdict: ' + r.verdict.toUpperCase() + '. EV impact: ' + GTO.Utils.formatEV(r.evLoss) + '.');
    parts.push('Explain WHY the GTO strategy is correct here. Cover: hand strength, position, pot odds, villain\'s range, and what this hand achieves in our range.');

    return parts.join('\n');
  },

  _buildPostflop: function(s, action, r) {
    var boardStr = s.boardCards.map(function(c) { return c.rank + GTO.Data.SUIT_SYMBOLS[c.suit]; }).join(' ');
    var parts = [
      'Postflop spot: ' + (GTO.Data.PostflopSpotLabels ? GTO.Data.PostflopSpotLabels[s.spotType] : s.spotType),
      'Board: ' + boardStr + ' (Texture: ' + s.boardTexture + ')',
      'Hero has ' + s.hand + ' (' + s.handStrength + ')',
      'Position: ' + s.position + ' (' + (s.isIP ? 'In Position' : 'Out of Position') + ')',
      'Pot: ' + s.potSize + 'bb, Stack: ' + s.effectiveStack + 'bb',
      'Hero chose: ' + action,
      'GTO: ' + Object.keys(r.gtoFreqs).map(function(k) { return k + ' ' + Math.round(r.gtoFreqs[k]*100) + '%'; }).join(', '),
      'Explain the optimal strategy considering board texture, range advantage, hand equity, and bet sizing theory.'
    ];
    return parts.join('\n');
  },

  _buildTournament: function(s, action, r) {
    var parts = [
      'Tournament push/fold spot. ' + s.stackBB + 'bb effective.',
      'Hero in ' + s.position + ' with ' + s.hand + '.',
      'Hero chose to ' + action.toUpperCase() + '.',
      'Nash equilibrium says: ' + r.correctAction.toUpperCase() + '.',
      'Explain the push/fold math: fold equity, pot odds for pushing, hand equity vs calling range, and ICM considerations.'
    ];
    return parts.join('\n');
  }
};
