# Contraptions and connected motion — 0.12

Validated locally on September 13, 2026. Public build: https://dumb-tony.github.io/blind-spot/

## Delivered changes

- Continuous painted torsos, waists and overlapping joints; natural bracing elbows; smooth weight shifts and release recovery. Vertical pulls bring the body forward and lower it instead of stretching the arms from a backward lean. Original faces, outfits and menu portraits are reused.
- Hinged decks attached to visible gold hubs. Uneven loads make a removed brace matter; fragments remain physical and may temporarily prop up the deck.
- Orange power cells: hard impact or close EMP activation, a 0.18-second charge, a bounded 175-pixel burst, and one-time neighboring-cell chains. The EMP's existing range and circuit rules remain unchanged.
- Twenty-four redesigned puzzles: stages 9, 12, 16 and 20 in all six districts. Original 32 introductory layouts, saved identities and existing best stars are preserved.
- Charge/burst sounds, shock rings and ground-impact dust. Utility controls move off the active playfield and remain available while paused.
- Pointer coordinates are stabilized to a tenth of a world pixel to avoid fractional CSS sizing changing an apparently identical drag.

## Automated validation

The production suite exercises the shipped scripts and Matter engine: all 120 complete reference routes, three-star attainability, inventory, aiming, pause/resume, restart, save migration, paint, EMP, hooks, debris, initial stability and the earlier floating-object fixes.

New fixtures check finite local blasts, one-time chains, range gaps, fixed armor, hinge attachment, gravity-only tipping after brace removal, and stable starts for all 24 redesigns. Animation checks verify exact aiming contact, eased posture and frame-rate-independent smoothing. A fractional-canvas regression reproduces the input discrepancy found in browser testing.

An additional **360 varied final-shot runs** (three different pulls on each of 120 levels) finish without invalid positions, sleeping dynamic bodies or an unresolved final throw after 40 simulated seconds.

The 24 redesigned reference routes were checked with nine uniform aiming offsets each (center and ±1 world pixel). A local search improved the exact-route success count from **87/216 to 114/216**. Because some short chain routes remain sensitive, **13 puzzles allow an extra cleanup throw within the three-star target**. This is a sampled sensitivity check, not a guarantee across all independent shot errors.

## Browser and visual checks

All **120 levels** pass accelerated browser replays through the actual pointer handlers, menus and tool controls. The harness uses isolated progress, checks finite awake bodies, renders every result, and advances the aftermath for another three seconds. It suppresses intermediate drawing for speed.

Real-time checks supplement those replays: the hinged deck and partial debris support, a completed power-cell collapse, an EMP route with a separate distant-target cleanup, and the standalone HTML. The four painted rebels were inspected together during pull/release/recovery and at large legal pulls. Utility controls no longer cover low targets during play.

Automated input replays are distinct from manual feel testing. These checks cover the campaign and specific failure cases; they do not establish perfect behavior for every possible launch, device or browser.

## Reproduce

Build with `node scripts/build-standalone.mjs`, then run `node tests/production.test.cjs` (includes stress fixtures). Start `node scripts/serve.cjs`; the preview defaults to port 4186 and supports `BLIND_SPOT_PORT`.

- `/qa-physics.html`: complete campaign browser replays.
- `/qa-characters.html`: four-character motion review.
- `tests/aim-tolerance.cjs`: sampled one-pixel route sensitivity.
- `tests/robust-routes.cjs`: optional local reference-route refinement.

QA pages are served from `tests/` by the local server and are not included in the public game directory.
