window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

GTO.Data.ContentCatalog = {
  CATEGORIES: {
    preflop_fundamentals: { label: 'Preflop Fundamentals', color: '#ff8c00' },
    position_play:        { label: 'Position Play',        color: '#0068ff' },
    bet_sizing:           { label: 'Bet Sizing',           color: '#4af6c3' },
    board_texture:        { label: 'Board Texture',        color: '#e0c040' },
    range_construction:   { label: 'Range Construction',   color: '#ff433d' },
    tournament_strategy:  { label: 'Tournament Strategy',  color: '#c070ff' },
    postflop_play:        { label: 'Postflop Play',        color: '#00c8ff' },
    mental_game:          { label: 'Mental Game',          color: '#888' }
  },

  TOPICS: [
    // === PREFLOP FUNDAMENTALS ===
    {
      id: 'rfi_fundamentals',
      title: 'Raise First In: Building Your Opening Ranges',
      category: 'preflop_fundamentals',
      difficulty: 'beginner',
      tags: ['rfi', 'preflop', 'position', 'opening'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['rfi'] },
      summary: 'Your RFI (Raise First In) range is the foundation of your preflop strategy. A sound opening range balances value hands with speculative holdings, adjusting by position. From early position, play tight — premium pairs and strong broadways. As you move toward the button, widen significantly. The key insight: position amplifies postflop playability, so hands like suited connectors and small pairs gain value in late position. A disciplined RFI strategy prevents bloated pots with weak holdings and sets up profitable postflop situations.',
      drills: [
        { type: 'preflop', label: 'RFI Drill (All Positions)', config: { drillType: 'preflop', actionContexts: ['rfi'], stackDepths: ['100bb'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about GTO Raise First In (RFI) strategy for 6-max No Limit Holdem cash games at 100bb. Cover: why position matters for opening ranges, how ranges widen from UTG to BTN, the role of suited vs offsuit hands, common leaks (opening too wide from EP, too tight from BTN), and how mixed frequencies work for borderline hands. Include specific hand examples. Write for intermediate players who understand basic poker but want to refine their preflop game toward GTO.'
    },
    {
      id: '3betting_strategy',
      title: '3-Betting: When and Why to Re-Raise',
      category: 'preflop_fundamentals',
      difficulty: 'intermediate',
      tags: ['3bet', 'preflop', 'aggression'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['vs_raise'] },
      summary: '3-betting serves two purposes: extracting value with premium hands and generating fold equity with bluffs. A balanced 3-bet range includes value hands (QQ+, AKs) and polarized bluffs (suited aces, suited connectors at the bottom of your calling range). Your 3-bet frequency should increase against late-position opens and decrease against early-position opens. Understanding when to use linear vs polarized 3-bet ranges is crucial for exploiting different opponent types while maintaining GTO balance.',
      drills: [
        { type: 'preflop', label: '3-Bet Defense Drill', config: { drillType: 'preflop', actionContexts: ['vs_raise'], stackDepths: ['100bb'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about GTO 3-betting strategy in 6-max NLHE cash games. Cover: linear vs polarized 3-bet ranges, how to construct 3-bet bluffing ranges (suited aces, suited connectors), position-dependent 3-bet frequencies, sizing considerations (IP vs OOP), and how to adjust 3-bet ranges based on the opener\'s position. Include hand examples showing why A5s is a better 3-bet bluff than A9o. Write for intermediate players.'
    },
    {
      id: 'blind_defense',
      title: 'Blind Defense: Protecting Your Investment',
      category: 'preflop_fundamentals',
      difficulty: 'intermediate',
      tags: ['blinds', 'defense', 'bb', 'sb', 'preflop'],
      weaknessMatch: { dimension: 'byPosition', keys: ['BB', 'SB'] },
      summary: 'The big blind gets a discount on calls, making it the widest defending position. GTO BB defense ranges are much wider than most players realize — you should be defending 40-60% of hands against a button open. The small blind is trickier: you\'re OOP with no discount, so SB strategy is primarily 3-bet or fold with a narrow calling range. Understanding pot odds, implied odds, and positional disadvantage helps calibrate your blind defense to avoid both over-folding (losing too much in blinds) and over-calling (playing too many hands OOP).',
      drills: [
        { type: 'preflop', label: 'Blind Defense Drill', config: { drillType: 'preflop', actionContexts: ['vs_raise'], positions: ['BB', 'SB'], stackDepths: ['100bb'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about GTO blind defense in 6-max NLHE. Cover: BB defense ranges and why they are so wide (pot odds), SB 3-bet or fold strategy, how to adjust defense frequencies based on opener position, the problem with flatting from the SB, which hands to 3-bet vs call from BB, and how to handle multiway pots in the blinds. Write for intermediate players.'
    },
    {
      id: 'cold_calling',
      title: 'Cold Calling: Flatting Opens In Position',
      category: 'preflop_fundamentals',
      difficulty: 'intermediate',
      tags: ['cold call', 'flat', 'preflop', 'ip'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['vs_raise'] },
      summary: 'Cold calling (flatting an open without having invested in the pot) is most profitable from the button and cutoff. Your flatting range should contain hands with good playability that don\'t need to 3-bet for protection — suited broadways, medium pairs, suited connectors. Avoid cold calling from early positions or the small blind where positional disadvantage erodes your edge. The decision between calling and 3-betting depends on your hand\'s raw equity versus its playability and your ability to realize that equity postflop.',
      drills: [
        { type: 'preflop', label: 'Facing Opens Drill', config: { drillType: 'preflop', actionContexts: ['vs_raise'], positions: ['BTN', 'CO', 'MP'], stackDepths: ['100bb'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about cold calling strategy in 6-max NLHE. Cover: when to flat vs 3-bet, position requirements for cold calling, constructing a cold call range (suited broadways, medium pairs, suited connectors), why cold calling from the SB is usually wrong, squeeze play considerations, and multiway pot dynamics. Write for intermediate players.'
    },

    // === POSITION PLAY ===
    {
      id: 'button_play',
      title: 'Button Mastery: Exploiting the Best Seat',
      category: 'position_play',
      difficulty: 'beginner',
      tags: ['button', 'btn', 'position', 'ip'],
      weaknessMatch: { dimension: 'byPosition', keys: ['BTN'] },
      summary: 'The button is the most profitable position in poker. You act last on every postflop street, giving you maximum information before every decision. GTO strategy opens approximately 45-50% of hands from the button, including many suited and connected hands that rely on positional advantage. Postflop, the button can float with wider ranges, barrel more effectively, and realize equity more efficiently. Mastering button play means understanding when to open wide, when to call 3-bets, and how to leverage position on every street.',
      drills: [
        { type: 'preflop', label: 'Button RFI Drill', config: { drillType: 'preflop', actionContexts: ['rfi'], positions: ['BTN'], stackDepths: ['100bb'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about mastering button play in 6-max NLHE. Cover: why BTN is the most profitable seat, BTN opening range construction, defending vs 3-bets from the blinds, postflop advantages of position, floating and delayed c-bets, and how to extract maximum value. Write for beginner-intermediate players.'
    },
    {
      id: 'early_position',
      title: 'Early Position: Playing Tight for a Reason',
      category: 'position_play',
      difficulty: 'beginner',
      tags: ['utg', 'ep', 'position', 'tight'],
      weaknessMatch: { dimension: 'byPosition', keys: ['UTG', 'MP'] },
      summary: 'Under the gun and middle position require the tightest opening ranges because 4-5 players remain to act behind you, increasing the chance of facing a 3-bet. GTO UTG ranges are only about 15-18% of hands — premium pairs, strong broadways, and select suited hands. Playing too loose from EP leads to difficult postflop spots where you\'re OOP with a capped range. The discipline to fold marginal hands from early position is what separates solid regulars from recreational players.',
      drills: [
        { type: 'preflop', label: 'EP Opening Drill', config: { drillType: 'preflop', actionContexts: ['rfi'], positions: ['UTG', 'MP'], stackDepths: ['100bb'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about early position strategy in 6-max NLHE. Cover: why EP ranges must be tight, UTG vs MP range differences, the concept of range advantage, how EP tightness affects postflop credibility, dealing with 3-bets from EP, and common mistakes like opening too many suited hands. Write for beginners.'
    },
    {
      id: 'sb_bb_dynamics',
      title: 'Small Blind vs Big Blind: The Battle of the Blinds',
      category: 'position_play',
      difficulty: 'advanced',
      tags: ['sb', 'bb', 'blinds', 'battle'],
      weaknessMatch: { dimension: 'byPosition', keys: ['SB', 'BB'] },
      summary: 'When action folds to the small blind, a unique dynamic emerges. The SB should raise a wide range (60-70%) because only one player remains. The BB defends very wide due to pot odds and closes the action. Postflop, the SB is always OOP, making this one of the most complex spots in poker. GTO SB strategy uses a lot of limping in some solver solutions, while others prefer a raise-or-fold approach. Understanding the nuances of this battle is critical since these spots occur frequently.',
      drills: [
        { type: 'preflop', label: 'SB vs BB Drill', config: { drillType: 'preflop', actionContexts: ['rfi'], positions: ['SB'], stackDepths: ['100bb'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about SB vs BB dynamics in 6-max NLHE. Cover: SB opening range when folded to, BB defense frequencies, the SB limping debate, postflop strategies when OOP (SB) vs IP (BB), check-raising frequencies from BB, and donk betting. Write for advanced players.'
    },

    // === BET SIZING ===
    {
      id: 'cbet_sizing',
      title: 'C-Bet Sizing: Choosing the Right Amount',
      category: 'bet_sizing',
      difficulty: 'intermediate',
      tags: ['cbet', 'sizing', 'flop', 'continuation'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['IP_cbet_flop', 'OOP_cbet_flop'] },
      summary: 'Continuation bet sizing is one of the most impactful decisions in postflop play. GTO solvers use different sizings depending on board texture and range advantage. On dry boards (K72r), small c-bets (25-33% pot) are efficient because your range advantage is large and you want to bet frequently. On wet, connected boards (JT8ss), larger sizings (66-75%) are better because draws need to be charged. Understanding which sizing to use and why is more important than memorizing exact frequencies.',
      drills: [
        { type: 'postflop', label: 'C-Bet Drill (IP)', config: { drillType: 'postflop', spotTypes: ['IP_cbet_flop'], format: 'cash', count: 30 } },
        { type: 'postflop', label: 'C-Bet Drill (OOP)', config: { drillType: 'postflop', spotTypes: ['OOP_cbet_flop'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about GTO c-bet sizing strategy. Cover: small c-bets on dry boards, large c-bets on wet boards, range-based vs hand-based c-betting, IP vs OOP c-bet frequency differences, when to check instead of c-bet, and how board texture drives sizing decisions. Include board examples. Write for intermediate players.'
    },
    {
      id: 'turn_barrels',
      title: 'Turn Barrels: When to Fire the Second Bullet',
      category: 'bet_sizing',
      difficulty: 'advanced',
      tags: ['turn', 'barrel', 'sizing', 'aggression'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['IP_turn_barrel', 'OOP_turn_barrel'] },
      summary: 'The turn is where pots grow significantly and mistakes become costly. A good turn barreling strategy selects hands that benefit from continued aggression — strong value hands that want to build the pot, and bluffs with good equity (draws, backdoor draws that picked up outs). Turn sizing is typically larger than flop sizing (66-75% pot) because the remaining stack-to-pot ratio decreases. The turn card itself matters enormously: overcards that improve your perceived range are great barrel cards, while low cards that complete draws may be better to check.',
      drills: [
        { type: 'postflop', label: 'Turn Barrel Drill', config: { drillType: 'postflop', spotTypes: ['IP_turn_barrel', 'OOP_turn_barrel'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about turn barreling in NLHE. Cover: selecting turn value bets vs bluffs, turn card texture changes, sizing on turn (66-75%), when to give up on bluffs, double-barrel equity requirements, and how turn play sets up river decisions. Write for advanced players.'
    },
    {
      id: 'river_decisions',
      title: 'River Bet Sizing: Polarization and Value',
      category: 'bet_sizing',
      difficulty: 'advanced',
      tags: ['river', 'sizing', 'polarization', 'value'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['IP_river_bet', 'OOP_river_bet'] },
      summary: 'River play is the purest expression of GTO poker because all cards are dealt and no more drawing is possible. River betting ranges are highly polarized: you bet with the top of your range (strong value) and the bottom (bluffs), while checking your medium-strength hands. Sizing depends on your polarization ratio — the more polarized your range, the larger you should bet. A 75% pot bet needs to work about 43% of the time as a bluff, while an overbet needs less frequency. Understanding river bet-to-bluff ratios is essential.',
      drills: [
        { type: 'postflop', label: 'River Decisions Drill', config: { drillType: 'postflop', spotTypes: ['IP_river_bet', 'OOP_river_bet'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about river strategy in NLHE. Cover: polarized river ranges, bet sizing theory, bluff-to-value ratios for different sizes, thin value betting, river overbets, and check-calling vs check-raising rivers. Include math for MDF at different sizings. Write for advanced players.'
    },

    // === BOARD TEXTURE ===
    {
      id: 'dry_boards',
      title: 'Dry Board Strategy: Dominating Static Textures',
      category: 'board_texture',
      difficulty: 'beginner',
      tags: ['board', 'dry', 'texture', 'static'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['IP_cbet_flop', 'OOP_cbet_flop'] },
      summary: 'Dry boards like K72 rainbow or A83 rainbow heavily favor the preflop raiser because their range contains more strong hands (overpairs, top pairs with good kickers). On these textures, GTO strategy uses frequent small c-bets (25-33% pot) because the board is unlikely to change on future streets. The defender\'s strategy involves a lot of folding and selective check-raises with sets and strong draws. Understanding that dry boards = high c-bet frequency + small sizing is one of the most important postflop concepts.',
      drills: [
        { type: 'postflop', label: 'Dry Board C-Bet Drill', config: { drillType: 'postflop', spotTypes: ['IP_cbet_flop'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about playing dry board textures in NLHE. Cover: what makes a board dry, why the preflop raiser has range advantage, small c-bet sizing strategy, defending against c-bets on dry boards, turn and river play on static textures, and common dry board examples. Write for beginners.'
    },
    {
      id: 'wet_boards',
      title: 'Wet Board Navigation: Draws, Equity, and Protection',
      category: 'board_texture',
      difficulty: 'intermediate',
      tags: ['board', 'wet', 'texture', 'dynamic', 'draws'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['IP_cbet_flop', 'OOP_cbet_flop'] },
      summary: 'Wet boards like JT8 with two suits or 9876 create complex spots where both players have significant equity. On these textures, c-bet sizing increases (66-75% pot) because draws need to pay more to continue. C-bet frequency decreases because the defender\'s range connects better. Check-raising becomes more common as a defensive tool. The key to wet board play is understanding equity distribution — who has the nut advantage, who has more draws, and how the board will change on future streets.',
      drills: [
        { type: 'postflop', label: 'Wet Board Drill', config: { drillType: 'postflop', spotTypes: ['IP_cbet_flop', 'OOP_cbet_flop'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about wet board strategy in NLHE. Cover: identifying wet textures, why c-bet sizing increases, reduced c-bet frequency, check-raising on wet boards, protecting equity with draws, nut advantage concepts, and how dynamic boards affect turn/river play. Write for intermediate players.'
    },
    {
      id: 'paired_monotone',
      title: 'Paired & Monotone Boards: Special Texture Strategy',
      category: 'board_texture',
      difficulty: 'advanced',
      tags: ['board', 'paired', 'monotone', 'texture', 'special'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['IP_cbet_flop', 'OOP_cbet_flop'] },
      summary: 'Paired boards (like K88 or QQ4) and monotone boards (three cards of one suit) create unique strategic situations. On paired boards, the preflop raiser has a significant range advantage because they have more overpairs and big pocket pairs. C-bet frequency is high with small sizing. On monotone boards, having the nut flush draw is crucial — if you don\'t have it, proceed cautiously. These special textures require adjusting your standard strategies and understanding how range composition changes.',
      drills: [
        { type: 'postflop', label: 'Special Texture Drill', config: { drillType: 'postflop', spotTypes: ['IP_cbet_flop'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about paired and monotone board strategy in NLHE. Cover: paired board c-bet strategy, trips and full house considerations, monotone board nut flush advantage, playing without the flush draw on monotone boards, sizing adjustments, and how these textures affect check-raising. Write for advanced players.'
    },

    // === RANGE CONSTRUCTION ===
    {
      id: 'polarized_vs_linear',
      title: 'Polarized vs Linear Ranges: Two Betting Philosophies',
      category: 'range_construction',
      difficulty: 'intermediate',
      tags: ['range', 'polarized', 'linear', 'merged', 'theory'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['rfi', 'vs_raise'] },
      summary: 'A polarized range contains very strong hands and bluffs but no medium-strength hands. A linear (or merged) range contains the best hands in descending order with no bluffs. GTO preflop 3-betting is typically polarized (premiums + bluffs), while cold calling is linear. Postflop, river betting ranges are highly polarized. Understanding which approach to use depends on the street, position, and stack depth. Polarized ranges use larger sizings; linear ranges use smaller sizings.',
      drills: [
        { type: 'preflop', label: 'Range Construction Drill', config: { drillType: 'preflop', actionContexts: ['rfi', 'vs_raise'], stackDepths: ['100bb'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about polarized vs linear ranges in NLHE. Cover: definition and examples of each, when to use polarized ranges (3-betting, river betting), when to use linear ranges (cold calling, small c-bets), how stack depth affects range shape, and the relationship between range type and bet sizing. Write for intermediate players.'
    },
    {
      id: 'bluff_to_value',
      title: 'Bluff-to-Value Ratios: The Math Behind Balance',
      category: 'range_construction',
      difficulty: 'advanced',
      tags: ['bluff', 'value', 'ratio', 'balance', 'mdf'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['IP_river_bet', 'OOP_river_bet'] },
      summary: 'GTO poker requires specific bluff-to-value ratios that make opponents indifferent between calling and folding. For a pot-sized bet, you need 1 bluff for every 2 value bets (33% bluffs). For a half-pot bet, roughly 1 bluff for every 3 value bets (25% bluffs). These ratios are derived from the Minimum Defense Frequency (MDF) concept. Understanding this math lets you construct balanced betting ranges on the river and evaluate whether opponents are over- or under-bluffing.',
      drills: [
        { type: 'postflop', label: 'River Balance Drill', config: { drillType: 'postflop', spotTypes: ['IP_river_bet', 'OOP_river_bet'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about bluff-to-value ratios in NLHE. Cover: MDF formula (1 - bet/(bet+pot)), how MDF determines bluff frequency, calculating bluff combos for different bet sizes, practical examples on the river, why bluff-to-value ratios change with position and board texture. Include the math. Write for advanced players.'
    },

    // === TOURNAMENT STRATEGY ===
    {
      id: 'push_fold_math',
      title: 'Push/Fold: The Mathematics of Short Stack Play',
      category: 'tournament_strategy',
      difficulty: 'beginner',
      tags: ['tournament', 'push', 'fold', 'short stack', 'icm'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['push_fold'] },
      summary: 'When your stack drops below 10-15 big blinds in a tournament, your strategy simplifies to push (all-in) or fold. This is because with a short stack, raising and then folding to a 3-bet wastes too many chips. Push/fold charts are based on your position, stack size, and hand strength. From the button with 10bb, you should be pushing about 40% of hands. Understanding these charts is essential for tournament survival and is one of the most mathematically solved areas of poker.',
      drills: [
        { type: 'tournament', label: 'Push/Fold Drill (5-15bb)', config: { drillType: 'tournament', stackMin: '5', stackMax: '15', stage: 'normal', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about push/fold strategy in tournaments. Cover: why push/fold exists (stack-to-pot ratio), Nash equilibrium push ranges by position, how stack size changes ranges (8bb vs 12bb vs 15bb), calling ranges for the big blind, and common mistakes like pushing too tight from late position. Write for beginners.'
    },
    {
      id: 'icm_pressure',
      title: 'ICM Pressure: When Survival Changes Everything',
      category: 'tournament_strategy',
      difficulty: 'advanced',
      tags: ['tournament', 'icm', 'bubble', 'pressure'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['push_fold'] },
      summary: 'The Independent Chip Model (ICM) assigns real-money value to tournament chips based on prize pool equity. Near the bubble or at final tables, chip utility becomes non-linear — losing chips hurts more than winning chips helps. This creates ICM pressure that dramatically tightens correct ranges. A medium stack should avoid confrontations with other medium stacks near the bubble, while a big stack can exploit this by attacking relentlessly. Understanding ICM transforms your tournament decision-making.',
      drills: [
        { type: 'tournament', label: 'Bubble Push/Fold Drill', config: { drillType: 'tournament', stackMin: '8', stackMax: '20', stage: 'bubble', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about ICM in tournaments. Cover: what ICM is and why chips have non-linear value, bubble dynamics, big stack vs medium stack vs short stack strategy, risk premium concept, how ICM affects calling ranges more than pushing ranges, and practical bubble examples. Write for advanced players.'
    },
    {
      id: 'short_stack_tourney',
      title: 'Short Stack Tournament Play: 15-25bb Strategy',
      category: 'tournament_strategy',
      difficulty: 'intermediate',
      tags: ['tournament', 'short stack', 'reshove', '3bet jam'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['vs_raise', 'push_fold'] },
      summary: 'The 15-25bb stack depth is one of the most critical in tournament poker. You\'re too deep for pure push/fold but too shallow for standard raise-call-play-postflop lines. The primary weapon here is the 3-bet jam (reshove): when someone opens, you go all-in. This generates tremendous fold equity because your stack still represents a significant risk to the opener. Hand selection for reshoves depends on position, the opener\'s range, and ICM considerations.',
      drills: [
        { type: 'tournament', label: 'Short Stack Drill (15-25bb)', config: { drillType: 'tournament', stackMin: '15', stackMax: '25', stage: 'normal', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about 15-25bb tournament strategy. Cover: why this stack depth is awkward, the reshove/3-bet jam as primary weapon, selecting hands for reshoves, open-raising at this depth (smaller sizing), defending your opens, and adjusting for ICM. Write for intermediate players.'
    },

    // === POSTFLOP PLAY ===
    {
      id: 'check_raising',
      title: 'Check-Raising: The Defender\'s Most Powerful Weapon',
      category: 'postflop_play',
      difficulty: 'intermediate',
      tags: ['check-raise', 'defense', 'postflop', 'oop'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['OOP_facing_cbet_flop', 'OOP_facing_turn_barrel'] },
      summary: 'Check-raising is the primary tool for the out-of-position defender to fight back against continuation bets. A balanced check-raising range includes strong made hands (sets, two pair, top pair good kicker) and draws (flush draws, open-ended straight draws) as semi-bluffs. On the flop, you should be check-raising roughly 10-15% of the time against c-bets. The threat of a check-raise forces the c-bettor to respect your checking range, which in turn lets your check-calls be more profitable.',
      drills: [
        { type: 'postflop', label: 'Facing C-Bet Drill (OOP)', config: { drillType: 'postflop', spotTypes: ['OOP_facing_cbet_flop'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about check-raising in NLHE. Cover: why check-raising is essential for OOP play, constructing a balanced check-raise range (value + draws), flop check-raise frequency, turn check-raise spots, when NOT to check-raise, and how check-raising interacts with c-bet sizing. Write for intermediate players.'
    },
    {
      id: 'facing_bets_ip',
      title: 'Facing Bets In Position: Call, Raise, or Fold',
      category: 'postflop_play',
      difficulty: 'intermediate',
      tags: ['facing bet', 'ip', 'defense', 'postflop'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['IP_facing_cbet_flop', 'IP_facing_turn_barrel'] },
      summary: 'When you\'re in position and facing a bet, you have three options: call, raise, or fold. The beauty of being IP is that calling keeps your range wide and flexible — you can raise the turn or river for value or as a bluff. GTO IP defense involves calling with a wide range of pairs and draws, raising selectively with strong hands and select bluffs, and folding only the weakest hands. Floating (calling with the intention of taking the pot later) is more effective IP because you get to act last on future streets.',
      drills: [
        { type: 'postflop', label: 'Facing Bets IP Drill', config: { drillType: 'postflop', spotTypes: ['IP_facing_cbet_flop'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about facing bets in position in NLHE. Cover: the advantage of IP defense (seeing opponent act first), floating concept, when to raise vs call vs fold, turn card implications for IP defenders, delayed raises, and how to handle multi-barrel scenarios. Write for intermediate players.'
    },
    {
      id: 'donk_betting',
      title: 'Donk Betting: When Leading Out Makes Sense',
      category: 'postflop_play',
      difficulty: 'advanced',
      tags: ['donk bet', 'lead', 'oop', 'postflop'],
      weaknessMatch: { dimension: 'bySpotType', keys: ['OOP_cbet_flop'] },
      summary: 'A donk bet (betting into the preflop aggressor) was traditionally considered a weak play, but GTO solvers show it has strategic merit on specific board textures. Boards that dramatically shift equity in favor of the caller\'s range — like 678 monotone when BB called a BTN open — warrant donk bets because the preflop raiser will check back frequently anyway. Donk betting on these boards captures value and prevents free cards. Understanding when the board favors your range as the caller is the key to knowing when donk bets are correct.',
      drills: [
        { type: 'postflop', label: 'OOP Strategy Drill', config: { drillType: 'postflop', spotTypes: ['OOP_cbet_flop'], format: 'cash', count: 30 } }
      ],
      aiPrompt: 'Write an 800-word article about donk betting in NLHE. Cover: why donk betting was historically stigmatized, when solvers use donk bets (range advantage on dynamic boards), board textures that favor the caller, donk bet sizing, balancing a donk betting range, and which positions benefit most from donk betting. Write for advanced players.'
    },

    // === MENTAL GAME ===
    {
      id: 'tilt_management',
      title: 'Tilt Management: Protecting Your Edge',
      category: 'mental_game',
      difficulty: 'beginner',
      tags: ['tilt', 'mental', 'emotional', 'discipline'],
      weaknessMatch: null,
      summary: 'Tilt — playing suboptimally due to emotional disturbance — is the single biggest leak for most poker players. Common triggers include bad beats, coolers, missed draws, and running below expectation. The key insight: tilt isn\'t about the triggering event, it\'s about your response to it. Effective tilt management combines prevention (bankroll management, session limits, physical health) with in-the-moment strategies (breathing techniques, thought reframing, taking breaks). A player who never tilts has a massive edge over equally skilled opponents who do.',
      drills: [],
      aiPrompt: 'Write an 800-word article about tilt management for poker players. Cover: common tilt triggers, the neurological basis of tilt (amygdala hijack), prevention strategies (bankroll, sleep, breaks), in-session tilt detection, recovery techniques (breathing, thought reframing), creating a personal tilt protocol, and the long-term EV impact of tilt. Write accessibly for all levels.'
    },
    {
      id: 'session_planning',
      title: 'Session Planning: Structured Practice for Results',
      category: 'mental_game',
      difficulty: 'beginner',
      tags: ['session', 'planning', 'study', 'routine'],
      weaknessMatch: null,
      summary: 'Structured study sessions produce dramatically better results than aimless play. An effective session combines warm-up drills (10-15 minutes of targeted practice), focused play (1-2 hours with specific goals), and review (analyzing key hands and identifying patterns). Set specific goals for each session: "I will focus on my c-bet sizing on wet boards" is better than "I will play well." Track your sessions to identify when you play best and what conditions lead to your best decisions.',
      drills: [],
      aiPrompt: 'Write an 800-word article about structuring poker study sessions. Cover: warm-up routines, setting specific session goals, time management (play vs study ratio), using training tools effectively, post-session review process, tracking progress over time, and building a weekly study schedule. Write for all levels.'
    },
    {
      id: 'variance_understanding',
      title: 'Understanding Variance: The Reality of Results',
      category: 'mental_game',
      difficulty: 'intermediate',
      tags: ['variance', 'statistics', 'long run', 'bankroll'],
      weaknessMatch: null,
      summary: 'Variance is the natural fluctuation in poker results caused by the random distribution of cards. Even a strong winning player will have losing sessions, losing weeks, and sometimes losing months. Understanding variance mathematically — standard deviation, confidence intervals, required sample sizes — helps you evaluate your true skill level and make rational decisions about stakes and bankroll. Key fact: you need at least 30,000-50,000 hands before your results are statistically meaningful in cash games.',
      drills: [],
      aiPrompt: 'Write an 800-word article about variance in poker. Cover: what variance is mathematically, standard deviation in poker, how long downswings can last, required sample sizes for meaningful results, bankroll management as variance protection, the psychological impact of variance, and how to evaluate if you are a winning player. Write for intermediate players.'
    }
  ],

  getTopicById: function(id) {
    for (var i = 0; i < this.TOPICS.length; i++) {
      if (this.TOPICS[i].id === id) return this.TOPICS[i];
    }
    return null;
  },

  getTopicsByCategory: function(category) {
    return this.TOPICS.filter(function(t) { return t.category === category; });
  },

  getTopicsByDifficulty: function(difficulty) {
    return this.TOPICS.filter(function(t) { return t.difficulty === difficulty; });
  },

  getAllCategories: function() {
    return Object.keys(this.CATEGORIES);
  },

  getCategoryLabel: function(catId) {
    return this.CATEGORIES[catId] ? this.CATEGORIES[catId].label : catId;
  },

  getCategoryColor: function(catId) {
    return this.CATEGORIES[catId] ? this.CATEGORIES[catId].color : '#888';
  },

  searchTopics: function(query) {
    var q = query.toLowerCase();
    return this.TOPICS.filter(function(t) {
      return t.title.toLowerCase().indexOf(q) >= 0 ||
             t.summary.toLowerCase().indexOf(q) >= 0 ||
             t.tags.some(function(tag) { return tag.indexOf(q) >= 0; });
    });
  }
};
