# Blind Spot — Four Regions (0.6)

Play: https://dumb-tony.github.io/blind-spot/
Source: https://github.com/Dumb-Tony/blind-spot

Open `dist/blind-spot-standalone.html` to play offline. All artwork, physics, styles, and sound are embedded. The current game continues the recovered Region 1 source and preserves its eight layouts, scoring targets, artwork, and saves.

## Campaign
| Region | Rebel | Tool | New mechanic | Levels |
|---|---|---|---|---:|
| Starter City | Mara | Street Stone | Breakable structures | 8 |
| Color Quarter | Inez | Paint Can | Splash coats armored lenses | 8 |
| Signal Heights | Dex | EMP Puck | Pulses disable matching circuits | 8 |
| Iron Docks | June | Pull Hook | Pulling and suspended beams | 8 |

Choose a region from the level-select dropdown. All 32 levels are open. Existing eight-level saves automatically expand to 32 without losing stars.

## Controls
Drag the glowing tool left and down, then release. The brighter fading guide shows up to 0.8 seconds / 340 pixels of flight; landing and contact remain hidden. Fine aim uses sliders. Arrows aim; Space throws; Escape cancels or pauses; R restarts; M mutes. Tools activate automatically on their first impact: no secondary button.

Paint affects nearby lenses in a 145-pixel radius. EMP affects nearby cameras in a 180-pixel radius and all cameras sharing their circuit letter/color. Hooks grip a movable body and pull left for 1.1 seconds; strained suspension cables can tear. Fixed steel cannot be pulled. Ordinary impacts and falling mounts still count.

## Source and checks
- `dist/game-data.js`: 32 level layouts, region/rebel/tool definitions and scoring.
- `dist/physics.js`: Matter.js simulation, abilities, cables, fracture and guide.
- `dist/renderer.js`, `dist/game.js`: visuals, input, menus, sound, saves.
- `dist/assets/`: original artwork plus three new rebel portraits.
- `docs/GDD.md`, `docs/TEST_REPORT.md`, `docs/CHANGELOG.md`: design and validation.
- `tests/solutions.json`: reproducible solutions (spoilers).

Run `node scripts/build-standalone.mjs` to rebuild offline HTML; `node tests/production.test.cjs` runs 408 production assertions with no installation. `node scripts/serve.cjs` starts the local preview. GitHub Pages tests and publishes `dist/` on pushes to `main`.

The `region1-cloud-baseline` tag preserves the recovered original. Old local ZIPs remain historical snapshots; use the latest versioned bundle. The original Sites publication retains its existing access; GitHub Pages is the public sharing link.
