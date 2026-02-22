window.GTO = window.GTO || {};
GTO.UI = GTO.UI || {};

GTO.UI.HandMatrix = {
  // Update matrix with range data
  // rangeData: { 'AKs': {fold: 0.1, call: 0.3, raise: 0.6}, ... }
  // action: which action to show frequencies for ('raise' for RFI)
  updateMatrix: function(matrixId, rangeData, highlightAction, activeHand) {
    try {
      var table = document.getElementById(matrixId);
      if (!table) return;

      var cells = table.querySelectorAll('td[data-hand]');
      cells.forEach(function(cell) {
        var hand = cell.getAttribute('data-hand');
        cell.className = ''; // reset classes

        var actionClass = 'action-fold';
        if (rangeData && rangeData[hand]) {
          var freqs = rangeData[hand];
          var r = freqs.raise || 0;
          var c = freqs.call || 0;
          var f = freqs.fold || 0;
          var totalAction = r + c;

          if (totalAction < 0.05) {
            // Pure fold
            actionClass = 'action-fold';
          } else if (r >= 0.85 && c < 0.1) {
            // Pure raise
            actionClass = 'action-raise';
          } else if (c >= 0.85 && r < 0.1) {
            // Pure call
            actionClass = 'action-call';
          } else if (totalAction >= 0.4) {
            // Mixed with significant action
            if (r > c * 2) actionClass = 'action-mixed-raise';
            else if (c > r * 2) actionClass = 'action-mixed-call';
            else actionClass = 'action-mixed-even';
          } else {
            // Low frequency action (mostly fold)
            actionClass = 'action-mixed-low';
          }
        }

        cell.classList.add(actionClass);

        // Hand type classes
        if (GTO.Data.isPair(hand)) cell.classList.add('hand-pair');
        else if (GTO.Data.isSuited(hand)) cell.classList.add('hand-suited');

        // Active hand highlight
        if (activeHand && hand === activeHand) cell.classList.add('active-hand');
      });
    } catch(e) {
      console.error('[HandMatrix] updateMatrix error:', e);
    }
  },

  clearMatrix: function(matrixId) {
    var table = document.getElementById(matrixId);
    if (!table) return;
    table.querySelectorAll('td[data-hand]').forEach(function(cell) {
      cell.className = 'action-fold';
      if (GTO.Data.isPair(cell.getAttribute('data-hand'))) cell.classList.add('hand-pair');
      else if (GTO.Data.isSuited(cell.getAttribute('data-hand'))) cell.classList.add('hand-suited');
    });
  },

  // Show full range for a preflop scenario
  showPreflopRange: function(matrixId, scenario) {
    var rangeData = GTO.Engine.PreflopDrill.getRangeForScenario(scenario);
    // RFI: show raise frequency. vs_raise/vs_3bet: show combined action (call+raise)
    var action = scenario.actionContext === 'rfi' ? 'raise' : 'action';
    this.updateMatrix(matrixId, rangeData, action, scenario.hand);
  }
};
