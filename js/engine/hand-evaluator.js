window.GTO = window.GTO || {};
GTO.Engine = GTO.Engine || {};

GTO.Engine.HandEvaluator = {
  classify: function(holeCards, boardCards) {
    return GTO.Data.BoardCategories.classifyHandStrength(holeCards, boardCards);
  },

  // Rough equity estimate based on hand strength bucket
  estimateEquity: function(handStrength) {
    var equities = {
      air: 0.15, weak_draw: 0.25, gutshot: 0.30, oesd_or_fd: 0.40,
      weak_pair: 0.35, second_pair: 0.45, top_pair_weak: 0.55,
      top_pair_strong: 0.65, overpair: 0.70, two_pair_plus: 0.80
    };
    return equities[handStrength] || 0.15;
  }
};
