# Blind Spot — Region 1 overhaul

Open `dist/blind-spot-standalone.html` in a desktop browser. All artwork, physics, styles and sound work offline. Fullscreen is optional.

Grab the glowing stone, pull left and slightly down, and release. Dots show flight; the ring marks the first predicted collision. Disable every red camera. Mara stays beside the launcher.

Fine aim offers angle/power sliders. Arrow keys adjust aim; Space throws. Escape cancels aiming or pauses; R restarts; M mutes. Hints, reduced motion and level selection are built in. All eight levels are open. Best stars save locally when browser storage is available.

## Source
- `dist/game-data.js`: levels, materials, tool, rebel, region and scoring.
- `dist/physics.js`: Matter.js simulation, impacts, structural damage, settling and prediction.
- `dist/renderer.js`: canvas world, character, feedback and thumbnails.
- `dist/game.js`: input, menus, fixed-step clock, audio and persistence.
- `dist/styles.css`, `dist/index.html`: responsive interface.
- `dist/vendor/`: bundled Matter.js and license.
- `docs/GDD.md`, `docs/TEST_REPORT.md`: design and validation.

Run `node tests/production.test.cjs` from this directory; no package installation needed. Run `node scripts/build-standalone.mjs` after source edits. Optional development server: `npm install`, then `npm run dev`.

`tests/solutions.json` records real physical solutions. The old prototype tests that duplicated gameplay logic have been retired.
