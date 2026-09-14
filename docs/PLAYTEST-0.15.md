# Early-game balance — 0.15

This pass continues the local build in `C:\GPT_DEV\Blind Spot`. Existing level IDs and saved best stars are preserved.

## Changes

Starter City levels 1–8 now teach broad target zones. Wide decks, breakable legs and grouped cameras allow low support shots, higher deck shots, direct hits, and cleanup play. The previous tall wall on level 6 is lower, and its cameras share one breakable platform. The finale uses two readable tower groups rather than isolated low cameras.

Three-star allowances are 2 throws for levels 1–3, 3 for levels 4–7, and 4 for level 8. Every opening level gets three additional recovery throws before failure. Levels 9–20 gain one cleanup throw in their three-star target where it was below three, plus three throws beyond par.

The first two paint and EMP levels have additional glass impact surfaces near their targets. These give players another place to activate the tool without changing its radius. The first four levels in every district have one extra recovery throw; mixed-tool levels also gain one of each available tool.

## Playtesting

- Scanned 68 starting aim points on each Starter City installation.
- Found three separated winning route families per level.
- Tested each route with nine pointer variations: exact aim, ±4 pixels horizontally or vertically, and four diagonal combinations. Every route passed at least 7/9; most passed 9/9.
- Replayed every route after a deliberately weak missed throw. All 24 route families recovered and still won.
- Repeated the audit through the production pointer handlers in a browser: all eight levels passed the same thresholds and miss-recovery check.
- Checked the first two paint and EMP installations: each has three robust route families; every family passed at least 7/9 aim variations and recovered from a miss.
- Replayed all 120 campaign levels through the browser with isolated progress; all passed with three stars and finite, awake physics.
- Full production suite passes, including 360 stress throws and the fracture, collapse, contraption, input, rendering and character fixtures.

Run `node tests/balance-audit.cjs --scan` for the opening scan. Serve locally and open `/qa-balance.html` for real-pointer testing or `/qa-physics.html` for the complete campaign replay.
