# Blind Spot — Six Regions (0.8)

Play: https://dumb-tony.github.io/blind-spot/
Source: https://github.com/Dumb-Tony/blind-spot

Open `dist/blind-spot-standalone.html` to play offline. Artwork, physics, styles and sound are embedded. This expands the existing local game; the original Region 1 layouts, scoring, art and saved stars remain intact.

## Campaign

| Region | Available tools | Levels |
|---|---|---:|
| Starter City | Street Stone | 20 |
| Color Quarter | Paint Can | 20 |
| Signal Heights | EMP Puck | 20 |
| Iron Docks | Pull Hook | 20 |
| Junction Yard | Stone + Paint | 20 |
| Central Works | All four tools | 20 |

120 installations, 360 possible stars. The original eight levels remain at the beginning of each existing region. New stages broaden the playfield occupation, add taller frames and suspended loads, then combine separated targets, heavy caps, fragile upper storeys and ground-level cleanup. The two new regions teach choosing tools before combining them in larger operations. Difficulty follows staged ramps; individual puzzles reward different strengths and alternate solutions.

Choose **LOAD TOOL** before throwing in mixed regions. Each tool has a limited supply, and every throw uses the shared level allowance. Paint or a close EMP pulse defeats bolted armored cameras; ordinary cameras can still fall with their supports. The active rebel and launcher change with your selection.

## Controls and abilities

Drag the glowing tool left and down, then release. The fading guide shows only the first 0.8 seconds / 340 pixels, with no impact marker. Fine aim provides sliders. Arrows aim; Space throws; Escape cancels or pauses; R restarts; M mutes. Tools activate on first impact.

- **Stone:** impact, support damage and momentum through breakable structures.
- **Paint:** a visible 145-pixel splash, droplets, drips and persistent surface coverage. Broken painted pieces keep their paint.
- **EMP:** a **95-pixel pulse**, reduced from 180. Each directly reached circuit node can disable its single nearest matching neighbor within **190 pixels**. That neighbor does not propagate further. Distant matching letters no longer grant map-wide shutdown. Pulse range is measured from contact to lens center; materials do not block the field.
- **Hook:** grips a movable body and pulls for 1.1 seconds. Off-center hits rotate beams; strained suspension cables tear. Fixed steel and bolted cameras cannot be pulled.

Three stars reward the tested shot target shown before aiming; two and one stars allow extra throws. Inspect the damage after winning to see the painted ruins. All regions remain open. Browser saves from the 8- and 32-level builds migrate to the same original installations.

## Source and validation

- `dist/game-data.js`: original layouts, deterministic campaign compositions, supplies and calibrated star targets.
- `dist/physics.js`: shared Matter.js simulation, inventory, abilities, constraints, fracture and aiming guide.
- `dist/renderer.js`, `dist/game.js`: visuals, input, sound, menus and save migration.
- `docs/GDD.md`, `docs/CAMPAIGN.md`, `docs/TEST_REPORT.md`, `docs/CHANGELOG.md`: design, level reference and validation.
- `tests/solutions.json`: reproducible winning launches for all 120 levels (spoilers).

Run `node scripts/build-standalone.mjs`, then `node tests/production.test.cjs`. No dependency installation is needed. `node scripts/serve.cjs` starts the local preview. `node tests/solve-overhaul.cjs --save` searches and records solutions; it is intentionally slower than the normal regression suite. GitHub Pages runs the build and regression suite before deployment on pushes to `main`.

The `region1-cloud-baseline` tag preserves the recovered cloud original. Earlier versioned ZIPs are historical snapshots. GitHub Pages is the public sharing link.
