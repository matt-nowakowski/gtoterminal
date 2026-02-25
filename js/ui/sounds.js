// GTOTerminal — Sound Effects (Web Audio API)
// Synthesized tones, no audio files needed.

window.GTO = window.GTO || {};
GTO.UI = GTO.UI || {};

GTO.UI.Sounds = {
  _ctx: null,

  _ensureContext: function() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume suspended context (browser autoplay policy)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  },

  play: function(name) {
    var settings = GTO.State.get('settings');
    if (!settings || !settings.soundEnabled) return;

    try {
      var fn = this['_' + name];
      if (fn) fn.call(this);
    } catch (e) {
      // Silently fail — sounds are non-critical
    }
  },

  // ── Sound Definitions ──

  // Correct answer — ascending two-tone chime
  _correct: function() {
    var ctx = this._ensureContext();
    var now = ctx.currentTime;

    // First tone
    var osc1 = ctx.createOscillator();
    var gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 660;
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second tone (higher)
    var osc2 = ctx.createOscillator();
    var gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 880;
    gain2.gain.setValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  },

  // Wrong answer — low thud
  _incorrect: function() {
    var ctx = this._ensureContext();
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  },

  // Button / cell click — soft tick
  _click: function() {
    var ctx = this._ensureContext();
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  },

  // New hand dealt — quick snap
  _deal: function() {
    var ctx = this._ensureContext();
    var now = ctx.currentTime;

    // Noise burst via oscillator detune trick
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  },

  // Session complete — three-tone ascending jingle
  _complete: function() {
    var ctx = this._ensureContext();
    var now = ctx.currentTime;
    var notes = [523, 659, 784]; // C5, E5, G5

    for (var i = 0; i < notes.length; i++) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = notes[i];
      var t = now + i * 0.12;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }
};
