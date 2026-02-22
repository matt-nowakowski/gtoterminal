window.GTO = window.GTO || {};
GTO.Engine = GTO.Engine || {};

GTO.Engine.ScenarioGenerator = {
  // Generate a preflop scenario
  preflop: function(config) {
    var format = config.format || 'cash';
    var positions = config.positions || GTO.Data.POSITIONS.slice(0, 5); // exclude BB for RFI
    var stackDepths = config.stackDepths || ['100bb'];
    var actionContexts = config.actionContexts || ['rfi'];

    var position = GTO.Utils.randPick(positions);
    var stackDepth = GTO.Utils.randPick(stackDepths);
    var actionContext = GTO.Utils.randPick(actionContexts);

    // For RFI, BB can't open
    if (actionContext === 'rfi' && position === 'BB') {
      position = GTO.Utils.randPick(positions.filter(function(p) { return p !== 'BB'; }));
    }

    // Pick a hand, weighted toward mixed-frequency hands
    var hand = this._pickWeightedHand(format, stackDepth, actionContext, position);

    // Generate villain position for vs_raise contexts
    var villainPosition = null;
    var positionKey = position;

    if (actionContext === 'vs_raise') {
      // Pick a villain who opened from earlier position
      var posIdx = GTO.Data.POSITIONS.indexOf(position);
      var earlierPositions = GTO.Data.POSITIONS.slice(0, posIdx);
      if (earlierPositions.length === 0) earlierPositions = ['UTG'];
      villainPosition = GTO.Utils.randPick(earlierPositions);
      positionKey = villainPosition + '_' + position;
    } else if (actionContext === 'vs_3bet') {
      // Hero opened, villain 3bet from later position
      var posIdx = GTO.Data.POSITIONS.indexOf(position);
      var laterPositions = GTO.Data.POSITIONS.slice(posIdx + 1);
      if (laterPositions.length === 0) laterPositions = ['BB'];
      villainPosition = GTO.Utils.randPick(laterPositions);
      positionKey = position + '_' + villainPosition;
    }

    var cards = GTO.Engine.Deck.handToCards(hand);

    return {
      type: 'preflop',
      format: format,
      hand: hand,
      cards: cards,
      position: position,
      stackDepth: stackDepth,
      actionContext: actionContext,
      villainPosition: villainPosition,
      positionKey: positionKey,
      description: this._describePreflopScenario(actionContext, position, villainPosition, stackDepth)
    };
  },

  // Generate a postflop scenario
  postflop: function(config) {
    var format = config.format || 'cash';
    var spotTypes = config.spotTypes || ['IP_cbet_flop'];
    var spotType = GTO.Utils.randPick(spotTypes);
    var isIP = spotType.indexOf('IP_') === 0;
    var street = spotType.indexOf('flop') >= 0 ? 'flop' : (spotType.indexOf('turn') >= 0 ? 'turn' : 'river');

    // Pick a random board texture
    var texture = GTO.Utils.randPick(GTO.Data.BoardCategories.TEXTURES);

    // Pick a hand
    var hand = GTO.Utils.randPick(GTO.Data.ALL_HANDS);
    var cards = GTO.Engine.Deck.handToCards(hand);

    // Deal a board matching the texture
    var numBoardCards = street === 'flop' ? 3 : (street === 'turn' ? 4 : 5);
    var result = GTO.Engine.Deck.dealBoardWithTexture(texture, cards, numBoardCards);
    var boardCards = result.board;

    // Classify hand strength
    var handStrength = GTO.Engine.HandEvaluator.classify(cards, boardCards);

    // Determine pot and stack sizes
    var potSize = street === 'flop' ? 6.5 : (street === 'turn' ? 12 : 24);
    var effectiveStack = 45 + Math.floor(Math.random() * 55);

    var position = isIP ? GTO.Utils.randPick(['BTN','CO']) : GTO.Utils.randPick(['BB','SB','UTG']);

    return {
      type: 'postflop',
      format: format,
      hand: hand,
      cards: cards,
      boardCards: boardCards,
      boardTexture: texture,
      handStrength: handStrength,
      spotType: spotType,
      street: street,
      position: position,
      isIP: isIP,
      potSize: potSize,
      effectiveStack: effectiveStack,
      description: this._describePostflopScenario(spotType, texture, street, position, potSize, effectiveStack)
    };
  },

  // Generate a push/fold tournament scenario
  tournament: function(config) {
    var stackMin = parseInt(config.stackMin) || 5;
    var stackMax = parseInt(config.stackMax) || 20;
    var positions = config.positions || GTO.Data.POSITIONS;
    var position = GTO.Utils.randPick(positions);
    var stackBB = stackMin + Math.floor(Math.random() * (stackMax - stackMin + 1));
    var hand = GTO.Utils.randPick(GTO.Data.ALL_HANDS);
    var cards = GTO.Engine.Deck.handToCards(hand);
    var stage = config.stage || 'normal';

    return {
      type: 'tournament',
      hand: hand,
      cards: cards,
      position: position,
      stackBB: stackBB,
      stage: stage,
      playersLeft: 15 + Math.floor(Math.random() * 85),
      description: position + ' with ' + stackBB + 'bb - Push or Fold?'
    };
  },

  _pickWeightedHand: function(format, stackDepth, actionContext, position) {
    // Weight mixed-frequency hands 3x more than pure hands (more educational)
    var positionKey = position;
    var rangeData = null;

    try {
      var fmtData = GTO.Data.PreflopRanges[format];
      if (!fmtData) fmtData = GTO.Data.PreflopRanges.cash;
      var depthData = fmtData[stackDepth] || fmtData['100bb'] || fmtData[Object.keys(fmtData)[0]];
      if (!depthData) return GTO.Utils.randPick(GTO.Data.ALL_HANDS);
      var ctxData = depthData[actionContext] || depthData.rfi;
      if (!ctxData) return GTO.Utils.randPick(GTO.Data.ALL_HANDS);
      rangeData = ctxData[positionKey];
    } catch(e) {}

    if (!rangeData) return GTO.Utils.randPick(GTO.Data.ALL_HANDS);

    var weighted = [];
    GTO.Data.ALL_HANDS.forEach(function(h) {
      var isMixed = rangeData.mixed && rangeData.mixed[h];
      var isPure = (rangeData.pure_raise && rangeData.pure_raise.indexOf(h) >= 0) ||
                   (rangeData.pure_call && rangeData.pure_call.indexOf(h) >= 0);
      var weight = isMixed ? 3 : (isPure ? 1.5 : 1);
      weighted.push({ item: h, weight: weight });
    });

    return GTO.Utils.weightedPick(weighted);
  },

  _describePreflopScenario: function(ctx, pos, villain, stack) {
    if (ctx === 'rfi') return 'Action folds to you in ' + pos + '. ' + stack + ' effective.';
    if (ctx === 'vs_raise') return villain + ' opens to 2.5bb. Action on you in ' + pos + '. ' + stack + ' effective.';
    if (ctx === 'vs_3bet') return 'You opened from ' + pos + '. ' + villain + ' 3-bets to 8bb. ' + stack + ' effective.';
    if (ctx === 'vs_4bet') return 'You 3-bet from ' + pos + '. Villain 4-bets to 20bb. ' + stack + ' effective.';
    return '';
  },

  _describePostflopScenario: function(spot, texture, street, pos, pot, stack) {
    var spotLabel = GTO.Data.PostflopSpotLabels ? GTO.Data.PostflopSpotLabels[spot] : spot;
    return spotLabel + ' on ' + street + '. Pot: ' + pot.toFixed(1) + 'bb. Stack: ' + stack + 'bb.';
  }
};
