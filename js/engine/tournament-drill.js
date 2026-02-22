window.GTO = window.GTO || {};
GTO.Engine = GTO.Engine || {};

GTO.Engine.TournamentDrill = {
  getAvailableActions: function(stackBB) {
    if (stackBB <= 15) return ['push', 'fold'];
    return ['fold', 'call', 'raise'];
  },

  getActionLabels: function(stackBB) {
    if (stackBB <= 15) return { push: 'Push All-In', fold: 'Fold' };
    return { fold: 'Fold', call: 'Call', raise: 'Raise' };
  },

  generateICMPressure: function(stage, playersLeft) {
    if (stage === 'bubble') return 1.5;
    if (stage === 'ft') return 1.3;
    return 1.0;
  }
};
