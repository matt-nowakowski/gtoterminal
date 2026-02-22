window.GTO = window.GTO || {};
GTO.Engine = GTO.Engine || {};

GTO.Engine.Scoring = {
  // Score a preflop decision
  // gtoFreqs: { fold: 0.5, call: 0.3, raise: 0.2 }
  // userAction: 'fold' | 'call' | 'raise'
  scorePreflop: function(gtoFreqs, userAction) {
    if (!gtoFreqs) {
      // No data for this spot — treat as fold-default, don't penalize
      gtoFreqs = { fold: 0.5, call: 0.25, raise: 0.25 };
    }

    var userFreq = gtoFreqs[userAction] || 0;

    // Find the highest frequency action
    var actions = ['fold','call','raise'];
    var bestAction = actions[0];
    var bestFreq = 0;
    actions.forEach(function(a) {
      if ((gtoFreqs[a] || 0) > bestFreq) { bestFreq = gtoFreqs[a] || 0; bestAction = a; }
    });

    var isOptimal = userAction === bestAction;
    var isPure = bestFreq >= 0.95;

    // EV loss estimation (simplified)
    // Pure action missed = larger EV loss
    // Mixed spot = smaller EV loss for any reasonable action
    var evLoss = 0;
    if (!isOptimal) {
      if (userFreq >= 0.3) {
        evLoss = -0.05; // Acceptable play in a mixed spot
      } else if (userFreq >= 0.1) {
        evLoss = -0.15; // Suboptimal but not terrible
      } else if (userFreq > 0) {
        evLoss = -0.3; // Bad play, low frequency
      } else {
        evLoss = isPure ? -0.8 : -0.5; // Not in the strategy at all
      }
    }

    // Verdict
    var verdict;
    if (userFreq >= 0.9) verdict = 'optimal';
    else if (userFreq >= 0.3) verdict = 'acceptable';
    else if (userFreq >= 0.1) verdict = 'suboptimal';
    else verdict = 'mistake';

    return {
      verdict: verdict,
      evLoss: evLoss,
      isOptimal: isOptimal,
      userAction: userAction,
      userFreq: userFreq,
      bestAction: bestAction,
      bestFreq: bestFreq,
      gtoFreqs: gtoFreqs,
      isPure: isPure
    };
  },

  // Score a postflop decision
  scorePostflop: function(gtoFreqs, userAction) {
    if (!gtoFreqs) {
      gtoFreqs = { check: 0.5, bet_33: 0.2, bet_67: 0.2, bet_100: 0.1 };
    }

    var userFreq = gtoFreqs[userAction] || 0;
    var actions = Object.keys(gtoFreqs);
    var bestAction = actions[0];
    var bestFreq = 0;
    actions.forEach(function(a) {
      if (gtoFreqs[a] > bestFreq) { bestFreq = gtoFreqs[a]; bestAction = a; }
    });

    var isOptimal = userAction === bestAction;
    var evLoss = 0;
    if (!isOptimal) {
      if (userFreq >= 0.25) evLoss = -0.1;
      else if (userFreq >= 0.1) evLoss = -0.25;
      else if (userFreq > 0) evLoss = -0.4;
      else evLoss = -0.7;
    }

    var verdict;
    if (userFreq >= 0.8) verdict = 'optimal';
    else if (userFreq >= 0.25) verdict = 'acceptable';
    else if (userFreq >= 0.1) verdict = 'suboptimal';
    else verdict = 'mistake';

    return {
      verdict: verdict, evLoss: evLoss, isOptimal: isOptimal,
      userAction: userAction, userFreq: userFreq,
      bestAction: bestAction, bestFreq: bestFreq,
      gtoFreqs: gtoFreqs
    };
  },

  // Score push/fold decision
  scorePushFold: function(shouldPush, userAction) {
    var correct = (shouldPush && userAction === 'push') || (!shouldPush && userAction === 'fold');
    return {
      verdict: correct ? 'optimal' : 'mistake',
      evLoss: correct ? 0 : -0.5,
      isOptimal: correct,
      userAction: userAction,
      correctAction: shouldPush ? 'push' : 'fold'
    };
  },

  // Get verdict CSS class
  getVerdictClass: function(verdict) {
    var classes = { optimal: 'verdict-optimal', acceptable: 'verdict-acceptable', suboptimal: 'verdict-mistake', mistake: 'verdict-mistake', unknown: '' };
    return classes[verdict] || '';
  },

  // Get verdict icon
  getVerdictIcon: function(verdict) {
    var icons = { optimal: '+', acceptable: '~', suboptimal: '-', mistake: 'X', unknown: '?' };
    return icons[verdict] || '?';
  },

  // Get verdict label
  getVerdictLabel: function(verdict) {
    var labels = { optimal: 'OPTIMAL', acceptable: 'ACCEPTABLE', suboptimal: 'SUBOPTIMAL', mistake: 'MISTAKE', unknown: 'UNKNOWN' };
    return labels[verdict] || 'UNKNOWN';
  }
};
