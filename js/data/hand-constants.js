window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

GTO.Data.RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
GTO.Data.SUITS = ['s','h','d','c'];
GTO.Data.SUIT_SYMBOLS = { s: '\u2660', h: '\u2665', d: '\u2666', c: '\u2663' };

GTO.Data.ALL_HANDS = [];
(function() {
  var R = GTO.Data.RANKS;
  for (var i = 0; i < 13; i++) {
    for (var j = 0; j < 13; j++) {
      if (i === j) GTO.Data.ALL_HANDS.push(R[i] + R[j]);
      else if (j > i) GTO.Data.ALL_HANDS.push(R[i] + R[j] + 's');
      else GTO.Data.ALL_HANDS.push(R[j] + R[i] + 'o');
    }
  }
})();

GTO.Data.COMBOS = {};
GTO.Data.ALL_HANDS.forEach(function(h) {
  if (h.length === 2) GTO.Data.COMBOS[h] = 6;
  else if (h.endsWith('s')) GTO.Data.COMBOS[h] = 4;
  else GTO.Data.COMBOS[h] = 12;
});

GTO.Data.TOTAL_COMBOS = 1326;
GTO.Data.isPair = function(h) { return h.length === 2; };
GTO.Data.isSuited = function(h) { return h.endsWith('s'); };
GTO.Data.isOffsuit = function(h) { return h.endsWith('o'); };
GTO.Data.getRanks = function(h) { return [h[0], h[1]]; };
GTO.Data.RANK_VALUES = { A:14, K:13, Q:12, J:11, T:10, '9':9, '8':8, '7':7, '6':6, '5':5, '4':4, '3':3, '2':2 };

GTO.Data.getMatrixPos = function(h) {
  var R = GTO.Data.RANKS;
  if (GTO.Data.isPair(h)) { var idx = R.indexOf(h[0]); return [idx, idx]; }
  if (GTO.Data.isSuited(h)) return [R.indexOf(h[0]), R.indexOf(h[1])];
  return [R.indexOf(h[1]), R.indexOf(h[0])];
};

GTO.Data.POSITIONS = ['UTG','MP','CO','BTN','SB','BB'];
GTO.Data.POSITION_NAMES = {
  UTG: 'Under the Gun', MP: 'Middle Position', CO: 'Cutoff',
  BTN: 'Button', SB: 'Small Blind', BB: 'Big Blind'
};
GTO.Data.STACK_DEPTHS = ['10bb','15bb','20bb','25bb','30bb','40bb','60bb','100bb'];
