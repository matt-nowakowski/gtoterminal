window.GTO = window.GTO || {};
GTO.Engine = GTO.Engine || {};

GTO.Engine.HandEvaluator = {
  classify: function(holeCards, boardCards) {
    return GTO.Data.BoardCategories.classifyHandStrength(holeCards, boardCards);
  },

  // Estimate equity using Monte Carlo when board is available, bucket-based otherwise
  estimateEquity: function(handStrengthOrCards, boardCards) {
    // If called with cards, do Monte Carlo
    if (Array.isArray(handStrengthOrCards) && handStrengthOrCards.length === 2 &&
        handStrengthOrCards[0].rank !== undefined) {
      if (boardCards && boardCards.length >= 3) {
        return this.monteCarloEquity(handStrengthOrCards, boardCards, 300);
      }
    }

    // Fallback: bucket-based estimate
    var strength = typeof handStrengthOrCards === 'string' ? handStrengthOrCards : 'air';
    var equities = {
      air: 0.12, overcards: 0.22, weak_draw: 0.20, gutshot: 0.28,
      combo_draw: 0.48, oesd_or_fd: 0.38, underpair: 0.25, weak_pair: 0.32,
      second_pair: 0.42, top_pair_weak: 0.52, top_pair_strong: 0.62,
      overpair: 0.68, two_pair: 0.75, trips: 0.80, set: 0.85,
      straight: 0.82, flush: 0.88, full_house: 0.95
    };
    return equities[strength] || 0.12;
  },

  // Rank a 7-card hand (best 5 of 7). Higher number = better hand.
  rankHand: function(sevenCards) {
    if (!sevenCards || sevenCards.length < 5) return 0;

    var combos = this._combinations(sevenCards, 5);
    var bestRank = 0;
    for (var i = 0; i < combos.length; i++) {
      var rank = this._evaluate5(combos[i]);
      if (rank > bestRank) bestRank = rank;
    }
    return bestRank;
  },

  // Evaluate a 5-card poker hand. Returns numeric rank (higher = better).
  // Category * 10000000 + tiebreakers
  _evaluate5: function(cards) {
    var ranks = cards.map(function(c) { return GTO.Data.RANK_VALUES[c.rank]; }).sort(function(a,b) { return b - a; });
    var suits = cards.map(function(c) { return c.suit; });

    // Check flush
    var isFlush = suits[0] === suits[1] && suits[1] === suits[2] && suits[2] === suits[3] && suits[3] === suits[4];

    // Check straight
    var isStraight = false;
    var straightHigh = 0;
    if (ranks[0] - ranks[4] === 4 &&
        new Set(ranks).size === 5) {
      isStraight = true;
      straightHigh = ranks[0];
    }
    // Wheel: A-2-3-4-5
    if (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2) {
      isStraight = true;
      straightHigh = 5; // 5-high straight
    }

    // Count ranks
    var counts = {};
    ranks.forEach(function(r) { counts[r] = (counts[r] || 0) + 1; });
    var groups = Object.keys(counts).map(function(r) {
      return { rank: parseInt(r), count: counts[r] };
    });
    // Sort by count desc, then rank desc
    groups.sort(function(a, b) {
      if (b.count !== a.count) return b.count - a.count;
      return b.rank - a.rank;
    });

    var cat = 0;
    var tb = 0; // tiebreaker

    if (isStraight && isFlush) {
      // Straight flush
      cat = 8;
      tb = straightHigh;
    } else if (groups[0].count === 4) {
      // Four of a kind
      cat = 7;
      tb = groups[0].rank * 100 + groups[1].rank;
    } else if (groups[0].count === 3 && groups[1].count === 2) {
      // Full house
      cat = 6;
      tb = groups[0].rank * 100 + groups[1].rank;
    } else if (isFlush) {
      cat = 5;
      tb = ranks[0] * 10000 + ranks[1] * 1000 + ranks[2] * 100 + ranks[3] * 10 + ranks[4];
    } else if (isStraight) {
      cat = 4;
      tb = straightHigh;
    } else if (groups[0].count === 3) {
      // Three of a kind
      cat = 3;
      var kickers = groups.slice(1).map(function(g) { return g.rank; }).sort(function(a,b) { return b - a; });
      tb = groups[0].rank * 10000 + kickers[0] * 100 + kickers[1];
    } else if (groups[0].count === 2 && groups[1].count === 2) {
      // Two pair
      cat = 2;
      var pairHigh = Math.max(groups[0].rank, groups[1].rank);
      var pairLow = Math.min(groups[0].rank, groups[1].rank);
      tb = pairHigh * 10000 + pairLow * 100 + groups[2].rank;
    } else if (groups[0].count === 2) {
      // One pair
      cat = 1;
      var kickers = groups.slice(1).map(function(g) { return g.rank; }).sort(function(a,b) { return b - a; });
      tb = groups[0].rank * 1000000 + kickers[0] * 10000 + kickers[1] * 100 + kickers[2];
    } else {
      // High card
      cat = 0;
      tb = ranks[0] * 100000000 + ranks[1] * 1000000 + ranks[2] * 10000 + ranks[3] * 100 + ranks[4];
    }

    return cat * 10000000000 + tb;
  },

  // Generate all k-element combinations from array
  _combinations: function(arr, k) {
    var results = [];
    var combo = new Array(k);

    function recurse(start, depth) {
      if (depth === k) {
        results.push(combo.slice());
        return;
      }
      for (var i = start; i <= arr.length - (k - depth); i++) {
        combo[depth] = arr[i];
        recurse(i + 1, depth + 1);
      }
    }

    recurse(0, 0);
    return results;
  },

  // Monte Carlo equity estimation
  // Deals random opponent hands and compares showdown values
  monteCarloEquity: function(holeCards, boardCards, numTrials) {
    numTrials = numTrials || 500;

    // Build remaining deck (remove hero's cards and board cards)
    var usedKeys = {};
    holeCards.forEach(function(c) { usedKeys[c.rank + c.suit] = true; });
    boardCards.forEach(function(c) { usedKeys[c.rank + c.suit] = true; });

    var RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
    var SUITS = ['s','h','d','c'];
    var remaining = [];
    for (var ri = 0; ri < RANKS.length; ri++) {
      for (var si = 0; si < SUITS.length; si++) {
        var key = RANKS[ri] + SUITS[si];
        if (!usedKeys[key]) {
          remaining.push({ rank: RANKS[ri], suit: SUITS[si] });
        }
      }
    }

    var cardsNeeded = 5 - boardCards.length; // cards to complete board
    var wins = 0;
    var ties = 0;

    for (var t = 0; t < numTrials; t++) {
      // Shuffle remaining deck (Fisher-Yates on a copy)
      var deck = remaining.slice();
      for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
      }

      // Complete board
      var fullBoard = boardCards.concat(deck.slice(0, cardsNeeded));
      // Deal villain cards
      var villainCards = deck.slice(cardsNeeded, cardsNeeded + 2);

      if (villainCards.length < 2) continue;

      // Evaluate both hands
      var heroHand = holeCards.concat(fullBoard);
      var villainHand = villainCards.concat(fullBoard);

      var heroRank = this.rankHand(heroHand);
      var villainRank = this.rankHand(villainHand);

      if (heroRank > villainRank) wins++;
      else if (heroRank === villainRank) ties++;
    }

    return (wins + ties * 0.5) / numTrials;
  }
};
