window.GTO = window.GTO || {};
GTO.Engine = GTO.Engine || {};

GTO.Engine.PostflopDrill = {
  getAvailableActions: function(spotType) {
    if (GTO.Data.isFacingBetSpot && GTO.Data.isFacingBetSpot(spotType)) {
      return ['fold', 'call', 'raise'];
    }
    return ['check', 'bet_33', 'bet_67', 'bet_100'];
  },

  getActionLabels: function(spotType) {
    if (GTO.Data.isFacingBetSpot && GTO.Data.isFacingBetSpot(spotType)) {
      return { fold: 'Fold', call: 'Call', raise: 'Raise' };
    }
    return { check: 'Check', bet_33: 'Bet 1/3', bet_67: 'Bet 2/3', bet_100: 'Bet Pot' };
  }
};
