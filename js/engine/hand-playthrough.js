window.GTO = window.GTO || {};
GTO.Engine = GTO.Engine || {};

GTO.Engine.HandPlaythrough = {
  _hand: null,

  startHand: function(config) {
    var deck = GTO.Engine.Deck.create();
    GTO.Engine.Deck.shuffle(deck);

    var heroPosition = config.position || GTO.Utils.randPick(GTO.Data.POSITIONS);
    var hand = GTO.Utils.randPick(GTO.Data.ALL_HANDS);
    var cards = GTO.Engine.Deck.handToCards(hand);
    deck = GTO.Engine.Deck.remove(deck, cards);

    this._hand = {
      id: GTO.Utils.uid(),
      heroPosition: heroPosition,
      hand: hand,
      cards: cards,
      deck: deck,
      format: config.format || 'cash',
      stackDepth: config.stackDepth || '100bb',
      streets: [],
      currentStreet: 'preflop',
      board: [],
      pot: 1.5, // blinds
      scores: [],
      totalEvLoss: 0,
      isComplete: false
    };

    return this._hand;
  },

  dealStreet: function() {
    if (!this._hand || this._hand.isComplete) return null;
    var h = this._hand;

    if (h.currentStreet === 'preflop') {
      // Already dealt hole cards
      return { street: 'preflop', board: [] };
    } else if (h.currentStreet === 'flop') {
      var flop = GTO.Engine.Deck.deal(h.deck, 3);
      h.board = h.board.concat(flop);
      return { street: 'flop', board: h.board.slice(), newCards: flop };
    } else if (h.currentStreet === 'turn') {
      var turn = GTO.Engine.Deck.deal(h.deck, 1);
      h.board = h.board.concat(turn);
      return { street: 'turn', board: h.board.slice(), newCards: turn };
    } else if (h.currentStreet === 'river') {
      var river = GTO.Engine.Deck.deal(h.deck, 1);
      h.board = h.board.concat(river);
      return { street: 'river', board: h.board.slice(), newCards: river };
    }
    return null;
  },

  submitStreetAction: function(userAction) {
    if (!this._hand) return null;
    var h = this._hand;

    var result;
    if (h.currentStreet === 'preflop') {
      var gtoFreqs = GTO.Data.lookupPreflop(h.format, h.stackDepth, 'rfi', h.heroPosition, h.hand);
      result = GTO.Engine.Scoring.scorePreflop(gtoFreqs, userAction);
    } else {
      var spotType = this._getSpotType(h.currentStreet);
      var texture = GTO.Data.BoardCategories.classify(h.board);
      var strength = GTO.Engine.HandEvaluator.classify(h.cards, h.board);
      var gtoFreqs = GTO.Data.lookupPostflop(spotType, texture, strength);
      result = GTO.Engine.Scoring.scorePostflop(gtoFreqs, userAction);
    }

    h.scores.push({ street: h.currentStreet, result: result, action: userAction });
    h.totalEvLoss += (result.evLoss || 0);

    if (userAction === 'fold') {
      h.isComplete = true;
      return result;
    }

    // Advance street
    var streets = ['preflop','flop','turn','river'];
    var idx = streets.indexOf(h.currentStreet);
    if (idx < streets.length - 1) {
      h.currentStreet = streets[idx + 1];
      h.pot *= 2; // simplified pot growth
    } else {
      h.isComplete = true;
    }

    return result;
  },

  _getSpotType: function(street) {
    if (street === 'flop') return 'IP_cbet_flop';
    if (street === 'turn') return 'IP_turn_barrel';
    return 'IP_river_bet';
  },

  getHand: function() { return this._hand; },
  isComplete: function() { return this._hand ? this._hand.isComplete : true; }
};
