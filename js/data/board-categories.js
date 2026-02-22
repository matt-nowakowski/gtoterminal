window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

GTO.Data.BoardCategories = {
  TEXTURES: ['dry_rainbow','dry_twotone','wet_rainbow','wet_twotone','monotone','paired_dry','paired_wet','highly_connected'],
  HAND_STRENGTHS: ['air','weak_draw','gutshot','oesd_or_fd','weak_pair','second_pair','top_pair_weak','top_pair_strong','overpair','two_pair_plus'],

  // Classify a board (array of card objects {rank, suit}) into a texture
  classify: function(boardCards) {
    if (!boardCards || boardCards.length < 3) return 'dry_rainbow';

    var ranks = boardCards.map(c => GTO.Data.RANK_VALUES[c.rank]);
    var suits = boardCards.map(c => c.suit);

    // Count suits
    var suitCounts = {};
    suits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });
    var maxSuitCount = Math.max(...Object.values(suitCounts));
    var uniqueSuits = Object.keys(suitCounts).length;

    // Check for pairing
    var rankCounts = {};
    ranks.forEach(r => { rankCounts[r] = (rankCounts[r] || 0) + 1; });
    var isPaired = Object.values(rankCounts).some(c => c >= 2);

    // Check for connectedness (straight draw potential)
    var sortedRanks = [...new Set(ranks)].sort((a,b) => b - a);
    var gaps = 0;
    var connected = 0;
    for (var i = 0; i < sortedRanks.length - 1; i++) {
      var diff = sortedRanks[i] - sortedRanks[i+1];
      if (diff <= 2) connected++;
      else gaps++;
    }
    // Also check for wheel potential (A-2-3-4-5)
    if (sortedRanks.includes(14) && sortedRanks.some(r => r <= 5)) connected++;

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

    var holeRanks = holeCards.map(c => GTO.Data.RANK_VALUES[c.rank]);
    var boardRanks = boardCards.map(c => GTO.Data.RANK_VALUES[c.rank]);
    var holeSuits = holeCards.map(c => c.suit);
    var boardSuits = boardCards.map(c => c.suit);
    var allRanks = holeRanks.concat(boardRanks);
    var allSuits = holeSuits.concat(boardSuits);

    var boardMax = Math.max(...boardRanks);
    var boardSorted = [...boardRanks].sort((a,b) => b - a);

    // Check for pairs/sets/etc with board
    var pairCount = 0;
    var hasTwoPair = false;
    var hasSet = false;
    var pairRanks = [];

    holeRanks.forEach(hr => {
      if (boardRanks.includes(hr)) {
        pairCount++;
        pairRanks.push(hr);
      }
    });

    // Check if hole cards are a pocket pair
    var isPocketPair = holeRanks[0] === holeRanks[1];

    // Two pair: both hole cards pair with board, or pocket pair + one pairs
    if (pairCount >= 2) hasTwoPair = true;
    if (isPocketPair && pairCount >= 1 && !pairRanks.includes(holeRanks[0])) hasTwoPair = true;

    // Set: pocket pair matches a board card
    if (isPocketPair && boardRanks.includes(holeRanks[0])) hasSet = true;

    // Trips: one hole card matches a paired board card
    var boardRankCounts = {};
    boardRanks.forEach(r => { boardRankCounts[r] = (boardRankCounts[r] || 0) + 1; });
    var hasTrips = holeRanks.some(hr => (boardRankCounts[hr] || 0) >= 2);

    // Two pair+ check
    if (hasSet || hasTrips || hasTwoPair) return 'two_pair_plus';

    // Overpair: pocket pair above all board cards
    if (isPocketPair && holeRanks[0] > boardMax) return 'overpair';

    // Top pair
    if (pairCount >= 1) {
      var pairedRank = pairRanks[0];
      if (pairedRank === boardMax) {
        // Top pair - check kicker
        var kicker = holeRanks[0] === pairedRank ? holeRanks[1] : holeRanks[0];
        return kicker >= 11 ? 'top_pair_strong' : 'top_pair_weak'; // J+ is strong kicker
      }
      if (pairedRank === boardSorted[1]) return 'second_pair';
      return 'weak_pair';
    }

    // Pocket pair below board (underpair)
    if (isPocketPair) return 'weak_pair';

    // Draw detection
    // Flush draw: 2 hole suit cards match 2+ board suit cards
    var suitCounts = {};
    allSuits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });
    var hasFlushDraw = Object.values(suitCounts).some(c => c >= 4);

    // Straight draw detection (simplified)
    var uniqueAll = [...new Set(allRanks)].sort((a,b) => a - b);
    // Add low ace for wheel
    if (uniqueAll.includes(14)) uniqueAll.unshift(1);

    var maxConsecutive = 1;
    var currentConsecutive = 1;
    for (var i = 1; i < uniqueAll.length; i++) {
      if (uniqueAll[i] - uniqueAll[i-1] === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else if (uniqueAll[i] - uniqueAll[i-1] === 2) {
        // Gap of 1 = gutshot potential
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    var hasOESD = maxConsecutive >= 4 && !hasFlushDraw;
    var hasGutshot = maxConsecutive >= 3;

    if (hasFlushDraw || hasOESD) return 'oesd_or_fd';
    if (hasGutshot) return 'gutshot';

    // Check for backdoor draws
    var hasBackdoorFlush = Object.values(suitCounts).some(c => c >= 3) && boardCards.length === 3;
    if (hasBackdoorFlush) return 'weak_draw';

    return 'air';
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
      weak_draw: 'Backdoor draw only',
      gutshot: 'Gutshot straight draw (4 outs)',
      oesd_or_fd: 'Open-ended straight draw or flush draw (8-9 outs)',
      weak_pair: 'Bottom pair or underpair',
      second_pair: 'Second pair on board',
      top_pair_weak: 'Top pair with weak kicker',
      top_pair_strong: 'Top pair with strong kicker (J+)',
      overpair: 'Pocket pair above all board cards',
      two_pair_plus: 'Two pair, set, or better'
    };
    return descs[strength] || '';
  }
};
