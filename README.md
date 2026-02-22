# GTOTerminal

A self-contained, browser-based GTO poker training suite with a Bloomberg terminal aesthetic. No build tools, no dependencies, no server — just open `index.html` and drill.

![GTOTerminal](https://img.shields.io/badge/status-alpha-orange) ![License](https://img.shields.io/badge/license-MIT-blue)

## What is this?

GTOTerminal is a free, open-source tool for studying Game Theory Optimal (GTO) poker strategy. It covers preflop ranges, postflop bet sizing, push/fold charts, and full hand playthrough — all with instant feedback on how your decisions compare to GTO.

Built for serious poker players who want a fast, keyboard-driven training environment without subscriptions or cloud dependencies.

## Features

### Explore
Browse preflop ranges and push/fold charts across positions, stack depths, and action contexts (RFI, vs Raise, vs 3-Bet). 13x13 hand matrix with GTO Wizard-style action coloring — green for raise, blue for call, yellow for mixed, dark for fold.

### Drill
Timed training sessions for three formats:
- **Preflop** — RFI, facing raise, and facing 3-bet decisions across 6-max positions
- **Postflop** — Check/bet sizing decisions based on board texture, hand strength, and SPR
- **MTT Push/Fold** — Short-stack tournament shove-or-fold with Nash equilibrium ranges

Each drill shows the GTO-correct action, frequency bars, EV loss (in bb), and (optionally) an AI-powered explanation. "View Range" lets you jump to the full range matrix for any spot after each decision.

### Play
Full hand playthrough from preflop through river. A progressive board display reveals cards street-by-street. Every decision point shows your verdict, the GTO suggestion, and a link to view the range. 6-max table visualization shows your seat.

### Plans
Structured training plans with daily sessions. Pick a template (MTT Fundamentals, Cash Grinder, Tournament Prep, Leak Plugger) or build your own.

### Learn
AI-powered strategy library with 25 topics across 8 categories:
- **Personalized recommendations** — Topics are scored against your weakness profile so the most relevant content surfaces first
- **AI article generation** — Click any topic to generate a detailed strategy article via Groq API (Llama 3.3 70B)
- **Cached locally** — Articles are generated once and stored in localStorage, minimizing API costs
- **Drill integration** — Each topic has attached drill configurations that launch directly into the Drill tab with pre-filled settings
- **Reading progress** — Track which articles you've read; already-read topics are deprioritized in recommendations

Categories: Preflop Fundamentals, Position Play, Bet Sizing, Board Texture, Range Construction, Tournament Strategy, Postflop Play, Mental Game.

### Stats & Player Profile
Session history, accuracy by position, EV loss tracking, and weakness analysis. The **Player Profile** computes:
- **Skill Rating** — Composite score (0-100) based on accuracy, volume, and EV efficiency. Levels: Novice, Beginner, Intermediate, Advanced, Expert
- **Strengths** — Your best-performing positions and spot types (75%+ accuracy, 15+ decisions)
- **Achievements** — Volume milestones (Century, Grinder, Veteran, Elite) and accuracy badges (Solid, Sharp, Crusher)
- **Recommended Reading** — Links to Learn tab topics matched to your weaknesses

### AI Coaching (Optional)
Connect a [Groq](https://console.groq.com) API key to get AI-powered explanations for any spot. Uses Llama 3.3 70B for fast, detailed GTO analysis. The app works fully without this — AI features are optional.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/poker-training.git
cd poker-training
open index.html
```

That's it. No `npm install`, no build step, no server. Works in any modern browser.

### AI Features (Optional)

1. Get a free API key at [console.groq.com](https://console.groq.com)
2. Click the gear icon in GTOTerminal
3. Paste your API key in the Groq API Key field
4. Click "Explain" on any drill result for AI analysis

## Keyboard Shortcuts

| Context | Key | Action |
|---------|-----|--------|
| Global | `1-6` | Switch tabs (Explore, Drill, Play, Plans, Learn, Stats) |
| Global | `?` | Open help |
| Global | `Esc` | Close modal |
| Preflop | `F` | Fold |
| Preflop | `C` | Call |
| Preflop | `R` | Raise |
| Postflop | `X` | Check |
| Postflop | `1` | Bet 1/3 pot |
| Postflop | `2` | Bet 2/3 pot |
| Postflop | `3` | Bet pot |
| MTT | `P` | Push |
| MTT | `F` | Fold |
| Result | `Space / N` | Next hand |
| Result | `E` | AI explain |

## Project Structure

```
poker_training/
├── index.html              # Single-page app shell (all views)
├── css/
│   ├── terminal.css        # Base theme — colors, typography, layout
│   ├── components.css      # UI components — cards, buttons, panels, verdict
│   ├── hand-matrix.css     # 13x13 range matrix with action-based coloring
│   ├── charts.css          # Analytics charts and progress bars
│   └── learn.css           # Learn view + player profile styles
├── js/
│   ├── app.js              # Main app controller — view setup, event wiring
│   ├── state.js            # Global state management (localStorage-backed)
│   ├── ai/
│   │   ├── groq-client.js  # Groq API integration
│   │   ├── insight-panel.js# AI explanation UI
│   │   └── prompt-builder.js# GTO coaching prompt construction
│   ├── analytics/
│   │   ├── aggregator.js   # Session stats aggregation
│   │   ├── dashboard.js    # Stats dashboard rendering
│   │   └── tracker.js      # Per-hand tracking
│   ├── content/
│   │   ├── content-engine.js  # Article generation, caching, recommendations
│   │   ├── learn-view.js      # Learn tab UI controller
│   │   ├── player-profile.js  # Skill rating computation, achievements
│   │   └── profile-view.js    # Stats profile renderer
│   ├── data/
│   │   ├── hand-constants.js   # Hand rankings, combos, position data
│   │   ├── preflop-ranges.js   # GTO preflop range tables
│   │   ├── postflop-strategy.js# SPR-aware postflop strategy (18 hand strengths)
│   │   ├── push-fold-charts.js # Nash push/fold charts
│   │   ├── board-categories.js # Board texture + hand strength classification
│   │   └── content-catalog.js  # 25 strategy topics with drill configs
│   ├── engine/
│   │   ├── deck.js            # Card deck operations
│   │   ├── drill-engine.js    # Session management, drill sequencing
│   │   ├── hand-evaluator.js  # 7-card evaluation + Monte Carlo equity
│   │   ├── hand-playthrough.js# Full hand playthrough engine
│   │   ├── preflop-drill.js   # Preflop scenario generation
│   │   ├── postflop-drill.js  # Postflop scenario generation
│   │   ├── scenario-generator.js# Shared scenario utilities
│   │   ├── scoring.js         # Pot-relative EV loss scoring (in bb)
│   │   └── tournament-drill.js# MTT push/fold scenarios
│   ├── training/
│   │   ├── plan-engine.js     # Training plan management
│   │   ├── plan-templates.js  # Built-in plan templates
│   │   └── weakness-analyzer.js# Leak detection from session data
│   ├── ui/
│   │   ├── board-display.js   # Card rendering (CSS-only playing cards)
│   │   ├── charts.js          # Chart rendering for analytics
│   │   ├── hand-matrix.js     # 13x13 matrix update logic
│   │   ├── hud.js             # Status bar, table display, stat updates
│   │   ├── modal.js           # Modal dialogs
│   │   ├── nav.js             # Tab navigation
│   │   ├── panels.js          # Panel resize/collapse
│   │   └── toast.js           # Toast notifications
│   └── utils/
│       ├── helpers.js         # Formatting, random, UID utilities
│       ├── keyboard.js        # Keyboard shortcut system
│       └── storage.js         # localStorage wrapper
├── .env.example            # Environment config template
├── .gitignore
├── LICENSE                 # MIT
└── README.md
```

## Architecture

**Zero dependencies.** The entire app is vanilla HTML, CSS, and JavaScript. No frameworks, no bundlers, no transpilers.

- **Global namespace:** `window.GTO` with sub-namespaces (`GTO.Engine`, `GTO.UI`, `GTO.Data`, `GTO.AI`, `GTO.Content`, etc.)
- **State:** `GTO.State` wraps `localStorage` for persistence (settings, session history, training plans, article cache)
- **Keyboard:** Context-based shortcut system — each view/mode registers its own key bindings
- **Styling:** CSS custom properties for theming, BEM-ish class naming, monospace typography throughout
- **Range data:** Preflop ranges are lookup tables keyed by `format > stack > actionContext > position > hand`
- **Scoring:** Pot-relative EV loss in bb units. Formula: `evLoss = -(potSize * freqGap * scaleFactor)` where scaleFactor ranges 0.15–0.85

## Engine

The engine has been built for accuracy and depth:

### Hand Evaluation
- **7-card evaluator** — Evaluates all C(7,5) = 21 five-card combinations to find the best hand
- **Full hand ranking** — Straight flush, four of a kind, full house, flush, straight, three of a kind, two pair, one pair, high card with proper tiebreakers
- **Monte Carlo equity** — 300-500 trial equity estimator with Fisher-Yates shuffle, deals random opponent hands and compares showdown ranks
- **18 hand strength categories** — air, overcards, weak_draw, gutshot, combo_draw, oesd_or_fd, underpair, weak_pair, second_pair, top_pair_weak, top_pair_strong, overpair, two_pair, trips, set, straight, flush, full_house

### Board Texture Classification
- **Proper straight detection** — Sliding window algorithm with correct gap handling (not counting any 5 consecutive ranks)
- **Draw detection** — Distinguishes OESD vs gutshot vs combo draws, requires hole card participation
- **Flush analysis** — Detects flush completion and draws with hole card participation requirement
- **Texture categories** — Dry rainbow, dry twotone, wet twotone, wet monotone, highly connected, paired boards

### Postflop Strategy
- **SPR-aware** — Strategy adjustments for low SPR (<3), medium (3-8), and high (>8) stack-to-pot ratios
- **12 spot types** — IP/OOP variants for c-bet, facing c-bet, turn barrel, facing turn barrel, river bet, facing river bet
- **18 hand strength tiers** — Full frequency tables for all spot type × hand strength combinations
- **SPR modifiers** — Separate bet and facing-bet adjustment tables for low/high SPR scenarios

### Scoring
- **Pot-relative EV loss** — All EV loss reported in bb units, not dimensionless numbers
- **Context-aware** — Preflop uses 2.5bb pot default, postflop uses actual pot size, tournament scales by stack depth
- **Frequency gap analysis** — Measures how far your action deviates from GTO mixed frequencies

## Range Data

Preflop ranges cover:
- **Formats:** Cash (6-max), MTT
- **Stacks:** 20bb, 40bb, 100bb
- **Actions:** RFI, vs Raise, vs 3-Bet
- **Positions:** UTG, MP, CO, BTN, SB, BB

Push/fold charts cover 5-20bb for all 6-max positions using Nash equilibrium ranges.

Postflop uses SPR-aware heuristic strategy tables across 12 spot types, 18 hand strength categories, and multiple board texture classifications.

## Contributing

Contributions welcome. Some areas that could use work:

- **More accurate range data** — current ranges are approximations. Solver-verified ranges would be a big upgrade.
- **Postflop solver integration** — replace heuristics with actual solver outputs
- **Hand history import** — parse hand histories from PokerStars, GGPoker, etc.
- **Multiplayer** — compare decisions with friends in real-time
- **Mobile layout** — currently desktop-optimized
- **Themes** — additional terminal color schemes

## License

MIT. See [LICENSE](LICENSE).
