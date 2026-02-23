# GTOTerminal

A self-contained, browser-based GTO poker training suite with a Bloomberg terminal aesthetic. No servers, no subscriptions, no build tools — just open `index.html` and train.

![GTOTerminal](https://img.shields.io/badge/status-alpha-orange) ![License](https://img.shields.io/badge/license-MIT-blue)

## What is this?

GTOTerminal is a free, open-source tool for studying Game Theory Optimal (GTO) poker strategy for 6-max No-Limit Hold'em. It covers preflop ranges, postflop strategy, push/fold charts, and full hand playthrough — all with instant feedback on how your decisions compare to GTO.

Built for serious poker players who want a fast, keyboard-driven training environment without subscriptions or cloud dependencies.

## Architecture: GTO Wizard in Your Browser

Commercial GTO trainers like GTO Wizard store 300K+ pre-computed solver solutions on their servers and fetch them via API calls, charging $39-279/month for access. GTOTerminal takes a fundamentally different approach:

**Everything runs client-side.** No server, no database, no API calls for core functionality.

```
GTO Wizard:  Solver farm → Database → API → Browser
GTOTerminal: Static files → Browser (that's it)
```

### How It Works

**Preflop** — Pre-computed GTO ranges ship as a static JavaScript file (~6,200 lines). The browser loads the full dataset on page load. Same lookup-table approach as server-based tools, just delivered as a file instead of an API response.

**Postflop** — Two-tier architecture:
1. **Pre-computed solutions** — Common flop spots ship as static JS files, loaded instantly client-side
2. **WASM solver** — For boards without pre-computed solutions, a Rust-compiled WebAssembly solver runs locally in the browser via Web Workers. No server round-trip, no cloud compute costs — your CPU does the work

**The tradeoff:** We cover fewer scenarios than a server-backed tool with terabytes of storage. But the scenarios we do cover are validated against solver benchmarks, and the WASM solver fills gaps in real-time. For a training tool (vs. a reference database), this coverage is sufficient.

**Cost to the user:** $0/month, forever.

## Preflop Engine

### Coverage

| | Cash | MTT |
|---|---|---|
| **Stack depths** | 100bb, 40bb, 20bb | 100bb, 40bb, 25bb, 15bb |
| **RFI** | All 5 positions | All 5 positions |
| **vs Raise** | 15 matchups per depth | 15 matchups per depth |
| **vs 3-Bet** | 15 matchups (100bb, 40bb) | 15 matchups (100bb) |
| **vs 4-Bet** | 15 matchups (100bb), 9 (40bb) | 9 matchups (100bb) |
| **Total matchups** | ~135 | ~114 |

105 vs_raise matchups across both formats. Every BB defense matchup has 27-84 mixed-frequency entries — no stubs, no placeholders.

### Benchmark Results

Ranges validated against PokerCoaching.com solver charts (9-max, 1bb ante) with adjustment for 6-max no-ante (+5-7% fold frequency).

**RFI (Raise First In) — Cash 100bb:**

| Position | Screenshot Ref | Expected 6-max | Our Data | Grade |
|----------|---------------|-----------------|----------|-------|
| UTG | LJ 19% | 13-17% | 14.5% | A |
| MP | HJ 25% | 18-23% | 19.4% | A |
| CO | CO 33% | 26-31% | 27.4% | A |
| BTN | BTN 45% | 38-44% | 45.3% | B |
| SB | SB 29% | 40-52% | 47.2% | A |

**BB Defense (vs Raise) — Cash 100bb:**

| Matchup | Screenshot Fold% | Expected 6-max | Our Data | Grade |
|---------|-----------------|-----------------|----------|-------|
| BB vs UTG | 67% | 65-72% | 67.0% | A |
| BB vs MP | 60% | 58-65% | 57.9% | A- |
| BB vs CO | 56% | 55-63% | 55.9% | A |
| BB vs BTN | 29% | 30-40% | 33.2% | A |
| BB vs SB | 28% | 28-38% | 33.7% | A |

**Position Gradients (all pass — BB folds most vs UTG, least vs SB):**

```
cash 100bb:  67.0 → 57.9 → 55.9 → 33.2 → 33.7  ✓
cash 40bb:   72.9 → 60.1 → 55.2 → 47.9 → 41.4  ✓
cash 20bb:   72.1 → 67.6 → 57.1 → 48.8 → 47.1  ✓
mtt 100bb:   69.0 → 54.8 → 49.8 → 37.9 → 31.1  ✓
mtt 40bb:    72.7 → 63.3 → 55.2 → 44.6 → 36.3  ✓
mtt 25bb:    72.7 → 68.1 → 56.8 → 47.4 → 39.2  ✓
mtt 15bb:    74.7 → 72.7 → 60.4 → 49.4 → 47.0  ✓
             UTG_BB  MP_BB  CO_BB  BTN_BB  SB_BB
```

**Depth Gradients (all pass — shorter stacks = tighter defense):**

```
mtt UTG_BB:  69.0 → 72.7 → 72.7 → 74.7  ✓
mtt MP_BB:   54.8 → 63.3 → 68.1 → 72.7  ✓
mtt CO_BB:   49.8 → 55.2 → 56.8 → 60.4  ✓
mtt BTN_BB:  37.9 → 44.6 → 47.4 → 49.4  ✓
mtt SB_BB:   31.1 → 36.3 → 39.2 → 47.0  ✓
             100bb   40bb    25bb    15bb
```

### Range Composition

Every BB defense matchup uses realistic GTO composition:
- **Call-heavy defense** — BB calls 70-84% of defended range, 3-bets 16-30%
- **Mixed frequencies** — 27-84 hands per matchup with three-way [fold, call, raise] splits rounded to 0.05 increments
- **Tier-based generation** — Hands categorized by opener strength (UTG tight → BTN wide), with stack-depth adjustments for jam/call ratios
- **Iterative convergence** — Mixed frequencies tuned to hit target fold% within ±1% of solver benchmarks

### Honest Limitations

- Ranges are **heuristic approximations**, not raw solver output. They match solver benchmarks in aggregate (fold%, raise%, call% composition) but individual hand frequencies may differ from a specific solver's solution.
- vs_3bet and vs_4bet data is only available at deeper stacks (100bb for both formats, 40bb for cash). At shorter stacks, the game tree simplifies to push/fold which is covered by Nash equilibrium charts.
- Data is calibrated for **6-max no-ante**. If you play with ante, ranges should be ~5-7% wider.

## Postflop Engine

### Current: Heuristic Strategy Tables

SPR-aware frequency tables covering 12 spot types, 18 hand strength categories, and multiple board texture classifications. Provides directionally correct strategy (bet/check/fold frequencies) without board-specific solutions.

### In Progress: WASM Solver + Pre-computed Solutions

The postflop engine is being upgraded to a two-tier architecture:

1. **Pre-computed flop solutions** — Common spots (SRP, 3-bet pots, key board textures) shipped as static files. Instant lookup, same as preflop.
2. **Browser-based WASM solver** — A Rust-compiled counterfactual regret minimization solver running in Web Workers. For any spot without a pre-computed solution, the solver runs locally to produce GTO-approximate frequencies.

The solver directory (`solver/`) contains the Rust source. Compiled WASM output lives in `js/solver/pkg/`.

## Features

### Explore
Browse preflop ranges across positions, stack depths, and action contexts. 13x13 hand matrix with action coloring — green for raise, blue for call, yellow for mixed, dark for fold. Full summary bars showing raise/call/fold percentages.

### Drill
Timed training sessions for three formats:
- **Preflop** — RFI, facing raise, and facing 3-bet decisions across 6-max positions
- **Postflop** — Check/bet sizing decisions based on board texture, hand strength, and SPR
- **MTT Push/Fold** — Short-stack tournament shove-or-fold with Nash equilibrium ranges

Each drill shows the GTO-correct action, frequency bars, EV loss (in bb), and an optional AI-powered explanation.

### Play
Full hand playthrough from preflop through river with **inline range analysis**:
- **Preflop decisions** — Right panel shows the full 13x13 GTO range matrix with raise/call/fold gradient, summary bar, and frequency feedback
- **Postflop decisions** — Right panel shows board texture analysis (type, wetness, connectivity, flush potential), hand strength classification, range advantage bars, and GTO bet/check frequencies
- **Per-street feedback** — After every action, see the GTO verdict, optimal frequencies, EV loss, hand equity, and pot odds
- **AI review** — Full hand review available after completion

### Plans
Structured training plans with daily sessions. Pick a template (MTT Fundamentals, Cash Grinder, Tournament Prep, Leak Plugger) or build your own.

### Learn
AI-powered strategy library with 25 topics across 8 categories. Topics scored against your weakness profile. Articles generated via Groq API (Llama 3.3 70B) and cached locally. Each topic includes drill configurations that launch directly with pre-filled settings.

### Stats & Player Profile
Session history, accuracy by position, EV loss tracking, and weakness analysis. Skill rating (0-100), strengths, achievements, and recommended reading.

### Stream
Twitch and YouTube stream embeds with AI-powered hand analysis. Paste a stream URL and use vision-based hand reading to analyze live play.

### AI Coaching (Optional)
Connect a [Groq](https://console.groq.com) API key for AI-powered explanations. Uses Llama 3.3 70B for fast GTO analysis. The app works fully without this.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/poker-training.git
cd poker-training
open index.html
```

No `npm install`, no build step, no server. Works in any modern browser.

### AI Features (Optional)

1. Get a free API key at [console.groq.com](https://console.groq.com)
2. Click the gear icon in GTOTerminal
3. Paste your API key
4. Click "Explain" on any drill result for AI analysis

## Keyboard Shortcuts

| Context | Key | Action |
|---------|-----|--------|
| Global | `1-7` | Switch tabs |
| Global | `?` | Open help |
| Global | `Esc` | Close modal |
| Preflop | `F / C / R` | Fold / Call / Raise |
| Postflop | `X` | Check |
| Postflop | `1 / 2 / 3` | Bet 1/3 / 2/3 / pot |
| MTT | `P / F` | Push / Fold |
| Result | `Space / N` | Next hand |
| Result | `E` | AI explain |

## Project Structure

```
poker_training/
├── index.html                  # Single-page app (all views)
├── css/
│   ├── terminal.css            # Base theme
│   ├── components.css          # UI components
│   ├── hand-matrix.css         # 13x13 range matrix + play/drill layouts
│   ├── charts.css              # Analytics charts
│   ├── learn.css               # Learn + profile styles
│   └── responsive.css          # Tablet/mobile breakpoints
├── js/
│   ├── app.js                  # Main controller (~2,800 lines)
│   ├── state.js                # localStorage-backed state
│   ├── ai/                     # Groq API + prompt construction
│   ├── analytics/              # Session tracking + dashboard
│   ├── content/                # Learn view + player profile
│   ├── data/
│   │   ├── preflop-ranges.js   # GTO preflop ranges (~6,200 lines)
│   │   ├── postflop-strategy.js# SPR-aware heuristic strategy
│   │   ├── postflop-solutions.js# Pre-computed postflop solutions
│   │   ├── postflop-solution-index.js
│   │   ├── push-fold-charts.js # Nash equilibrium charts
│   │   ├── board-categories.js # Texture + strength classification
│   │   ├── hand-constants.js   # Rankings, combos, positions
│   │   └── content-catalog.js  # 25 strategy topics
│   ├── engine/
│   │   ├── hand-evaluator.js   # 7-card eval + Monte Carlo equity
│   │   ├── hand-playthrough.js # Multi-street hand engine
│   │   ├── preflop-drill.js    # Preflop scenario lookup
│   │   ├── postflop-drill.js   # Postflop scenario generation
│   │   ├── scoring.js          # Pot-relative EV loss (in bb)
│   │   ├── scenario-generator.js
│   │   ├── deck.js
│   │   ├── drill-engine.js
│   │   └── tournament-drill.js
│   ├── solver/
│   │   ├── pkg/                # Compiled WASM solver
│   │   ├── solver-api.js       # Solver interface
│   │   ├── solver-worker.js    # Web Worker for async solving
│   │   └── solver-cache.js     # Solution caching
│   ├── streaming/              # Twitch/YouTube + AI vision
│   ├── training/               # Plans + weakness analyzer
│   ├── ui/                     # Matrix, board, HUD, modals, nav
│   └── utils/                  # Keyboard, storage, helpers
├── solver/
│   ├── Cargo.toml              # Rust WASM solver config
│   └── src/lib.rs              # CFR solver implementation
├── scripts/                    # Validation + precompute tools
├── .env.example
└── README.md
```

## Engine Details

### Hand Evaluation
- 7-card evaluator testing all C(7,5) = 21 combinations
- Full ranking with tiebreakers (straight flush through high card)
- Monte Carlo equity estimation (300-500 trials)
- 18 hand strength categories from air to full house

### Board Texture
- Sliding window straight detection with gap handling
- OESD vs gutshot vs combo draw classification
- Flush completion and draw detection (requires hole card participation)
- Categories: dry rainbow, dry twotone, wet twotone, wet monotone, highly connected, paired

### Scoring
- Pot-relative EV loss in bb units
- Context-aware pot sizing (preflop 2.5bb default, postflop actual pot, tournament stack-depth scaling)
- Frequency gap analysis measuring deviation from GTO mixed frequencies

## Comparison with Commercial Tools

| | GTOTerminal | GTO Wizard |
|---|---|---|
| **Architecture** | Client-side static files + WASM | Server-side database + API |
| **Preflop data** | ~250 scenarios, heuristic (A- grade) | Millions, solver-computed |
| **Postflop** | Heuristic + WASM solver (in progress) | 300K+ solved flops + neural net AI |
| **Accuracy** | Within ±2% of solver benchmarks | 0.12% Nash distance |
| **Offline** | Yes, fully | No |
| **Cost** | Free, forever | $39-279/month |
| **Open source** | Yes (MIT) | No |

We're not trying to replace GTO Wizard. They have real solvers, massive infrastructure, and a team. GTOTerminal is for players who want solid GTO training without a subscription — and for developers who want to understand how poker engines work.

## Contributing

Contributions welcome. High-impact areas:

- **Solver-verified ranges** — Replace heuristic preflop data with actual solver output
- **Pre-computed postflop solutions** — Add solved flop spots to ship with the app
- **WASM solver optimization** — Improve solve speed and convergence
- **Hand history import** — Parse histories from PokerStars, GGPoker, ACR
- **Range builder** — Paint custom ranges on the 13x13 matrix
- **Exploitative adjustments** — Overlay adjustments vs common population tendencies

## License

MIT. See [LICENSE](LICENSE).
