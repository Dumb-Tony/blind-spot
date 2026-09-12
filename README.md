# Blind Spot — Region 1, version 0.5

Continue the recovered cloud game locally. The eight layouts, illustrated city and Mara, controls, menus, progress, and Matter.js engine are preserved.

## Play
Open `dist/blind-spot-standalone.html` directly in your browser. It embeds the artwork, physics, styles, and synthesized sound and works offline. Fullscreen is optional.

Grab the glowing stone, pull left and down, and release. Fading dots reveal only the start of your shot. Judge the landing yourself; disable every red camera.

Fine aim provides angle/power sliders. Arrows adjust aim; Space throws; Escape cancels or pauses; R restarts; M mutes. All eight levels are open. Best stars save locally when storage is available.

## This update
- Opening guide: at most 0.4 seconds / 180 pixels, fading completely away. No predicted impact marker or contact label.
- Impacts account for the other body's mass and the velocity at a rotating body's contact point.
- Fragments retain the parent's mass, linear momentum, and spin, so broken beams still carry weight and interact with structures.
- Breaking a support wakes nearby resting bodies so loads can fall naturally.
- Debris participates in settling. A 0.85-second quiet window and 14-second upper limit let chain reactions resolve without hanging.

## Files and commands
- `dist/`: readable game source and playable standalone HTML.
- `dist/game-data.js`: eight levels, materials, tool, scoring.
- `dist/physics.js`: production simulation and opening guide.
- `dist/renderer.js`, `dist/game.js`: drawing, inputs, audio, menus, progress.
- `docs/GDD.md`, `docs/TEST_REPORT.md`, `docs/CHANGELOG.md`: design and validation.
- `tests/solutions.json`: reproducible physics solutions (spoilers).
- `node scripts/build-standalone.mjs`: rebuild the offline HTML.
- `node tests/production.test.cjs`: run production regression checks; no installation required.
- `node scripts/serve.cjs`: local preview at http://127.0.0.1:4175.

GitHub repository: https://github.com/Dumb-Tony/blind-spot

The recovered version is retained in Git history and the `region1-cloud-baseline` tag. The original source ZIP is retained locally. Updated source bundles should be generated from the current commit, not the original ZIP.

## Online play and publishing
Play the current build: https://dumb-tony.github.io/blind-spot/

The public GitHub repository includes the original cloud history. GitHub Pages publishes `dist/` only after the production checks pass. Future pushes to `main` rebuild, test, and publish automatically. The original cloud-hosted site is a separate older publication; GitHub Pages is the current release link.
