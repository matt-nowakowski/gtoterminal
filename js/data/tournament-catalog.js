window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

GTO.Data.TournamentCatalog = {

  CATEGORIES: {
    live_series:   { label: 'Live Series',   color: '#ff8c00' },
    online_major:  { label: 'Online Major',  color: '#0068ff' },
    cash_stream:   { label: 'Cash Game',     color: '#4af6c3' },
    educational:   { label: 'Educational',   color: '#c084fc' },
    highlights:    { label: 'Highlights',    color: '#ff433d' }
  },

  // platform: 'twitch' | 'youtube'
  // channel: Twitch channel name OR YouTube channel handle (without @)
  STREAMS: [
    // ── Live Series ──
    { id: 'pokerstars',     label: 'PokerStars',          platform: 'twitch',  channel: 'pokerstars',              category: 'online_major',  description: 'Official PokerStars — WCOOP, SCOOP, EPT, Sunday majors',     tags: ['mtt','nlhe','wcoop','scoop'] },
    { id: 'pokerstars_yt',  label: 'PokerStars',          platform: 'youtube', channel: 'PokerStars',              category: 'online_major',  description: 'PokerStars YouTube — The Big Game, EPT highlights, WSOP',    tags: ['mtt','nlhe','highlights'] },
    { id: 'ggpoker',        label: 'GGPoker',             platform: 'twitch',  channel: 'ggpokerofficial',         category: 'online_major',  description: 'GGPoker official — WSOP Online, Super MILLION$, GGSeries',   tags: ['mtt','nlhe','wsop-online'] },
    { id: 'ggpoker_yt',     label: 'GGPoker',             platform: 'youtube', channel: 'GGPokerOfficial',         category: 'online_major',  description: 'GGPoker YouTube — Game of Gold, tournament highlights',      tags: ['mtt','nlhe','highlights'] },
    { id: 'wsop',           label: 'WSOP',                platform: 'twitch',  channel: 'wsop',                    category: 'live_series',   description: 'World Series of Poker — Main Event, bracelet events',        tags: ['mtt','nlhe','live','wsop'] },
    { id: 'wpt',            label: 'WPT',                 platform: 'twitch',  channel: 'worldpokertour',          category: 'live_series',   description: 'World Poker Tour 24/7 — WPT events, final tables, reruns',   tags: ['mtt','nlhe','live','wpt'] },
    { id: 'pokergo',        label: 'PokerGO',             platform: 'twitch',  channel: 'pokergo',                 category: 'live_series',   description: 'PokerGO 24/7 — High Stakes Poker, SHRB, US Poker Open',      tags: ['mtt','nlhe','high-roller'] },
    { id: 'pokergo_yt',     label: 'PokerGO',             platform: 'youtube', channel: 'PokerGO',                 category: 'live_series',   description: 'PokerGO YouTube — High Stakes Poker, classic episodes',      tags: ['highlights','high-roller'] },
    { id: 'partypoker',     label: 'partypoker',          platform: 'twitch',  channel: 'partypoker',              category: 'online_major',  description: 'partypoker official — MILLIONS Online, KO Series',           tags: ['mtt','nlhe'] },

    // ── Cash Game Streams ──
    { id: 'hustler',        label: 'Hustler Casino Live',  platform: 'twitch',  channel: 'hustlercasinolivepoker', category: 'cash_stream',  description: 'High-stakes cash from Hustler Casino, LA — nightly streams', tags: ['cash','nlhe','live','high-stakes'] },
    { id: 'hustler_yt',     label: 'Hustler Casino Live',  platform: 'youtube', channel: 'HustlerCasinoLive',      category: 'cash_stream',  description: 'HCL YouTube — full episodes, highlights, Million $ Game',    tags: ['cash','nlhe','live','high-stakes'] },
    { id: 'liveatbike',     label: 'Live at the Bike',     platform: 'twitch',  channel: 'liveatthebike',          category: 'cash_stream',  description: 'Live cash games from The Bicycle Casino, LA',                tags: ['cash','nlhe','live'] },
    { id: 'lodge_yt',       label: 'Poker at the Lodge',   platform: 'youtube', channel: 'PokerattheLodge',        category: 'cash_stream',  description: 'Doug Polk\'s Lodge — cash games Thu-Sun, $5/5 to $100/200',  tags: ['cash','nlhe','live'] },

    // ── Educational / Pros ──
    { id: 'dnegs',          label: 'Daniel Negreanu',      platform: 'twitch',  channel: 'dnegspoker',             category: 'educational',  description: 'DNegs streaming MTTs with live strategy commentary',         tags: ['mtt','nlhe','commentary'] },
    { id: 'lex',            label: 'Lex Veldhuis',         platform: 'twitch',  channel: 'lexveldhuis',            category: 'educational',  description: 'Lex crushing Sunday majors with entertaining commentary',    tags: ['mtt','nlhe','commentary'] },
    { id: 'spraggy',        label: 'Spraggy',              platform: 'twitch',  channel: 'spraggy',                category: 'educational',  description: 'PokerStars ambassador — fun MTT content & community',        tags: ['mtt','nlhe','community'] },
    { id: 'tonkaaap',       label: 'Tonkaaap',             platform: 'twitch',  channel: 'tonkaaap',               category: 'educational',  description: 'High-stakes MTT grinder — deep strategy breakdowns',         tags: ['mtt','nlhe','high-stakes','strategy'] },
    { id: 'easywithaces',   label: 'EasyWithAces',         platform: 'twitch',  channel: 'easywithaces',           category: 'educational',  description: 'Educational poker — hand reviews & strategy',                tags: ['mtt','nlhe','education'] },
    { id: 'brad_owen_yt',   label: 'Brad Owen',            platform: 'youtube', channel: 'BradOwenPoker',          category: 'educational',  description: 'Poker vlogger — cash game sessions, strategy, Vegas life',   tags: ['cash','nlhe','vlog'] },
    { id: 'rampage_yt',     label: 'Rampage Poker',        platform: 'youtube', channel: 'RampagePoker',           category: 'educational',  description: 'Rampage — MTT & cash vlogs, tournament grinds',              tags: ['mtt','cash','nlhe','vlog'] },

    // ── Highlights ──
    { id: 'pokergo_clips',  label: 'PokerGO Clips',        platform: 'youtube', channel: 'PokerGO',               category: 'highlights',   description: 'Best hands, hero calls, and sick bluffs from PokerGO',       tags: ['highlights','entertainment'] }
  ],

  SCHEDULE: [
    // ── WSOP 2025 ──
    { id: 'wsop25_main',        name: 'WSOP 2025 Main Event',          series: 'WSOP',       startDate: '2025-06-29', endDate: '2025-07-16', buyIn: '$10,000',  format: 'NLHE',  stream: 'wsop',       status: 'upcoming', description: 'The Big One — $10K Main Event' },
    { id: 'wsop25_colossus',    name: 'WSOP Colossus',                 series: 'WSOP',       startDate: '2025-06-05', endDate: '2025-06-08', buyIn: '$400',     format: 'NLHE',  stream: 'wsop',       status: 'upcoming', description: 'Massive field $400 NLHE event' },
    { id: 'wsop25_monster',     name: 'WSOP Monster Stack',            series: 'WSOP',       startDate: '2025-06-12', endDate: '2025-06-15', buyIn: '$600',     format: 'NLHE',  stream: 'wsop',       status: 'upcoming', description: 'Deep-stacked $600 event' },
    { id: 'wsop25_plossus',     name: 'WSOP PLOssus',                  series: 'WSOP',       startDate: '2025-06-19', endDate: '2025-06-22', buyIn: '$600',     format: 'PLO',   stream: 'wsop',       status: 'upcoming', description: 'Biggest PLO tournament of the year' },
    { id: 'wsop25_seniors',     name: 'WSOP Seniors Championship',     series: 'WSOP',       startDate: '2025-06-16', endDate: '2025-06-19', buyIn: '$1,000',   format: 'NLHE',  stream: 'wsop',       status: 'upcoming', description: '50+ seniors bracelet event' },

    // ── EPT 2025 ──
    { id: 'ept25_monte',        name: 'EPT Monte Carlo Main',          series: 'EPT',        startDate: '2025-04-22', endDate: '2025-05-03', buyIn: '\u20AC5,300', format: 'NLHE', stream: 'pokerstars', status: 'upcoming', description: 'EPT Monte Carlo Main Event' },
    { id: 'ept25_barcelona',    name: 'EPT Barcelona Main',            series: 'EPT',        startDate: '2025-08-18', endDate: '2025-08-30', buyIn: '\u20AC5,300', format: 'NLHE', stream: 'pokerstars', status: 'upcoming', description: 'Biggest EPT stop of the year' },
    { id: 'ept25_prague',       name: 'EPT Prague Main',               series: 'EPT',        startDate: '2025-12-08', endDate: '2025-12-19', buyIn: '\u20AC5,300', format: 'NLHE', stream: 'pokerstars', status: 'upcoming', description: 'Season-ending EPT Prague' },

    // ── WPT 2025 ──
    { id: 'wpt25_woc',          name: 'WPT World Championship',        series: 'WPT',        startDate: '2025-04-12', endDate: '2025-04-17', buyIn: '$10,400',  format: 'NLHE',  stream: 'wpt',        status: 'upcoming', description: 'WPT season-ending championship' },
    { id: 'wpt25_venetian',     name: 'WPT Venetian',                  series: 'WPT',        startDate: '2025-07-07', endDate: '2025-07-12', buyIn: '$5,000',   format: 'NLHE',  stream: 'wpt',        status: 'upcoming', description: 'WPT at the Venetian Las Vegas' },

    // ── Online Series ──
    { id: 'wcoop25',            name: 'WCOOP 2025',                    series: 'WCOOP',      startDate: '2025-09-01', endDate: '2025-09-22', buyIn: 'Various',  format: 'Mixed', stream: 'pokerstars', status: 'upcoming', description: 'World Championship of Online Poker' },
    { id: 'scoop25',            name: 'SCOOP 2025',                    series: 'SCOOP',      startDate: '2025-05-04', endDate: '2025-05-25', buyIn: 'Various',  format: 'Mixed', stream: 'pokerstars', status: 'upcoming', description: 'Spring Championship of Online Poker' },
    { id: 'gg_wsop25',          name: 'WSOP Online 2025',              series: 'GGPoker',    startDate: '2025-06-01', endDate: '2025-07-31', buyIn: 'Various',  format: 'Mixed', stream: 'ggpoker',    status: 'upcoming', description: 'WSOP Online bracelet events on GGPoker' },
    { id: 'gg_supermil',        name: 'Super MILLION$ Week',           series: 'GGPoker',    startDate: '2025-03-10', endDate: '2025-03-16', buyIn: '$10,300',  format: 'NLHE',  stream: 'ggpoker',    status: 'upcoming', description: 'High-roller Super MILLION$ series' },

    // ── High Roller ──
    { id: 'shrb25',             name: 'Super High Roller Bowl',        series: 'PokerGO',    startDate: '2025-05-28', endDate: '2025-06-01', buyIn: '$300,000', format: 'NLHE',  stream: 'pokergo',    status: 'upcoming', description: '$300K Super High Roller Bowl' },
    { id: 'pgt25_uspo',        name: 'US Poker Open',                  series: 'PokerGO',    startDate: '2025-03-13', endDate: '2025-03-25', buyIn: '$10,000',  format: 'Mixed', stream: 'pokergo',    status: 'upcoming', description: 'US Poker Open — mixed game series' },

    // ── Cash Game Events ──
    { id: 'hustler_ongoing',    name: 'Hustler Casino Live (Weekly)',   series: 'HCL',        startDate: '2025-01-01', endDate: '2025-12-31', buyIn: 'N/A',      format: 'Cash',  stream: 'hustler',    status: 'live',     description: 'Weekly high-stakes cash games' },
    { id: 'lodge_ongoing',      name: 'Poker at the Lodge (Thu-Sun)',   series: 'Lodge',      startDate: '2025-01-01', endDate: '2025-12-31', buyIn: 'N/A',      format: 'Cash',  stream: 'lodge_yt',   status: 'live',     description: 'Weekly Lodge cash games — Thu to Sun' }
  ],

  // ── Helper Methods ──

  getStreamsByCategory: function(category) {
    if (!category || category === 'all') return this.STREAMS.slice();
    return this.STREAMS.filter(function(s) { return s.category === category; });
  },

  getStreamById: function(id) {
    for (var i = 0; i < this.STREAMS.length; i++) {
      if (this.STREAMS[i].id === id) return this.STREAMS[i];
    }
    return null;
  },

  getStreamByChannel: function(channel) {
    for (var i = 0; i < this.STREAMS.length; i++) {
      if (this.STREAMS[i].channel === channel) return this.STREAMS[i];
    }
    return null;
  },

  getUpcomingTournaments: function(limit) {
    var now = new Date().toISOString().split('T')[0];
    var upcoming = this.SCHEDULE.filter(function(t) {
      return t.endDate >= now;
    });
    upcoming.sort(function(a, b) {
      return a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0;
    });
    return limit ? upcoming.slice(0, limit) : upcoming;
  },

  getLiveTournaments: function() {
    return this.SCHEDULE.filter(function(t) { return t.status === 'live'; });
  },

  getTournamentById: function(id) {
    for (var i = 0; i < this.SCHEDULE.length; i++) {
      if (this.SCHEDULE[i].id === id) return this.SCHEDULE[i];
    }
    return null;
  },

  searchStreams: function(query) {
    var q = query.toLowerCase();
    return this.STREAMS.filter(function(s) {
      return s.label.toLowerCase().indexOf(q) !== -1 ||
             s.channel.toLowerCase().indexOf(q) !== -1 ||
             s.description.toLowerCase().indexOf(q) !== -1 ||
             (s.tags && s.tags.some(function(t) { return t.indexOf(q) !== -1; }));
    });
  },

  getAllCategories: function() {
    return Object.keys(this.CATEGORIES);
  },

  getCategoryLabel: function(cat) {
    return this.CATEGORIES[cat] ? this.CATEGORIES[cat].label : cat;
  },

  getCategoryColor: function(cat) {
    return this.CATEGORIES[cat] ? this.CATEGORIES[cat].color : 'var(--text-dim)';
  }
};
