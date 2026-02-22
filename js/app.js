window.GTO = window.GTO || {};

GTO.App = {
  init: function() {
    // Initialize core systems
    GTO.State.init();
    GTO.Keyboard.init();

    // Initialize UI
    GTO.UI.Panels.init();
    GTO.UI.Nav.init();
    GTO.UI.Modal.init();

    // Load settings into UI
    this._loadSettings();

    // Set up views
    this._setupExplore();
    this._setupDrillTypeSelector();
    this._setupPreflopDrill();
    this._setupPostflopDrill();
    this._setupTournamentDrill();
    this._setupSessionSummary();
    this._setupPlaythrough();
    this._setupPlans();
    this._setupLearn();

    // Global keyboard shortcuts
    GTO.Keyboard.register('global', '?', function() { GTO.UI.Modal.open('modal-help'); });
    GTO.Keyboard.register('global', 'escape', function() { GTO.UI.Modal.closeAll(); });

    // Settings button
    var settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) settingsBtn.addEventListener('click', function() { GTO.UI.Modal.open('modal-settings'); });
    var helpBtn = document.getElementById('btn-help');
    if (helpBtn) helpBtn.addEventListener('click', function() { GTO.UI.Modal.open('modal-help'); });

    // Status bar clock
    this._updateClock();
    setInterval(this._updateClock, 60000);

    // Update format display
    GTO.UI.HUD.updateFormat(GTO.State.get('settings.format'));

    console.log('%c[GTOTerminal] Ready.', 'color: #ff8c00; font-weight: bold');
  },

  _loadSettings: function() {
    var settings = GTO.State.get('settings');
    // Load API key into settings modal
    var apiKeyInput = document.getElementById('settings-api-key');
    if (apiKeyInput && settings.groqApiKey) apiKeyInput.value = settings.groqApiKey;

    // Save settings on change
    if (apiKeyInput) {
      apiKeyInput.addEventListener('change', function() {
        GTO.State.set('settings.groqApiKey', this.value);
        GTO.UI.Toast.success('API key saved');
      });
    }

    // Format toggles in settings
    document.querySelectorAll('#modal-settings .toggle-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        var group = this.parentElement;
        group.querySelectorAll('.toggle-option').forEach(function(o) { o.classList.remove('active'); });
        this.classList.add('active');
        if (group.id === 'settings-format') {
          GTO.State.set('settings.format', this.getAttribute('data-value'));
          GTO.UI.HUD.updateFormat(this.getAttribute('data-value'));
        }
      });
    });

    // Reset data button
    var resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (confirm('Reset all training data? This cannot be undone.')) {
          GTO.Storage.clear();
          GTO.State.init();
          GTO.UI.Toast.info('All data reset');
          location.reload();
        }
      });
    }
  },

  _setupPreflopDrill: function() {
    var self = this;

    // Config UI: toggle chips
    document.querySelectorAll('#preflop-config .checkbox-chip').forEach(function(chip) {
      chip.addEventListener('click', function() { this.classList.toggle('checked'); });
    });
    document.querySelectorAll('#preflop-config .toggle-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        var group = this.parentElement;
        group.querySelectorAll('.toggle-option').forEach(function(o) { o.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    // Start drill button
    var startBtn = document.getElementById('btn-start-preflop');
    if (startBtn) {
      startBtn.addEventListener('click', function() { self._startPreflopSession(); });
    }

    // Action buttons
    var actionBtns = document.querySelectorAll('#preflop-actions .action-btn');
    actionBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = this.getAttribute('data-action');
        if (action) self._submitPreflopAction(action);
      });
    });

    // Keyboard shortcuts for drill
    GTO.Keyboard.register('drill-preflop', 'f', function() { self._submitPreflopAction('fold'); });
    GTO.Keyboard.register('drill-preflop', 'c', function() { self._submitPreflopAction('call'); });
    GTO.Keyboard.register('drill-preflop', 'r', function() { self._submitPreflopAction('raise'); });
    GTO.Keyboard.register('result', 'n', function() { self._nextDrill(); });
    GTO.Keyboard.register('result', ' ', function() { self._nextDrill(); });

    // Next button (added dynamically in feedback area)
    // Drills advance via keyboard Space/N

    // AI explain button
    var explainBtn = document.getElementById('btn-explain-preflop');
    if (explainBtn) {
      explainBtn.addEventListener('click', function() { self._requestAIExplanation(); });
    }
    GTO.Keyboard.register('result', 'e', function() { self._requestAIExplanation(); });
  },

  _startPreflopSession: function() {
    // Read config from UI
    var format = 'cash';
    var formatToggle = document.querySelector('#preflop-format-toggle .toggle-option.active');
    if (formatToggle) format = formatToggle.getAttribute('data-value') || 'cash';

    var stackDepths = [];
    document.querySelectorAll('#preflop-stack-chips .checkbox-chip.checked').forEach(function(c) {
      stackDepths.push(c.getAttribute('data-value'));
    });
    if (stackDepths.length === 0) stackDepths = ['100bb'];

    var positions = [];
    document.querySelectorAll('#preflop-position-chips .checkbox-chip.checked').forEach(function(c) {
      positions.push(c.getAttribute('data-value'));
    });
    if (positions.length === 0) positions = GTO.Data.POSITIONS.slice();

    var actionContexts = [];
    document.querySelectorAll('#preflop-action-chips .checkbox-chip.checked').forEach(function(c) {
      actionContexts.push(c.getAttribute('data-value'));
    });
    if (actionContexts.length === 0) actionContexts = ['rfi'];

    var countEl = document.querySelector('#preflop-drill-count .toggle-option.active');
    var count = countEl ? parseInt(countEl.getAttribute('data-value')) || 0 : 50;

    var config = {
      drillType: 'preflop',
      format: format,
      stackDepths: stackDepths,
      positions: positions,
      actionContexts: actionContexts,
      count: count
    };

    var self = this;
    GTO.Engine.DrillEngine.startSession(config, {
      onScenario: function(scenario, index) { self._renderPreflopScenario(scenario, index); },
      onResult: function(result, scenario) { self._renderPreflopResult(result, scenario); },
      onSessionEnd: function(session) { self._renderSessionEnd(session); }
    });

    // Show active drill, hide config
    var configEl = document.getElementById('preflop-config');
    var activeEl = document.getElementById('preflop-active');
    if (configEl) configEl.classList.add('hidden');
    if (activeEl) activeEl.classList.remove('hidden');

    GTO.Keyboard.setContext('drill-preflop');
    this._showDrillProgress();
  },

  _renderPreflopScenario: function(scenario, index) {
    // Render cards
    GTO.UI.BoardDisplay.renderHoleCards('hero-cards', scenario.cards);

    // Update table display
    GTO.UI.HUD.updateTable('table-display', scenario.position, scenario.villainPosition);

    // Update stat rows
    GTO.UI.HUD.updateStat('stat-position', scenario.position + ' (' + (GTO.Data.POSITION_NAMES[scenario.position] || '') + ')');
    GTO.UI.HUD.updateStat('stat-stack', scenario.stackDepth);
    GTO.UI.HUD.updateStat('stat-villain', scenario.villainPosition ? scenario.villainPosition + ' opens' : 'Folds to you');
    GTO.UI.HUD.updateStat('stat-action', scenario.description);

    // Show/hide call button based on context
    var callBtn = document.querySelector('#preflop-actions .btn-call');
    if (callBtn) {
      callBtn.style.display = scenario.actionContext === 'rfi' ? 'none' : 'flex';
    }

    // Update action labels
    var labels = GTO.Engine.PreflopDrill.getActionLabels(scenario.actionContext);
    document.querySelectorAll('#preflop-actions .action-btn').forEach(function(btn) {
      var action = btn.getAttribute('data-action');
      var labelEl = btn.querySelector('.action-label');
      if (labelEl && labels[action]) labelEl.textContent = labels[action];
    });

    // Clear feedback and matrix
    var feedbackEmpty = document.getElementById('feedback-empty');
    var feedbackContent = document.getElementById('feedback-content');
    if (feedbackEmpty) feedbackEmpty.classList.remove('hidden');
    if (feedbackContent) feedbackContent.classList.add('hidden');
    GTO.UI.HandMatrix.clearMatrix('hand-matrix-table');

    // Enable action buttons
    document.querySelectorAll('#preflop-actions .action-btn').forEach(function(b) { b.disabled = false; });

    // Update status bar
    GTO.UI.HUD.updateStatusBar(GTO.Engine.DrillEngine.getProgress());

    // Hide AI insight
    var aiInsight = document.getElementById('ai-insight-preflop');
    if (aiInsight) aiInsight.parentElement.style.display = 'none';
    var explainBtn = document.getElementById('btn-explain-preflop');
    if (explainBtn) explainBtn.style.display = 'none';
  },

  _submitPreflopAction: function(action) {
    if (!GTO.Engine.DrillEngine.isActive()) return;
    if (GTO.Keyboard.getContext() !== 'drill-preflop') return;

    var result = GTO.Engine.DrillEngine.submitAnswer(action);
    if (!result) return;

    // Disable action buttons
    document.querySelectorAll('#preflop-actions .action-btn').forEach(function(b) { b.disabled = true; });

    // Switch to result context
    GTO.Keyboard.setContext('result');
  },

  _renderPreflopResult: function(result, scenario) {
    var feedbackEmpty = document.getElementById('feedback-empty');
    var feedbackContent = document.getElementById('feedback-content');
    if (feedbackEmpty) feedbackEmpty.classList.add('hidden');
    if (feedbackContent) feedbackContent.classList.remove('hidden');

    // GTO Frequency bars
    var freqs = result.gtoFreqs || {};
    this._renderFreqBar('freq-fold', freqs.fold || 0, 'fill-fold');
    this._renderFreqBar('freq-call', freqs.call || 0, 'fill-call');
    this._renderFreqBar('freq-raise', freqs.raise || 0, 'fill-raise');

    // Verdict
    var verdictEl = document.getElementById('verdict');
    if (verdictEl) {
      verdictEl.className = 'verdict ' + GTO.Engine.Scoring.getVerdictClass(result.verdict);
      var verdictHtml = '<span class="verdict-icon">' + GTO.Engine.Scoring.getVerdictIcon(result.verdict) + '</span> ' +
        'You chose <strong>' + (result.userAction || '?').toUpperCase() + '</strong> — ' + GTO.Engine.Scoring.getVerdictLabel(result.verdict);
      if (result.verdict !== 'optimal' && result.bestAction) {
        verdictHtml += '<div style="font-size:11px; font-weight:400; margin-top:4px; opacity:0.85;">GTO prefers <strong>' +
          result.bestAction.toUpperCase() + '</strong> (' + Math.round((result.bestFreq || 0) * 100) + '% frequency)</div>';
      }
      verdictEl.innerHTML = verdictHtml;
    }

    // EV stats
    GTO.UI.HUD.updateStat('ev-optimal', (result.bestAction || '?').toUpperCase() + ' (' + Math.round((result.bestFreq || 0) * 100) + '%)');
    GTO.UI.HUD.updateStat('ev-loss', GTO.Utils.formatEV(result.evLoss || 0));

    // Update hand matrix with full range
    var currentScenario = GTO.Engine.DrillEngine.getCurrentScenario();
    if (currentScenario) {
      GTO.UI.HandMatrix.showPreflopRange('hand-matrix-table', currentScenario);
    }

    // Update status bar + live progress
    GTO.UI.HUD.updateStatusBar(GTO.Engine.DrillEngine.getProgress());
    this._updateDrillProgress();

    // Show action buttons
    var explainBtnEl = document.getElementById('btn-explain-preflop');
    if (explainBtnEl) explainBtnEl.style.display = '';
    var viewRangeBtn = document.getElementById('btn-view-range-preflop');
    if (viewRangeBtn) viewRangeBtn.style.display = '';

    // Show next bar
    var nextBar = document.getElementById('drill-next-bar');
    if (nextBar) nextBar.classList.remove('hidden');

    // Store for AI + view range
    this._lastResult = result;
    this._lastScenario = currentScenario;
  },

  _renderFreqBar: function(id, value) {
    var fill = document.getElementById(id);
    if (!fill) return;
    fill.style.width = Math.round(value * 100) + '%';
    var valueEl = document.getElementById(id + '-val');
    if (valueEl) valueEl.textContent = Math.round(value * 100) + '%';
  },

  _nextDrill: function() {
    if (GTO.Keyboard.getContext() !== 'result') return;

    // Hide next bar
    var nextBar = document.getElementById('drill-next-bar');
    if (nextBar) nextBar.classList.add('hidden');

    // Hide view-range + explain buttons
    var viewRangeBtn = document.getElementById('btn-view-range-preflop');
    if (viewRangeBtn) viewRangeBtn.style.display = 'none';
    var explainBtn = document.getElementById('btn-explain-preflop');
    if (explainBtn) explainBtn.style.display = 'none';
    var aiInsight = document.getElementById('ai-insight-preflop');
    if (aiInsight) aiInsight.classList.add('hidden');

    // Determine the correct drill keyboard context
    var session = GTO.Engine.DrillEngine.getSession();
    if (session) {
      var ctx = 'drill-' + session.type;
      if (ctx === 'drill-tournament') ctx = 'drill-mtt';
      GTO.Keyboard.setContext(ctx);
    } else {
      GTO.Keyboard.setContext('navigation');
    }
    GTO.Engine.DrillEngine.nextDrill();
  },

  _showDrillProgress: function() {
    var bar = document.getElementById('drill-progress-bar');
    if (bar) bar.classList.remove('hidden');
    // Reset
    var fill = document.getElementById('drill-progress-fill');
    if (fill) fill.style.width = '0%';
    var text = document.getElementById('drill-progress-text');
    if (text) text.textContent = '0/' + (GTO.Engine.DrillEngine.getProgress().total || '--');
    var acc = document.getElementById('drill-accuracy-live');
    if (acc) acc.textContent = '0%';
    var ev = document.getElementById('drill-ev-loss-live');
    if (ev) ev.textContent = '0.00 bb';
  },

  _hideDrillProgress: function() {
    var bar = document.getElementById('drill-progress-bar');
    if (bar) bar.classList.add('hidden');
    var nextBar = document.getElementById('drill-next-bar');
    if (nextBar) nextBar.classList.add('hidden');
  },

  _updateDrillProgress: function() {
    var progress = GTO.Engine.DrillEngine.getProgress();
    var fill = document.getElementById('drill-progress-fill');
    var text = document.getElementById('drill-progress-text');
    var acc = document.getElementById('drill-accuracy-live');
    var ev = document.getElementById('drill-ev-loss-live');
    if (fill) fill.style.width = (progress.total > 0 ? (progress.current / progress.total * 100) : 0) + '%';
    if (text) text.textContent = progress.current + '/' + (progress.total || '--');
    if (acc) acc.textContent = Math.round(progress.accuracy * 100) + '%';
    if (ev) ev.textContent = GTO.Utils.formatEV(progress.evLoss || 0);
  },

  _navigateToExploreWithScenario: function() {
    var scenario = this._lastScenario;
    if (!scenario) return;

    // Pre-fill explore filters from the current scenario
    var setToggle = function(groupId, value) {
      var group = document.getElementById(groupId);
      if (!group) return;
      group.querySelectorAll('.toggle-option').forEach(function(o) { o.classList.remove('active'); });
      var match = group.querySelector('[data-value="' + value + '"]');
      if (match) match.classList.add('active');
    };

    setToggle('explore-mode', 'preflop');
    setToggle('explore-format', scenario.format || 'cash');
    setToggle('explore-stack', scenario.stackDepth || '100bb');
    setToggle('explore-position', scenario.position || 'UTG');
    setToggle('explore-action', scenario.actionContext || 'rfi');

    // Handle villain position for vs_raise/vs_3bet
    if (scenario.actionContext === 'vs_raise' || scenario.actionContext === 'vs_3bet') {
      var villainRow = document.getElementById('explore-villain-row');
      if (villainRow) villainRow.classList.remove('hidden');
      var posKey = scenario.positionKey || '';
      var parts = posKey.split('_');
      var villain = scenario.actionContext === 'vs_raise' ? parts[0] : parts[1];
      if (villain) setToggle('explore-villain', villain);
    }

    // Switch to explore view and highlight the hand on the matrix
    GTO.UI.Nav.switchView('explore');
    this._exploreActiveHand = scenario.hand || null;
    this._updateExploreMatrix();
  },

  _requestAIExplanation: function(containerId) {
    if (!this._lastScenario || !this._lastResult) return;
    GTO.AI.InsightPanel.requestExplanation(
      this._lastScenario,
      this._lastResult.userAction || 'unknown',
      this._lastResult,
      containerId || 'ai-insight-body'
    );
  },

  _renderSessionEnd: function(session) {
    this._showSessionSummary(session, 'preflop');
  },

  _setupPostflopDrill: function() {
    var self = this;

    // Config toggles
    document.querySelectorAll('#postflop-config .checkbox-chip').forEach(function(c) {
      c.addEventListener('click', function() { this.classList.toggle('checked'); });
    });
    document.querySelectorAll('#postflop-config .toggle-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        this.parentElement.querySelectorAll('.toggle-option').forEach(function(o) { o.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    var startBtn = document.getElementById('btn-start-postflop');
    if (startBtn) {
      startBtn.addEventListener('click', function() { self._startPostflopSession(); });
    }

    // Postflop action buttons (both groups)
    document.querySelectorAll('#postflop-betting-actions .action-btn, #postflop-facing-actions .action-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = this.getAttribute('data-action');
        if (action) self._submitPostflopAction(action);
      });
    });

    // Postflop AI explain button
    var postExplainBtn = document.getElementById('btn-explain-postflop');
    if (postExplainBtn) {
      postExplainBtn.addEventListener('click', function() { self._requestAIExplanation('ai-insight-postflop-body'); });
    }

    GTO.Keyboard.register('drill-postflop', 'x', function() { self._submitPostflopAction('check'); });
    GTO.Keyboard.register('drill-postflop', '1', function() { self._submitPostflopAction('bet_33'); });
    GTO.Keyboard.register('drill-postflop', '2', function() { self._submitPostflopAction('bet_67'); });
    GTO.Keyboard.register('drill-postflop', '3', function() { self._submitPostflopAction('bet_100'); });
    GTO.Keyboard.register('drill-postflop', 'f', function() { self._submitPostflopAction('fold'); });
    GTO.Keyboard.register('drill-postflop', 'c', function() { self._submitPostflopAction('call'); });
    GTO.Keyboard.register('drill-postflop', 'r', function() { self._submitPostflopAction('raise'); });
  },

  _startPostflopSession: function() {
    var spotTypes = [];
    document.querySelectorAll('#postflop-spot-chips .checkbox-chip.checked').forEach(function(c) {
      spotTypes.push(c.getAttribute('data-value'));
    });
    if (spotTypes.length === 0) spotTypes = ['IP_cbet_flop'];

    var countEl = document.querySelector('#postflop-drill-count .toggle-option.active');
    var count = countEl ? parseInt(countEl.getAttribute('data-value')) || 0 : 30;

    var formatEl = document.querySelector('#postflop-format-toggle .toggle-option.active');
    var format = formatEl ? formatEl.getAttribute('data-value') : (GTO.State.get('settings.format') || 'cash');

    var config = {
      drillType: 'postflop',
      format: format,
      spotTypes: spotTypes,
      count: count
    };

    var self = this;
    GTO.Engine.DrillEngine.startSession(config, {
      onScenario: function(scenario, index) { self._renderPostflopScenario(scenario, index); },
      onResult: function(result, scenario) { self._renderPostflopResult(result, scenario); },
      onSessionEnd: function(session) { self._renderPostflopSessionEnd(session); }
    });

    var configEl = document.getElementById('postflop-config');
    var activeEl = document.getElementById('postflop-active');
    if (configEl) configEl.classList.add('hidden');
    if (activeEl) activeEl.classList.remove('hidden');

    GTO.Keyboard.setContext('drill-postflop');
    this._showDrillProgress();
  },

  _renderPostflopScenario: function(scenario) {
    GTO.UI.BoardDisplay.renderHoleCards('postflop-hero-cards', scenario.cards);
    GTO.UI.BoardDisplay.renderBoard('postflop-board-cards', scenario.boardCards);

    GTO.UI.HUD.updateStat('postflop-position', scenario.position + (scenario.isIP ? ' (IP)' : ' (OOP)'));
    GTO.UI.HUD.updateStat('postflop-pot', scenario.potSize + 'bb');
    GTO.UI.HUD.updateStat('postflop-stack', scenario.effectiveStack + 'bb');
    GTO.UI.HUD.updateStat('postflop-street', GTO.Data.PostflopSpotLabels ? GTO.Data.PostflopSpotLabels[scenario.spotType] : scenario.spotType);

    // Populate middle column: board display + texture analysis
    GTO.UI.BoardDisplay.renderBoard('board-display-cards', scenario.boardCards);

    var tex = scenario.boardTexture;
    var texLabel = GTO.Data.BoardTextureLabels ? GTO.Data.BoardTextureLabels[tex] : tex;
    GTO.UI.HUD.updateStat('texture-type', texLabel);

    var isWet = tex.indexOf('wet') >= 0 || tex === 'highly_connected';
    var isMonotone = tex === 'monotone';
    var isTwotone = tex.indexOf('twotone') >= 0;

    GTO.UI.HUD.updateStat('texture-wetness', isWet ? 'Wet' : 'Dry');
    GTO.UI.HUD.updateStat('texture-connect', tex === 'highly_connected' ? 'High' : (isWet ? 'Medium' : 'Low'));
    GTO.UI.HUD.updateStat('texture-flush', isMonotone ? 'Complete' : (isTwotone ? 'Draw Possible' : 'None'));

    if (scenario.boardCards && scenario.boardCards.length > 0) {
      var boardRanks = scenario.boardCards.map(function(c) { return GTO.Data.RANK_VALUES[c.rank]; });
      var highRank = Math.max.apply(null, boardRanks);
      var rankNames = {14:'A',13:'K',12:'Q',11:'J',10:'T',9:'9',8:'8',7:'7',6:'6',5:'5',4:'4',3:'3',2:'2'};
      GTO.UI.HUD.updateStat('texture-high', rankNames[highRank] || '--');
    }

    // Hand strength label
    var hsLabel = GTO.Data.HandStrengthLabels ? GTO.Data.HandStrengthLabels[scenario.handStrength] : scenario.handStrength;
    GTO.UI.HUD.updateStat('postflop-hand-strength', hsLabel || scenario.handStrength);

    // Range advantage estimate based on position
    var ipAdv = scenario.isIP ? 55 : 45;
    var ipBar = document.getElementById('range-adv-ip');
    var oopBar = document.getElementById('range-adv-oop');
    var ipVal = document.getElementById('range-adv-ip-val');
    var oopVal = document.getElementById('range-adv-oop-val');
    if (ipBar) ipBar.style.width = ipAdv + '%';
    if (oopBar) oopBar.style.width = (100 - ipAdv) + '%';
    if (ipVal) ipVal.textContent = ipAdv + '%';
    if (oopVal) oopVal.textContent = (100 - ipAdv) + '%';

    // Show correct action buttons based on spot type
    var isFacing = scenario.spotType.indexOf('facing') >= 0;
    var bettingActions = document.getElementById('postflop-betting-actions');
    var facingActions = document.getElementById('postflop-facing-actions');
    if (bettingActions) bettingActions.style.display = isFacing ? 'none' : 'flex';
    if (facingActions) facingActions.style.display = isFacing ? 'flex' : 'none';

    document.querySelectorAll('#postflop-betting-actions .action-btn, #postflop-facing-actions .action-btn').forEach(function(b) { b.disabled = false; });

    var feedbackEl = document.getElementById('postflop-feedback-content');
    if (feedbackEl) feedbackEl.classList.add('hidden');
    var emptyEl = document.getElementById('postflop-feedback-empty');
    if (emptyEl) emptyEl.classList.remove('hidden');

    GTO.UI.HUD.updateStatusBar(GTO.Engine.DrillEngine.getProgress());
  },

  _submitPostflopAction: function(action) {
    if (!GTO.Engine.DrillEngine.isActive()) return;
    if (GTO.Keyboard.getContext() !== 'drill-postflop') return;

    GTO.Engine.DrillEngine.submitAnswer(action);
    document.querySelectorAll('#postflop-betting-actions .action-btn, #postflop-facing-actions .action-btn').forEach(function(b) { b.disabled = true; });
    GTO.Keyboard.setContext('result');
  },

  _renderPostflopResult: function(result, scenario) {
    var feedbackEl = document.getElementById('postflop-feedback-content');
    var emptyEl = document.getElementById('postflop-feedback-empty');
    if (feedbackEl) feedbackEl.classList.remove('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    // Render verdict
    var verdictEl = document.getElementById('postflop-verdict');
    if (verdictEl) {
      verdictEl.className = 'verdict ' + GTO.Engine.Scoring.getVerdictClass(result.verdict);
      var verdictHtml = '<span class="verdict-icon">' + GTO.Engine.Scoring.getVerdictIcon(result.verdict) + '</span> ' +
        result.userAction.toUpperCase() + ' — ' + GTO.Engine.Scoring.getVerdictLabel(result.verdict);
      if (result.verdict !== 'optimal' && result.bestAction) {
        var betLabel = result.bestAction.replace('bet_33', 'Bet 1/3').replace('bet_67', 'Bet 2/3').replace('bet_100', 'Bet Pot').replace('check', 'Check').replace('fold', 'Fold').replace('call', 'Call').replace('raise', 'Raise');
        verdictHtml += '<div style="font-size:11px; font-weight:400; margin-top:4px; opacity:0.85;">GTO prefers <strong>' +
          betLabel + '</strong> (' + Math.round((result.bestFreq || 0) * 100) + '% frequency)</div>';
      }
      verdictEl.innerHTML = verdictHtml;
    }

    // Render frequency bars for postflop
    var freqs = result.gtoFreqs || {};
    var barsContainer = document.getElementById('postflop-freq-bars');
    if (barsContainer) {
      var html = '';
      Object.keys(freqs).forEach(function(action) {
        var pct = Math.round(freqs[action] * 100);
        var label = action.replace('bet_', 'B').replace('check', 'Chk').replace('fold', 'Fold').replace('call', 'Call').replace('raise', 'Raise');
        html += '<div class="freq-bar-item">' +
          '<span class="freq-bar-label">' + label + '</span>' +
          '<div class="freq-bar-track"><div class="freq-bar-fill fill-bet" style="width:' + pct + '%"></div></div>' +
          '<span class="freq-bar-value">' + pct + '%</span>' +
        '</div>';
      });
      barsContainer.innerHTML = html;
    }

    GTO.UI.HUD.updateStatusBar(GTO.Engine.DrillEngine.getProgress());
    this._updateDrillProgress();

    // Show next bar
    var nextBar = document.getElementById('drill-next-bar');
    if (nextBar) nextBar.classList.remove('hidden');

    this._lastResult = result;
    this._lastScenario = scenario;
  },

  _renderPostflopSessionEnd: function(session) {
    this._showSessionSummary(session, 'postflop');
  },

  _setupTournamentDrill: function() {
    var self = this;

    document.querySelectorAll('#mtt-config .checkbox-chip').forEach(function(c) {
      c.addEventListener('click', function() { this.classList.toggle('checked'); });
    });
    document.querySelectorAll('#mtt-config .toggle-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        this.parentElement.querySelectorAll('.toggle-option').forEach(function(o) { o.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    var startBtn = document.getElementById('btn-start-mtt');
    if (startBtn) {
      startBtn.addEventListener('click', function() { self._startTournamentSession(); });
    }

    document.querySelectorAll('#mtt-actions-pushfold .action-btn, #mtt-actions-deep .action-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = this.getAttribute('data-action');
        if (action) self._submitMTTAction(action);
      });
    });

    // MTT AI explain button
    var mttExplainBtn = document.getElementById('btn-explain-mtt');
    if (mttExplainBtn) {
      mttExplainBtn.addEventListener('click', function() { self._requestAIExplanation('ai-insight-mtt-body'); });
    }

    GTO.Keyboard.register('drill-mtt', 'p', function() { self._submitMTTAction('push'); });
    GTO.Keyboard.register('drill-mtt', 'f', function() { self._submitMTTAction('fold'); });
  },

  _startTournamentSession: function() {
    var config = {
      drillType: 'tournament',
      format: 'mtt',
      stackMin: 5,
      stackMax: 20,
      positions: GTO.Data.POSITIONS.slice(),
      stage: 'normal',
      count: 30
    };

    var self = this;
    GTO.Engine.DrillEngine.startSession(config, {
      onScenario: function(scenario, index) { self._renderMTTScenario(scenario, index); },
      onResult: function(result, scenario) { self._renderMTTResult(result, scenario); },
      onSessionEnd: function(session) {
        self._showSessionSummary(session, 'pushfold');
      }
    });

    var configEl = document.getElementById('mtt-config');
    var activeEl = document.getElementById('mtt-active');
    if (configEl) configEl.classList.add('hidden');
    if (activeEl) activeEl.classList.remove('hidden');

    GTO.Keyboard.setContext('drill-mtt');
    this._showDrillProgress();
  },

  _renderMTTScenario: function(scenario) {
    GTO.UI.BoardDisplay.renderHoleCards('mtt-hero-cards', scenario.cards);
    GTO.UI.HUD.updateStat('mtt-position', scenario.position);
    GTO.UI.HUD.updateStat('mtt-stack', scenario.stackBB + 'bb');
    GTO.UI.HUD.updateStat('mtt-players', (scenario.playersLeft || '--') + ' left');

    document.querySelectorAll('#mtt-actions-pushfold .action-btn, #mtt-actions-deep .action-btn').forEach(function(b) { b.disabled = false; });
    var mttFeedback = document.getElementById('mtt-feedback-content');
    if (mttFeedback) mttFeedback.classList.add('hidden');

    GTO.UI.HUD.updateStatusBar(GTO.Engine.DrillEngine.getProgress());
  },

  _submitMTTAction: function(action) {
    if (!GTO.Engine.DrillEngine.isActive()) return;
    if (GTO.Keyboard.getContext() !== 'drill-mtt') return;
    GTO.Engine.DrillEngine.submitAnswer(action);
    document.querySelectorAll('#mtt-actions-pushfold .action-btn, #mtt-actions-deep .action-btn').forEach(function(b) { b.disabled = true; });
    GTO.Keyboard.setContext('result');
  },

  _renderMTTResult: function(result, scenario) {
    var mttEmpty = document.getElementById('mtt-feedback-empty');
    var mttFeedback = document.getElementById('mtt-feedback-content');
    if (mttEmpty) mttEmpty.classList.add('hidden');
    if (mttFeedback) mttFeedback.classList.remove('hidden');

    var verdictEl = document.getElementById('mtt-verdict');
    if (verdictEl) {
      verdictEl.className = 'verdict ' + GTO.Engine.Scoring.getVerdictClass(result.verdict);
      verdictEl.innerHTML = '<span class="verdict-icon">' + GTO.Engine.Scoring.getVerdictIcon(result.verdict) + '</span> ' +
        'You chose ' + (result.userAction || '?').toUpperCase() + ' — Nash says ' + (result.correctAction || '?').toUpperCase();
    }

    GTO.UI.HUD.updateStatusBar(GTO.Engine.DrillEngine.getProgress());
    this._updateDrillProgress();

    // Show next bar
    var nextBar = document.getElementById('drill-next-bar');
    if (nextBar) nextBar.classList.remove('hidden');

    this._lastResult = result;
    this._lastScenario = scenario;
  },

  _setupPlaythrough: function() {
    var self = this;

    // Config toggles
    document.querySelectorAll('#play-config .toggle-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        this.parentElement.querySelectorAll('.toggle-option').forEach(function(o) { o.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    // Start button
    var startBtn = document.getElementById('btn-start-play');
    if (startBtn) {
      startBtn.addEventListener('click', function() { self._startPlaythrough(); });
    }

    // Event delegation for dynamic action buttons
    var actionsContainer = document.getElementById('play-current-actions');
    if (actionsContainer) {
      actionsContainer.addEventListener('click', function(e) {
        var btn = e.target.closest('.action-btn');
        if (!btn || btn.disabled) return;
        var action = btn.getAttribute('data-action');
        if (action) self._submitPlayAction(action);
      });
    }

    // Wire persistent end-of-hand buttons (once, not per hand)
    var nextBtn = document.getElementById('btn-next-hand');
    var backBtn = document.getElementById('btn-back-play-config');
    if (nextBtn) {
      nextBtn.addEventListener('click', function() { self._startPlaythrough(); });
    }
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        var config = document.getElementById('play-config');
        var active = document.getElementById('play-active');
        if (config) config.classList.remove('hidden');
        if (active) active.classList.add('hidden');
        var histEmpty = document.getElementById('play-history-empty');
        var histContent = document.getElementById('play-history-content');
        if (histEmpty) histEmpty.classList.remove('hidden');
        if (histContent) histContent.classList.add('hidden');
      });
    }

    // Event delegation for "View Range" links in street results
    var streetResults = document.getElementById('play-street-results');
    if (streetResults) {
      streetResults.addEventListener('click', function(e) {
        var link = e.target.closest('.play-view-range-link');
        if (!link) return;
        e.preventDefault();
        var idx = parseInt(link.getAttribute('data-street-index'), 10);
        self._viewPlayRange(idx);
      });
    }

    // Play-specific keyboard shortcuts
    GTO.Keyboard.register('play-preflop', 'f', function() { self._submitPlayAction('fold'); });
    GTO.Keyboard.register('play-preflop', 'c', function() { self._submitPlayAction('call'); });
    GTO.Keyboard.register('play-preflop', 'r', function() { self._submitPlayAction('raise'); });

    GTO.Keyboard.register('play-postflop', 'x', function() { self._submitPlayAction('check'); });
    GTO.Keyboard.register('play-postflop', '1', function() { self._submitPlayAction('bet_33'); });
    GTO.Keyboard.register('play-postflop', '2', function() { self._submitPlayAction('bet_67'); });
    GTO.Keyboard.register('play-postflop', '3', function() { self._submitPlayAction('bet_100'); });
    GTO.Keyboard.register('play-postflop', 'f', function() { self._submitPlayAction('fold'); });
    GTO.Keyboard.register('play-postflop', 'c', function() { self._submitPlayAction('call'); });
    GTO.Keyboard.register('play-postflop', 'r', function() { self._submitPlayAction('raise'); });

    GTO.Keyboard.register('play-end', 'n', function() { self._startPlaythrough(); });
    GTO.Keyboard.register('play-end', ' ', function() { self._startPlaythrough(); });
  },

  _startPlaythrough: function() {
    var formatEl = document.querySelector('#play-format-toggle .toggle-option.active');
    var stackEl = document.querySelector('#play-stack-toggle .toggle-option.active');
    var format = formatEl ? formatEl.getAttribute('data-value') : 'cash';
    var stack = stackEl ? stackEl.getAttribute('data-value') + 'bb' : '100bb';

    var hand = GTO.Engine.HandPlaythrough.startHand({
      format: format,
      stackDepth: stack,
      position: GTO.Utils.randPick(GTO.Data.POSITIONS.slice(0, 5)) // exclude BB for opening
    });

    // Show active, hide config
    var config = document.getElementById('play-config');
    var active = document.getElementById('play-active');
    if (config) config.classList.add('hidden');
    if (active) active.classList.remove('hidden');

    // Hide end actions, show street area
    var endActions = document.getElementById('play-end-actions');
    if (endActions) endActions.classList.add('hidden');

    // Show history panel
    var histEmpty = document.getElementById('play-history-empty');
    var histContent = document.getElementById('play-history-content');
    if (histEmpty) histEmpty.classList.add('hidden');
    if (histContent) histContent.classList.remove('hidden');

    // Render hero cards
    GTO.UI.BoardDisplay.renderHoleCards('play-hero-cards', hand.cards);

    // Reset all 5 board card slots to facedown/unrevealed
    for (var i = 0; i < 5; i++) {
      var slot = document.getElementById('play-board-' + i);
      if (slot) {
        slot.className = 'playing-card card-facedown card-unrevealed' + (i >= 3 ? ' play-board-gap' : '');
        slot.innerHTML = '';
      }
    }

    // Update position and action info
    var posEl = document.getElementById('play-position');
    if (posEl) posEl.textContent = hand.heroPosition + ' (' + (GTO.Data.POSITION_NAMES[hand.heroPosition] || '') + ')';
    var actionEl = document.getElementById('play-preflop-action');
    if (actionEl) actionEl.textContent = 'Folds to you. ' + hand.stackDepth + ' effective.';

    // Highlight hero position on table display
    GTO.UI.HUD.updateTable('play-table-display', hand.heroPosition);

    // Update pot
    var potEl = document.getElementById('play-pot');
    if (potEl) potEl.textContent = hand.pot.toFixed(1) + 'bb';

    // Set street label
    var streetLabel = document.getElementById('play-street-label');
    if (streetLabel) streetLabel.textContent = 'PREFLOP';

    // Render preflop action buttons
    this._renderPlayButtons('preflop');

    // Clear street results timeline + stored contexts
    var results = document.getElementById('play-street-results');
    if (results) results.innerHTML = '';
    this._playStreetResults = [];

    // Reset scores
    ['preflop','flop','turn','river','total'].forEach(function(s) {
      var el = document.getElementById('play-score-' + s);
      if (el) { el.textContent = '--'; el.className = 'stat-value'; }
    });

    // Clear action log
    var log = document.getElementById('play-action-log');
    if (log) log.innerHTML = '';

    var handNum = document.getElementById('play-hand-num');
    if (handNum) handNum.textContent = 'Hand #' + hand.id.slice(0, 6);

    GTO.Keyboard.setContext('play-preflop');
  },

  _renderPlayButtons: function(street) {
    var container = document.getElementById('play-current-actions');
    if (!container) return;

    var html = '';
    if (street === 'preflop') {
      html =
        '<button class="action-btn btn-fold" data-action="fold"><span class="key-hint">F</span> <span class="action-label">Fold</span></button>' +
        '<button class="action-btn btn-call" data-action="call"><span class="key-hint">C</span> <span class="action-label">Call</span></button>' +
        '<button class="action-btn btn-raise" data-action="raise"><span class="key-hint">R</span> <span class="action-label">Raise</span></button>';
    } else {
      // Postflop streets: check/bet sizing
      html =
        '<button class="action-btn btn-check" data-action="check"><span class="key-hint">X</span> Check</button>' +
        '<button class="action-btn btn-raise" data-action="bet_33"><span class="key-hint">1</span> 1/3</button>' +
        '<button class="action-btn btn-raise" data-action="bet_67"><span class="key-hint">2</span> 2/3</button>' +
        '<button class="action-btn btn-raise" data-action="bet_100"><span class="key-hint">3</span> Pot</button>';
    }

    container.innerHTML = html;
  },

  _submitPlayAction: function(rawAction) {
    var hand = GTO.Engine.HandPlaythrough.getHand();
    if (!hand || hand.isComplete) return;

    var street = hand.currentStreet;
    var action = rawAction;

    var result = GTO.Engine.HandPlaythrough.submitStreetAction(action);
    if (!result) return;

    // Disable current buttons
    document.querySelectorAll('#play-current-actions .action-btn').forEach(function(b) { b.disabled = true; });

    // Update score for this street
    var scoreEl = document.getElementById('play-score-' + street);
    if (scoreEl) {
      var verdictClass = result.verdict === 'optimal' ? 'positive' : (result.verdict === 'acceptable' ? 'text-orange' : 'negative');
      scoreEl.className = 'stat-value ' + verdictClass;
      scoreEl.textContent = GTO.Engine.Scoring.getVerdictLabel(result.verdict) + ' (' + GTO.Utils.formatEV(result.evLoss) + ')';
    }

    // Add structured street result row with View Range link
    var resultsEl = document.getElementById('play-street-results');
    if (resultsEl) {
      var verdictColor = result.verdict === 'optimal' ? 'var(--green)' : (result.verdict === 'acceptable' ? 'var(--orange)' : 'var(--red)');
      var verdictBg = result.verdict === 'optimal' ? 'rgba(74,246,195,0.08)' : (result.verdict === 'acceptable' ? 'rgba(255,215,0,0.08)' : 'rgba(255,67,61,0.08)');
      var icon = result.verdict === 'optimal' ? '&#10003;' : (result.verdict === 'acceptable' ? '~' : '&#10007;');

      // Build mini board cards for this street
      var boardHtml = '';
      if (street !== 'preflop' && hand.board && hand.board.length > 0) {
        boardHtml = '<div style="display:flex; gap:2px; margin-top:4px;">';
        hand.board.forEach(function(c) {
          var sym = GTO.Data.SUIT_SYMBOLS[c.suit] || '';
          var suitCls = c.suit === 'h' || c.suit === 'd' ? 'color:var(--red)' : 'color:var(--text-primary)';
          boardHtml += '<span style="font-size:10px; ' + suitCls + ';">' + c.rank + sym + '</span>';
        });
        boardHtml += '</div>';
      }

      // Store street context for view range lookup
      var streetIndex = this._playStreetResults ? this._playStreetResults.length : 0;
      if (!this._playStreetResults) this._playStreetResults = [];
      this._playStreetResults.push({
        street: street,
        format: hand.format,
        stackDepth: hand.stackDepth,
        position: hand.heroPosition,
        hand: hand.hand
      });

      // Build suggestion line for suboptimal plays
      var suggestionHtml = '';
      if (result.verdict !== 'optimal' && result.bestAction) {
        var bestLabel = result.bestAction.replace('bet_33', 'Bet 1/3').replace('bet_67', 'Bet 2/3').replace('bet_100', 'Bet Pot').toUpperCase();
        suggestionHtml = '<div style="margin-top:4px; padding:4px 8px; background:rgba(255,140,0,0.1); border-left:2px solid var(--orange); font-size:10px; color:var(--orange);">' +
          'GTO prefers <strong>' + bestLabel + '</strong> (' + Math.round((result.bestFreq || 0) * 100) + '% frequency)' +
        '</div>';
      }

      var line = '<div style="padding:8px 10px; margin-bottom:4px; border:1px solid var(--border-dim); border-radius:var(--radius-sm); background:' + verdictBg + ';">' +
        '<div style="display:flex; align-items:center; gap:8px; font-size:11px;">' +
          '<span style="color:var(--orange); font-weight:700; font-size:10px; min-width:56px; text-transform:uppercase; letter-spacing:0.08em;">' + street + '</span>' +
          '<span style="color:var(--text-dim); font-size:10px;">Pot ' + hand.pot.toFixed(1) + 'bb</span>' +
          '<span style="margin-left:auto; color:' + verdictColor + '; font-weight:700;">' + icon + ' ' + GTO.Engine.Scoring.getVerdictLabel(result.verdict) + '</span>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:8px; margin-top:4px; font-size:11px;">' +
          '<span style="color:var(--text-secondary);">You: <strong style="color:var(--text-primary);">' + (result.userAction || action).toUpperCase() + '</strong></span>' +
          '<span style="color:var(--text-dim); font-size:10px; margin-left:auto;">' + GTO.Utils.formatEV(result.evLoss) + '</span>' +
        '</div>' +
        suggestionHtml +
        boardHtml +
        '<div style="margin-top:6px;">' +
          '<a href="#" class="play-view-range-link" data-street-index="' + streetIndex + '" style="font-size:10px; color:var(--blue); text-decoration:none; font-weight:600; letter-spacing:0.04em;">VIEW RANGE FOR THIS SPOT &rarr;</a>' +
        '</div>' +
      '</div>';
      resultsEl.innerHTML += line;
    }

    // Add to action log (right panel)
    var log = document.getElementById('play-action-log');
    if (log) {
      var logLine = '<div><span class="text-orange">' + street.toUpperCase() + ':</span> You chose <strong>' +
        (result.userAction || action).toUpperCase() + '</strong> — ' +
        '<span class="' + (result.verdict === 'optimal' ? 'positive' : 'negative') + '">' +
        GTO.Engine.Scoring.getVerdictLabel(result.verdict) + '</span></div>';
      log.innerHTML += logLine;
    }

    // Update total score
    var totalEl = document.getElementById('play-score-total');
    if (totalEl) totalEl.textContent = GTO.Utils.formatEV(hand.totalEvLoss);

    // If folded or hand complete, show summary
    if (hand.isComplete) {
      this._endPlaythrough(hand);
      return;
    }

    // Deal next street
    var dealResult = GTO.Engine.HandPlaythrough.dealStreet();
    if (dealResult) {
      this._renderPlayStreet(hand, dealResult);
    }
  },

  _renderPlayStreet: function(hand, dealResult) {
    var street = dealResult.street;
    var newCards = dealResult.newCards || [];

    // Reveal board cards in-place by replacing individual card slots
    if (street === 'flop' && newCards.length === 3) {
      for (var i = 0; i < 3; i++) {
        this._revealBoardCard(i, newCards[i]);
      }
    } else if (street === 'turn' && newCards.length === 1) {
      this._revealBoardCard(3, newCards[0]);
    } else if (street === 'river' && newCards.length === 1) {
      this._revealBoardCard(4, newCards[0]);
    }

    // Update pot
    var potEl = document.getElementById('play-pot');
    if (potEl) potEl.textContent = hand.pot.toFixed(1) + 'bb';

    // Update street label
    var streetLabel = document.getElementById('play-street-label');
    if (streetLabel) streetLabel.textContent = street.toUpperCase();

    // Render new action buttons for this street
    this._renderPlayButtons(street);

    // Set appropriate keyboard context
    GTO.Keyboard.setContext('play-postflop');
  },

  _revealBoardCard: function(slotIndex, card) {
    var slot = document.getElementById('play-board-' + slotIndex);
    if (!slot || !card) return;

    var suitClass = 'suit-' + card.suit;
    var symbol = GTO.Data.SUIT_SYMBOLS[card.suit];

    // Replace facedown with rendered card
    slot.className = 'playing-card ' + suitClass + (slotIndex >= 3 ? ' play-board-gap' : '');
    slot.innerHTML = '<span class="card-rank">' + card.rank + '</span><span class="card-suit">' + symbol + '</span>';
  },

  _endPlaythrough: function(hand) {
    GTO.Keyboard.setContext('play-end');

    // Clear action buttons
    var actionsContainer = document.getElementById('play-current-actions');
    if (actionsContainer) actionsContainer.innerHTML = '';

    // Update street label to show completion
    var streetLabel = document.getElementById('play-street-label');
    if (streetLabel) streetLabel.textContent = 'COMPLETE';

    // Show end-of-hand buttons
    var endActions = document.getElementById('play-end-actions');
    if (endActions) endActions.classList.remove('hidden');

    // Add total EV summary row to street results
    var resultsEl = document.getElementById('play-street-results');
    if (resultsEl) {
      var totalClass = hand.totalEvLoss < 0.5 ? 'var(--green)' : 'var(--red)';
      resultsEl.innerHTML += '<div style="padding:8px 10px; margin-top:4px; border:1px solid var(--border-dim); border-radius:var(--radius-sm); background:var(--bg-secondary); display:flex; justify-content:space-between; align-items:center;">' +
        '<span style="font-size:11px; font-weight:700; color:var(--text-primary); letter-spacing:0.05em;">TOTAL</span>' +
        '<span style="font-size:13px; font-weight:700; color:' + totalClass + ';">' + GTO.Utils.formatEV(hand.totalEvLoss) + ' EV</span>' +
        '</div>';
    }

    // Add summary line to action log
    var log = document.getElementById('play-action-log');
    if (log) {
      var logTotalClass = hand.totalEvLoss < 0.5 ? 'positive' : 'negative';
      log.innerHTML += '<div style="margin-top:6px; padding-top:6px; border-top:1px solid var(--border-dim);">' +
        '<span class="text-dim">Total EV Loss:</span> <strong class="' + logTotalClass + '">' +
        GTO.Utils.formatEV(hand.totalEvLoss) + '</strong></div>';
    }
  },

  _viewPlayRange: function(streetIndex) {
    var ctx = null;
    if (typeof streetIndex === 'number' && this._playStreetResults && this._playStreetResults[streetIndex]) {
      ctx = this._playStreetResults[streetIndex];
    } else {
      // Fallback to current hand
      var hand = GTO.Engine.HandPlaythrough.getHand();
      if (!hand) return;
      ctx = { format: hand.format, stackDepth: hand.stackDepth, position: hand.heroPosition, hand: hand.hand, street: 'preflop' };
    }

    // Build a pseudo-scenario for the explore view
    this._lastScenario = {
      format: ctx.format,
      stackDepth: ctx.stackDepth,
      position: ctx.position,
      actionContext: 'rfi',
      hand: ctx.hand
    };

    // Navigate to explore with filters pre-filled
    this._navigateToExploreWithScenario();
  },

  _setupPlans: function() {
    var self = this;
    // Plan template buttons - each "Select" button in the template list
    document.querySelectorAll('#plan-templates-list .drill-item .btn-primary').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = this.closest('.drill-item');
        var titleEl = item ? item.querySelector('.drill-item-title') : null;
        var name = titleEl ? titleEl.textContent : 'Custom Plan';
        var idx = Array.from(document.querySelectorAll('#plan-templates-list .drill-item')).indexOf(item);
        var templateIds = ['mtt_fundamentals', 'cash_grinder', 'tournament_prep', 'leak_plugger'];
        var templateId = templateIds[idx] || 'preflop_fundamentals';
        var plan = GTO.Training.PlanEngine.createPlan(templateId, {
          name: name,
          format: GTO.State.get('settings.format')
        });
        if (plan) {
          GTO.UI.Toast.success('Training plan created: ' + plan.name);
          self._renderActivePlan();
        }
      });
    });

    this._renderActivePlan();
  },

  _setupLearn: function() {
    if (GTO.Content && GTO.Content.LearnView) {
      GTO.Content.LearnView.init();
    }
  },

  _renderActivePlan: function() {
    var plan = GTO.Training.PlanEngine.getActivePlan();
    var nameEl = document.getElementById('active-plan-name');
    var progressEl = document.getElementById('active-plan-bar');
    var progressText = document.getElementById('active-plan-pct');
    var upcomingEl = document.getElementById('plan-upcoming-sessions');
    var deleteBtn = document.getElementById('btn-delete-plan');

    if (!plan) {
      if (nameEl) nameEl.textContent = 'No active plan';
      if (progressEl) progressEl.style.width = '0%';
      if (progressText) progressText.textContent = '0/0 sessions';
      if (upcomingEl) upcomingEl.innerHTML = '<div style="padding:16px 0; text-align:center;"><div style="font-size:20px; color:var(--text-dim); margin-bottom:8px;">&#9776;</div><div style="color:var(--text-secondary); font-size:11px; line-height:1.6;">No active plan.<br>Select a template to get started.</div></div>';
      if (deleteBtn) deleteBtn.style.display = 'none';
      return;
    }

    if (nameEl) nameEl.textContent = plan.name;
    var progress = GTO.Training.PlanEngine.getProgress();
    if (progressEl) progressEl.style.width = Math.round(progress.percent * 100) + '%';
    if (progressText) progressText.textContent = progress.completed + '/' + progress.total + ' sessions';
    if (deleteBtn) deleteBtn.style.display = '';

    // Render upcoming sessions
    if (upcomingEl && plan.sessions) {
      var upcoming = plan.sessions.filter(function(s) { return s.status === 'pending'; }).slice(0, 5);
      if (upcoming.length === 0) {
        upcomingEl.innerHTML = '<div class="text-green" style="padding:8px 0; font-size:11px;">All sessions complete! Plan finished.</div>';
      } else {
        var html = '';
        upcoming.forEach(function(sess, idx) {
          var drillNames = (sess.drills || []).map(function(d) {
            return (d.type || '?').toUpperCase() + (d.subtype ? ' ' + d.subtype.replace(/_/g, ' ') : '');
          }).join(', ');
          var dayLabel = 'Day ' + (sess.day || (idx + 1));
          html += '<div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--border-dim); font-size:11px;">' +
            '<span style="color:var(--orange); font-weight:600; width:48px; flex-shrink:0;">' + dayLabel + '</span>' +
            '<span style="color:var(--text-primary); flex:1;">' + drillNames + '</span>' +
            '<span style="color:var(--text-dim);">' + (sess.drills || []).reduce(function(sum, d) { return sum + (d.count || 0); }, 0) + ' hands</span>' +
          '</div>';
        });
        upcomingEl.innerHTML = html;
      }
    }

    // Wire delete button
    if (deleteBtn && !deleteBtn._wired) {
      deleteBtn._wired = true;
      var self = this;
      deleteBtn.addEventListener('click', function() {
        var activePlan = GTO.Training.PlanEngine.getActivePlan();
        if (activePlan) {
          GTO.Training.PlanEngine.deletePlan(activePlan.id);
          GTO.UI.Toast.success('Plan deleted');
          self._renderActivePlan();
        }
      });
    }
  },

  // ═══════════════════ EXPLORE VIEW ═══════════════════
  _setupExplore: function() {
    var self = this;

    // Wire up all toggle groups in explore view
    document.querySelectorAll('#view-explore .toggle-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        var group = this.parentElement;
        group.querySelectorAll('.toggle-option').forEach(function(o) { o.classList.remove('active'); });
        this.classList.add('active');

        // Handle mode switch
        if (group.id === 'explore-mode') {
          var mode = this.getAttribute('data-value');
          var preflopFilters = document.getElementById('explore-preflop-filters');
          var pfFilters = document.getElementById('explore-pushfold-filters');
          if (preflopFilters) preflopFilters.classList.toggle('hidden', mode !== 'preflop');
          if (pfFilters) pfFilters.classList.toggle('hidden', mode !== 'pushfold');
        }

        // Show/hide villain row for vs_raise/vs_3bet
        if (group.id === 'explore-action') {
          var action = this.getAttribute('data-value');
          var villainRow = document.getElementById('explore-villain-row');
          if (villainRow) villainRow.classList.toggle('hidden', action === 'rfi');
        }

        self._exploreActiveHand = null; // clear active hand on manual filter change
        self._updateExploreMatrix();
      });
    });

    // Wire up matrix cell clicks for hand details
    var exploreTable = document.getElementById('explore-matrix-table');
    if (exploreTable) {
      exploreTable.addEventListener('click', function(e) {
        var cell = e.target.closest('td[data-hand]');
        if (cell) self._showExploreHandDetail(cell.getAttribute('data-hand'));
      });
    }

    // Initial render
    this._updateExploreMatrix();
  },

  _updateExploreMatrix: function() {
    // Reset hand details to empty state
    var emptyEl = document.getElementById('explore-hand-empty');
    var infoEl = document.getElementById('explore-hand-info');
    if (emptyEl) emptyEl.style.display = '';
    if (infoEl) infoEl.classList.add('hidden');

    var modeEl = document.querySelector('#explore-mode .toggle-option.active');
    var mode = modeEl ? modeEl.getAttribute('data-value') : 'preflop';

    if (mode === 'preflop') {
      var formatEl = document.querySelector('#explore-format .toggle-option.active');
      var stackEl = document.querySelector('#explore-stack .toggle-option.active');
      var posEl = document.querySelector('#explore-position .toggle-option.active');
      var actionEl = document.querySelector('#explore-action .toggle-option.active');

      var format = formatEl ? formatEl.getAttribute('data-value') : 'cash';
      var stack = stackEl ? stackEl.getAttribute('data-value') : '100bb';
      var position = posEl ? posEl.getAttribute('data-value') : 'UTG';
      var actionCtx = actionEl ? actionEl.getAttribute('data-value') : 'rfi';

      var positionKey = position;
      if (actionCtx === 'vs_raise' || actionCtx === 'vs_3bet') {
        var villainEl = document.querySelector('#explore-villain .toggle-option.active');
        var villain = villainEl ? villainEl.getAttribute('data-value') : 'UTG';
        positionKey = actionCtx === 'vs_raise' ? villain + '_' + position : position + '_' + villain;
      }

      // Build range data for the scenario
      var scenario = { format: format, stackDepth: stack, actionContext: actionCtx, position: position, positionKey: positionKey };
      var rangeData = GTO.Engine.PreflopDrill.getRangeForScenario(scenario);
      var activeHand = this._exploreActiveHand || null;
      GTO.UI.HandMatrix.updateMatrix('explore-matrix-table', rangeData, null, activeHand);

      // Update label
      var label = document.getElementById('explore-matrix-label');
      if (label) label.textContent = actionCtx.toUpperCase().replace('_', ' ') + ' — ' + position + ' — ' + stack;

      // Update combo count — count all non-fold combos (raise + call)
      this._exploreRangeData = rangeData;
      var combos = 0;
      var totalCombos = 0;
      GTO.Data.ALL_HANDS.forEach(function(h) {
        var c = GTO.Data.COMBOS[h] || 0;
        totalCombos += c;
        if (rangeData[h]) {
          var actionFreq = (rangeData[h].raise || 0) + (rangeData[h].call || 0);
          combos += c * actionFreq;
        }
      });
      var comboEl = document.getElementById('explore-combo-count');
      var pctEl = document.getElementById('explore-hand-pct');
      if (comboEl) comboEl.textContent = Math.round(combos);
      if (pctEl) pctEl.textContent = (totalCombos > 0 ? (combos / totalCombos * 100).toFixed(1) : '0') + '%';

    } else {
      // Push/fold mode
      var pfStackEl = document.querySelector('#explore-pf-stack .toggle-option.active');
      var pfPosEl = document.querySelector('#explore-pf-position .toggle-option.active');
      var stackBB = pfStackEl ? parseInt(pfStackEl.getAttribute('data-value')) : 10;
      var pfPos = pfPosEl ? pfPosEl.getAttribute('data-value') : 'UTG';

      var rangeData = {};
      GTO.Data.ALL_HANDS.forEach(function(h) {
        var lookup = GTO.Data.lookupPushFold(6, pfPos, stackBB, h);
        var inRange = lookup ? lookup.inRange : false;
        rangeData[h] = { fold: inRange ? 0 : 1, call: 0, raise: inRange ? 1 : 0 };
      });
      var activeHand = this._exploreActiveHand || null;
      GTO.UI.HandMatrix.updateMatrix('explore-matrix-table', rangeData, 'raise', activeHand);

      var label = document.getElementById('explore-matrix-label');
      if (label) label.textContent = 'PUSH/FOLD — ' + pfPos + ' — ' + stackBB + 'BB';

      this._exploreRangeData = rangeData;
      var combos = 0;
      GTO.Data.ALL_HANDS.forEach(function(h) {
        if (rangeData[h] && rangeData[h].raise > 0) combos += (GTO.Data.COMBOS[h] || 0);
      });
      var comboEl = document.getElementById('explore-combo-count');
      var pctEl = document.getElementById('explore-hand-pct');
      if (comboEl) comboEl.textContent = Math.round(combos);
      if (pctEl) pctEl.textContent = (combos / 1326 * 100).toFixed(1) + '%';
    }

    // If an active hand was set (from drill/play "View Range"), auto-show its detail
    if (this._exploreActiveHand) {
      this._showExploreHandDetail(this._exploreActiveHand);
      this._exploreActiveHand = null; // clear so manual filter changes don't re-trigger
    }
  },

  _showExploreHandDetail: function(hand) {
    if (!hand) return;

    // Hide empty state, show hand info
    var emptyEl = document.getElementById('explore-hand-empty');
    var infoEl = document.getElementById('explore-hand-info');
    if (emptyEl) emptyEl.style.display = 'none';
    if (infoEl) infoEl.classList.remove('hidden');

    var selectedEl = document.getElementById('explore-selected-hand');
    if (selectedEl) selectedEl.textContent = hand;

    var rangeData = this._exploreRangeData || {};
    var freqs = rangeData[hand] || { fold: 1, call: 0, raise: 0 };

    // Update freq bars
    var foldFill = document.getElementById('explore-freq-fold');
    var callFill = document.getElementById('explore-freq-call');
    var raiseFill = document.getElementById('explore-freq-raise');
    if (foldFill) foldFill.style.width = Math.round(freqs.fold * 100) + '%';
    if (callFill) callFill.style.width = Math.round(freqs.call * 100) + '%';
    if (raiseFill) raiseFill.style.width = Math.round(freqs.raise * 100) + '%';

    var foldVal = document.getElementById('explore-freq-fold-val');
    var callVal = document.getElementById('explore-freq-call-val');
    var raiseVal = document.getElementById('explore-freq-raise-val');
    if (foldVal) foldVal.textContent = Math.round(freqs.fold * 100) + '%';
    if (callVal) callVal.textContent = Math.round(freqs.call * 100) + '%';
    if (raiseVal) raiseVal.textContent = Math.round(freqs.raise * 100) + '%';

    var combosEl = document.getElementById('explore-hand-combos');
    var typeEl = document.getElementById('explore-hand-type');
    if (combosEl) combosEl.textContent = GTO.Data.COMBOS[hand] || '?';
    if (typeEl) {
      if (GTO.Data.isPair(hand)) typeEl.textContent = 'Pocket Pair';
      else if (GTO.Data.isSuited(hand)) typeEl.textContent = 'Suited';
      else typeEl.textContent = 'Offsuit';
    }
  },

  _exploreRangeData: null,

  // ═══════════════════ DRILL TYPE SELECTOR ═══════════════════
  _setupDrillTypeSelector: function() {
    var self = this;
    var selector = document.getElementById('drill-type-selector');
    if (!selector) return;

    selector.querySelectorAll('.toggle-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        selector.querySelectorAll('.toggle-option').forEach(function(o) { o.classList.remove('active'); });
        this.classList.add('active');
        self._switchDrillType(this.getAttribute('data-value'));
      });
    });
  },

  _activeDrillType: 'preflop',

  _switchDrillType: function(type) {
    this._activeDrillType = type;

    // Update tag
    var tag = document.getElementById('drill-type-tag');
    if (tag) tag.textContent = type.toUpperCase();

    // Toggle configs
    var configs = { preflop: 'preflop-config', postflop: 'postflop-config', pushfold: 'mtt-config' };
    var actives = { preflop: 'preflop-active', postflop: 'postflop-active', pushfold: 'mtt-active' };
    var matrices = { preflop: 'drill-matrix-area', postflop: 'drill-board-area', pushfold: 'drill-pushfold-matrix' };
    var feedbacks = { preflop: 'drill-preflop-feedback', postflop: 'drill-postflop-feedback', pushfold: 'drill-pushfold-feedback' };

    // Hide all configs/actives
    Object.values(configs).forEach(function(id) { var el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    Object.values(actives).forEach(function(id) { var el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    Object.values(matrices).forEach(function(id) { var el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    Object.values(feedbacks).forEach(function(id) { var el = document.getElementById(id); if (el) el.classList.add('hidden'); });

    // Show selected type
    var configId = configs[type];
    var matrixId = matrices[type];
    var feedbackId = feedbacks[type];
    if (configId) { var el = document.getElementById(configId); if (el) el.classList.remove('hidden'); }
    if (matrixId) { var el = document.getElementById(matrixId); if (el) el.classList.remove('hidden'); }
    if (feedbackId) { var el = document.getElementById(feedbackId); if (el) el.classList.remove('hidden'); }

    // Hide session summary
    var summary = document.getElementById('drill-session-summary');
    if (summary) summary.classList.add('hidden');
  },

  // ═══════════════════ SESSION SUMMARY ═══════════════════
  _setupSessionSummary: function() {
    var self = this;
    var againBtn = document.getElementById('btn-drill-again');
    var backBtn = document.getElementById('btn-back-config');
    if (againBtn) {
      againBtn.addEventListener('click', function() {
        self._hideSummaryShowConfig();
        // Re-start the same drill type
        if (self._activeDrillType === 'preflop') self._startPreflopSession();
        else if (self._activeDrillType === 'postflop') self._startPostflopSession();
        else if (self._activeDrillType === 'pushfold') self._startTournamentSession();
      });
    }
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        self._hideSummaryShowConfig();
      });
    }

    // Wire NEXT HAND bar button
    var nextDrillBtn = document.getElementById('btn-drill-next');
    if (nextDrillBtn) {
      nextDrillBtn.addEventListener('click', function() {
        self._nextDrill();
      });
    }

    // Wire View Range button
    var viewRangeBtn = document.getElementById('btn-view-range-preflop');
    if (viewRangeBtn) {
      viewRangeBtn.addEventListener('click', function() {
        self._navigateToExploreWithScenario();
      });
    }
  },

  _showSessionSummary: function(session, drillType) {
    // Hide active drill areas + progress bar
    this._hideDrillProgress();
    ['preflop-active', 'postflop-active', 'mtt-active'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    // Show summary
    var summary = document.getElementById('drill-session-summary');
    if (summary) summary.classList.remove('hidden');

    // Populate stats
    var totalEl = document.getElementById('summary-total');
    var accEl = document.getElementById('summary-accuracy');
    var evEl = document.getElementById('summary-ev-loss');
    var timeEl = document.getElementById('summary-time');

    if (totalEl) totalEl.textContent = session.totalDrills || session.decisions.length;
    if (accEl) accEl.textContent = Math.round(session.accuracy * 100) + '%';
    if (evEl) evEl.textContent = GTO.Utils.formatEV(session.totalEvLoss);

    var elapsed = session.endTime && session.startTime ? Math.round((session.endTime - session.startTime) / 1000) : 0;
    var mins = Math.floor(elapsed / 60);
    var secs = elapsed % 60;
    if (timeEl) timeEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;

    // Populate decisions table
    var tbody = document.getElementById('summary-decisions-body');
    if (tbody && session.decisions) {
      var html = '';
      session.decisions.forEach(function(d, i) {
        var verdictClass = '';
        if (d.result.verdict === 'optimal') verdictClass = 'positive';
        else if (d.result.verdict === 'acceptable') verdictClass = 'text-orange';
        else verdictClass = 'negative';

        var gtoAction = d.result.bestAction || d.result.correctAction || '?';
        html += '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td>' + (d.scenario.hand || '?') + '</td>' +
          '<td>' + (d.scenario.position || '?') + '</td>' +
          '<td>' + (d.userAction || '?').toUpperCase() + '</td>' +
          '<td>' + gtoAction.toUpperCase() + '</td>' +
          '<td class="' + verdictClass + '">' + (d.result.verdict || '?').toUpperCase() + '</td>' +
        '</tr>';
      });
      tbody.innerHTML = html;
    }

    GTO.Keyboard.setContext('navigation');
    this._activeDrillType = drillType;
  },

  _hideSummaryShowConfig: function() {
    var summary = document.getElementById('drill-session-summary');
    if (summary) summary.classList.add('hidden');

    // Show the right config for current drill type
    this._switchDrillType(this._activeDrillType);
  },

  _updateClock: function() {
    var el = document.getElementById('status-clock');
    if (el) el.textContent = GTO.Utils.formatTime();
  },

  _lastResult: null,
  _lastScenario: null
};

// Boot
document.addEventListener('DOMContentLoaded', function() {
  GTO.App.init();
});
