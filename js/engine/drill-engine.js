window.GTO = window.GTO || {};
GTO.Engine = GTO.Engine || {};

GTO.Engine.DrillEngine = {
  _session: null,
  _currentScenario: null,
  _drillIndex: 0,
  _onScenario: null,
  _onResult: null,
  _onSessionEnd: null,

  startSession: function(config, callbacks) {
    this._session = {
      id: GTO.Utils.uid(),
      type: config.drillType,
      format: config.format || 'cash',
      config: config,
      startTime: Date.now(),
      decisions: [],
      targetCount: config.count || 50,
      correct: 0,
      totalEvLoss: 0
    };
    this._drillIndex = 0;
    this._onScenario = callbacks.onScenario;
    this._onResult = callbacks.onResult;
    this._onSessionEnd = callbacks.onSessionEnd;

    GTO.State.set('session', this._session);
    this.nextDrill();
  },

  nextDrill: function() {
    if (!this._session) return;
    if (this._drillIndex >= this._session.targetCount && this._session.targetCount > 0) {
      this.endSession();
      return;
    }

    this._drillIndex++;
    var config = this._session.config;
    var scenario;

    if (this._session.type === 'preflop') {
      scenario = GTO.Engine.ScenarioGenerator.preflop(config);
    } else if (this._session.type === 'postflop') {
      scenario = GTO.Engine.ScenarioGenerator.postflop(config);
    } else if (this._session.type === 'tournament') {
      scenario = GTO.Engine.ScenarioGenerator.tournament(config);
    }

    this._currentScenario = scenario;
    GTO.State.set('currentDrill', { scenario: scenario, index: this._drillIndex });

    if (this._onScenario) this._onScenario(scenario, this._drillIndex);
  },

  submitAnswer: function(userAction) {
    if (!this._currentScenario) return null;

    var scenario = this._currentScenario;
    var result;

    if (scenario.type === 'preflop') {
      var gtoFreqs = GTO.Data.lookupPreflop(
        scenario.format, scenario.stackDepth,
        scenario.actionContext, scenario.positionKey || scenario.position,
        scenario.hand
      );
      result = GTO.Engine.Scoring.scorePreflop(gtoFreqs, userAction);
    } else if (scenario.type === 'postflop') {
      var gtoFreqs = GTO.Data.lookupPostflop(scenario.spotType, scenario.boardTexture, scenario.handStrength);
      result = GTO.Engine.Scoring.scorePostflop(gtoFreqs, userAction);
    } else if (scenario.type === 'tournament') {
      var lookup = GTO.Data.lookupPushFold(6, scenario.position, scenario.stackBB, scenario.hand);
      result = GTO.Engine.Scoring.scorePushFold(lookup.inRange, userAction);
    }

    // Record decision
    var decision = {
      timestamp: Date.now(),
      scenario: {
        type: scenario.type,
        hand: scenario.hand,
        position: scenario.position,
        stackDepth: scenario.stackDepth || scenario.stackBB,
        actionContext: scenario.actionContext || scenario.spotType,
        format: scenario.format
      },
      userAction: userAction,
      result: result,
      drillIndex: this._drillIndex
    };

    this._session.decisions.push(decision);
    if (result.isOptimal) this._session.correct++;
    this._session.totalEvLoss += (result.evLoss || 0);

    // Track in analytics
    if (GTO.Analytics && GTO.Analytics.Tracker) {
      GTO.Analytics.Tracker.record(decision);
    }

    GTO.State.set('session', this._session);

    if (this._onResult) this._onResult(result, scenario, decision);

    return result;
  },

  endSession: function() {
    if (!this._session) return;
    this._session.endTime = Date.now();
    this._session.totalDrills = this._session.decisions.length;
    this._session.accuracy = this._session.totalDrills > 0 ? this._session.correct / this._session.totalDrills : 0;

    // Save to history
    // Compress decisions for storage (keep essential info)
    var compactDecisions = this._session.decisions.map(function(d) {
      return {
        hand: d.scenario.hand,
        position: d.scenario.position,
        context: d.scenario.actionContext || d.scenario.type,
        userAction: d.userAction,
        bestAction: d.result.bestAction || d.result.correctAction,
        verdict: d.result.verdict,
        evLoss: d.result.evLoss || 0
      };
    });

    var summary = {
      id: this._session.id,
      type: this._session.type,
      format: this._session.format,
      date: this._session.startTime,
      endDate: this._session.endTime,
      totalDrills: this._session.totalDrills,
      accuracy: this._session.accuracy,
      totalEvLoss: this._session.totalEvLoss,
      config: this._session.config,
      decisions: compactDecisions
    };

    var history = GTO.State.get('history') || [];
    history.unshift(summary);
    if (history.length > 200) history = history.slice(0, 200);
    GTO.State.set('history', history);

    if (this._onSessionEnd) this._onSessionEnd(this._session);

    GTO.State.set('session', null);
    GTO.State.set('currentDrill', null);
    this._session = null;
    this._currentScenario = null;
  },

  getSession: function() { return this._session; },
  getCurrentScenario: function() { return this._currentScenario; },
  getProgress: function() {
    if (!this._session) return { current: 0, total: 0, accuracy: 0, evLoss: 0 };
    var total = this._session.decisions.length;
    return {
      current: total,
      total: this._session.targetCount,
      accuracy: total > 0 ? this._session.correct / total : 0,
      evLoss: this._session.totalEvLoss
    };
  },

  isActive: function() { return this._session !== null; }
};
