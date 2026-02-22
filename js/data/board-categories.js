window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

GTO.Data.BoardCategories = {
  TEXTURES: ['dry_rainbow','dry_twotone','wet_rainbow','wet_twotone','monotone','paired_dry','paired_wet','highly_connected'],
  HAND_STRENGTHS: [
    'air','overcards','weak_draw','gutshot','combo_draw','oesd_or_fd',
    'underpair','weak_pair','second_pair','top_pair_weak','top_pair_strong',
    'overpair','two_pair','trips','set','straight','flush','full_house'
  ],

  // Classify a board (array of card objects {rank, suit}) into a texture
  classify: function(boardCards) {
    if (!boardCards || boardCards.length < 3) return 'dry_rainbow';

    var ranks = boardCards.map(function(c) { return GTO.Data.RANK_VALUES[c.rank]; });
    var suits = boardCards.map(function(c) { return c.suit; });

    // Count suits
    var suitCounts = {};
    suits.forEach(function(s) { suitCounts[s] = (suitCounts[s] || 0) + 1; });
    var maxSuitCount = Math.max.apply(null, Object.values(suitCounts));

    // Check for pairing
    var rankCounts = {};
    ranks.forEach(function(r) { rankCounts[r] = (rankCounts[r] || 0) + 1; });
    var isPaired = Object.values(rankCounts).some(function(c) { return c >= 2; });

    // Check for connectedness
    var sortedRanks = Array.from(new Set(ranks)).sort(function(a,b) { return b - a; });
    var connected = 0;
    for (var i = 0; i < sortedRanks.length - 1; i++) {
      var diff = sortedRanks[i] - sortedRanks[i+1];
      if (diff <= 2) connected++;
    }
    // Wheel potential (A-2-3-4-5)
    if (sortedRanks.indexOf(14) >= 0 && sortedRanks.some(function(r) { return r <= 5; })) connected++;

    var isWet = connected >= 2 || (sortedRanks.length >= 3 && (sortedRanks[0] - sortedRanks[sortedRanks.length-1]) <= 4);
    var isHighlyConnected = connected >= 3 || (sortedRanks.length >= 3 && (sortedRanks[0] - sortedRanks[sortedRanks.length-1]) <= 3 && !isPaired);

    // Monotone: 3+ cards same suit
    if (maxSuitCount >= 3) return 'monotone';

    // Highly connected (non-paired)
    if (isHighlyConnected && !isPaired) return 'highly_connected';

    // Paired boards
    if (isPaired) {
      return isWet ? 'paired_wet' : 'paired_dry';
    }

    // Wet vs dry, rainbow vs twotone
    var isTwoTone = maxSuitCount >= 2;
    if (isWet) return isTwoTone ? 'wet_twotone' : 'wet_rainbow';
    return isTwoTone ? 'dry_twotone' : 'dry_rainbow';
  },

  // Classify hand strength given hole cards and board
  classifyHandStrength: function(holeCards, boardCards) {
    if (!holeCards || holeCards.length < 2 || !boardCards || boardCards.length < 3) return 'air';

    var holeRanks = holeCards.map(function(c) { return GTO.Data.RANK_VALUES[c.rank]; });
    var boardRanks = boardCards.map(function(c) { return GTO.Data.RANK_VALUES[c.rank]; });
    var holeSuits = holeCards.map(function(c) { return c.suit; });
    var boardSuits = boardCards.map(function(c) { return c.suit; });
    var allRanks = holeRanks.concat(boardRanks);
    var allSuits = holeSuits.concat(boardSuits);
    var boardMax = Math.max.apply(null, boardRanks);
    var boardSorted = boardRanks.slice().sort(function(a,b) { return b - a; });

    // ---------------------------------------------------------------
    // 1. Check made hands (strongest first)
    // ---------------------------------------------------------------

    // --- Flush check ---
    var suitCounts = {};
    allSuits.forEach(function(s) { suitCounts[s] = (suitCounts[s] || 0) + 1; });
    var hasFlush = false;
    var flushSuit = null;
    for (var suit in suitCounts) {
      if (suitCounts[suit] >= 5) {
        // Must use at least one hole card
        if (holeSuits.indexOf(suit) >= 0) { hasFlush = true; flushSuit = suit; }
      }
    }

    // --- Straight check (proper algorithm) ---
    var hasStraight = this._hasStraight(allRanks, holeRanks);

    // --- Count pairs/trips/quads across all 7 cards ---
    var allRankCounts = {};
    allRanks.forEach(function(r) { allRankCounts[r] = (allRankCounts[r] || 0) + 1; });

    var boardRankCounts = {};
    boardRanks.forEach(function(r) { boardRankCounts[r] = (boardRankCounts[r] || 0) + 1; });

    // Check what the hole cards contribute
    var isPocketPair = holeRanks[0] === holeRanks[1];

    // Count how hole cards interact with the board
    var holeMatchesBoard = [];
    holeRanks.forEach(function(hr) {
      if (boardRanks.indexOf(hr) >= 0) holeMatchesBoard.push(hr);
    });

    // --- Full house check ---
    // Need at least one three-of-a-kind and one pair (using hole cards)
    var hasFullHouse = false;
    var threeOfAKindRanks = [];
    var pairRanksAll = [];
    for (var r in allRankCounts) {
      if (allRankCounts[r] >= 3) threeOfAKindRanks.push(parseInt(r));
      if (allRankCounts[r] >= 2) pairRanksAll.push(parseInt(r));
    }
    if (threeOfAKindRanks.length >= 1 && pairRanksAll.length >= 2) {
      // Verify hole cards contribute
      if (holeRanks.some(function(hr) {
        return threeOfAKindRanks.indexOf(hr) >= 0 || pairRanksAll.indexOf(hr) >= 0;
      })) {
        hasFullHouse = true;
      }
    }
    // Also: two sets (rare) or pocket pair matching a board pair
    if (threeOfAKindRanks.length >= 2) hasFullHouse = true;

    // Return strongest made hands first
    if (hasFullHouse) return 'full_house';
    if (hasFlush) return 'flush';
    if (hasStraight) return 'straight';

    // --- Set: pocket pair matches a board card (three-of-a-kind with pocket pair) ---
    if (isPocketPair && boardRanks.indexOf(holeRanks[0]) >= 0) return 'set';

    // --- Trips: one hole card matches a paired board rank ---
    var hasTrips = holeRanks.some(function(hr) { return (boardRankCounts[hr] || 0) >= 2; });
    if (hasTrips) return 'trips';

    // --- Two pair: both hole cards pair with board, or pocket pair + one board pair ---
    var pairCount = 0;
    var pairedRanks = [];
    holeRanks.forEach(function(hr) {
      if (boardRanks.indexOf(hr) >= 0) {
        pairCount++;
        pairedRanks.push(hr);
      }
    });
    if (pairCount >= 2) return 'two_pair';
    if (isPocketPair && pairCount >= 1 && pairedRanks.indexOf(holeRanks[0]) < 0) return 'two_pair';

    // ---------------------------------------------------------------
    // 2. Made pairs
    // ---------------------------------------------------------------

    // Overpair: pocket pair above all board cards
    if (isPocketPair && holeRanks[0] > boardMax) return 'overpair';

    // Top pair / second pair / weak pair
    if (pairCount >= 1) {
      var pairedRank = pairedRanks[0];
      if (pairedRank === boardMax) {
        var kicker = holeRanks[0] === pairedRank ? holeRanks[1] : holeRanks[0];
        return kicker >= 11 ? 'top_pair_strong' : 'top_pair_weak'; // J+ is strong kicker
      }
      if (boardSorted.length >= 2 && pairedRank === boardSorted[1]) return 'second_pair';
      return 'weak_pair';
    }

    // Underpair: pocket pair below the lowest board card
    if (isPocketPair && holeRanks[0] < Math.min.apply(null, boardRanks)) return 'underpair';
    // Pocket pair between board cards
    if (isPocketPair) return 'weak_pair';

    // ---------------------------------------------------------------
    // 3. Draws
    // ---------------------------------------------------------------

    // Flush draw: 4 cards of same suit using at least one hole card
    var hasFlushDraw = false;
    for (var suit in suitCounts) {
      if (suitCounts[suit] === 4 && holeSuits.indexOf(suit) >= 0) {
        hasFlushDraw = true;
        break;
      }
    }

    // Straight draw detection (fixed algorithm)
    var straightDrawInfo = this._straightDrawInfo(allRanks, holeRanks);
    var hasOESD = straightDrawInfo.oesd;
    var hasGutshot = straightDrawInfo.gutshot;

    // Combo draw: flush draw + straight draw
    if (hasFlushDraw && (hasOESD || hasGutshot)) return 'combo_draw';
    if (hasFlushDraw || hasOESD) return 'oesd_or_fd';
    if (hasGutshot) return 'gutshot';

    // Backdoor draws (flop only)
    if (boardCards.length === 3) {
      var hasBackdoorFlush = false;
      for (var suit in suitCounts) {
        if (suitCounts[suit] === 3 && holeSuits.indexOf(suit) >= 0) {
          hasBackdoorFlush = true;
          break;
        }
      }
      if (hasBackdoorFlush) return 'weak_draw';
    }

    // ---------------------------------------------------------------
    // 4. Overcards vs air
    // ---------------------------------------------------------------
    var bothOvercards = holeRanks[0] > boardMax && holeRanks[1] > boardMax;
    if (bothOvercards) return 'overcards';

    return 'air';
  },

  // Check if there's a straight using at least one hole card
  _hasStraight: function(allRanks, holeRanks) {
    var unique = Array.from(new Set(allRanks)).sort(function(a,b) { return a - b; });
    // Add low ace for wheel
    if (unique.indexOf(14) >= 0) unique.unshift(1);

    // Sliding window of 5 consecutive ranks
    for (var i = 0; i <= unique.length - 5; i++) {
      if (unique[i+4] - unique[i] === 4) {
        // Check all 5 are consecutive (no duplicates in this range causing gaps)
        var window5 = unique.slice(i, i+5);
        var isConsecutive = true;
        for (var j = 1; j < 5; j++) {
          if (window5[j] - window5[j-1] !== 1) { isConsecutive = false; break; }
        }
        if (isConsecutive) {
          // Verify at least one hole card is part of this straight
          var usesHole = holeRanks.some(function(hr) {
            // Account for ace as 1
            return window5.indexOf(hr) >= 0 || (hr === 14 && window5.indexOf(1) >= 0);
          });
          if (usesHole) return true;
        }
      }
    }
    return false;
  },

  // Detect OESD and gutshot draws using at least one hole card
  _straightDrawInfo: function(allRanks, holeRanks) {
    var unique = Array.from(new Set(allRanks)).sort(function(a,b) { return a - b; });
    // Add low ace for wheel
    if (unique.indexOf(14) >= 0) unique.unshift(1);

    var hasOESD = false;
    var hasGutshot = false;

    // Check all windows of 5 cards for 4-card runs
    for (var i = 0; i <= unique.length - 4; i++) {
      var window4 = unique.slice(i, i + 4);
      var span = window4[3] - window4[0];

      // OESD: 4 consecutive cards (span = 3), not at the edges (A-high or wheel)
      if (span === 3) {
        var consecutive = true;
        for (var j = 1; j < 4; j++) {
          if (window4[j] - window4[j-1] !== 1) { consecutive = false; break; }
        }
        if (consecutive) {
          // Check hole card contributes
          var usesHole = holeRanks.some(function(hr) {
            return window4.indexOf(hr) >= 0 || (hr === 14 && window4.indexOf(1) >= 0);
          });
          if (usesHole) {
            // Open-ended if not capped at both ends
            var lowEnd = window4[0];
            var highEnd = window4[3];
            if (lowEnd > 1 && highEnd < 14) {
              hasOESD = true;
            } else {
              hasGutshot = true; // Gutshot (one end blocked by A or low)
            }
          }
        }
      }

      // Gutshot: 4 cards in a span of 4 (one gap inside)
      if (span === 4 && !hasOESD) {
        // Count gaps
        var gaps = 0;
        for (var j = 1; j < 4; j++) {
          if (window4[j] - window4[j-1] === 2) gaps++;
          else if (window4[j] - window4[j-1] > 2) gaps += 2; // too many gaps
        }
        if (gaps === 1) {
          var usesHole = holeRanks.some(function(hr) {
            return window4.indexOf(hr) >= 0 || (hr === 14 && window4.indexOf(1) >= 0);
          });
          if (usesHole) hasGutshot = true;
        }
      }
    }

    return { oesd: hasOESD, gutshot: hasGutshot && !hasOESD };
  },

  getTextureDescription: function(texture) {
    var descs = {
      dry_rainbow: 'Disconnected board with 3 different suits. Few draws possible.',
      dry_twotone: 'Disconnected board with 2 cards of one suit. One flush draw possible.',
      wet_rainbow: 'Connected board with 3 suits. Multiple straight draws available.',
      wet_twotone: 'Connected board with a flush draw. Many drawing possibilities.',
      monotone: 'All cards same suit. Flush already possible or very likely.',
      paired_dry: 'Board contains a pair on a disconnected board. Trips/full house possible.',
      paired_wet: 'Board contains a pair with connected cards. Many combinations possible.',
      highly_connected: 'Very connected board. Many straight and combo draws available.'
    };
    return descs[texture] || '';
  },

  getStrengthDescription: function(strength) {
    var descs = {
      air: 'No pair, no significant draw',
      overcards: 'Two overcards to the board (e.g. AK on low board)',
      weak_draw: 'Backdoor draw only',
      gutshot: 'Gutshot straight draw (4 outs)',
      combo_draw: 'Flush draw + straight draw combined (12+ outs)',
      oesd_or_fd: 'Open-ended straight draw or flush draw (8-9 outs)',
      underpair: 'Pocket pair below all board cards',
      weak_pair: 'Bottom pair or low pocket pair',
      second_pair: 'Second pair on board',
      top_pair_weak: 'Top pair with weak kicker',
      top_pair_strong: 'Top pair with strong kicker (J+)',
      overpair: 'Pocket pair above all board cards',
      two_pair: 'Two pair (both hole cards paired with board)',
      trips: 'Three of a kind (one hole card + board pair)',
      set: 'Set (pocket pair + board card)',
      straight: 'Straight (5 consecutive ranks)',
      flush: 'Flush (5 cards of same suit)',
      full_house: 'Full house or better'
    };
    return descs[strength] || '';
  }
};
