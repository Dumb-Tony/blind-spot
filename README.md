# Blind Spot — Region 1

A standalone 2D physics-destruction puzzle prototype.

## Play

Open `dist/blind-spot-standalone.html` in a modern desktop browser. No server or internet connection is required. Drag the loaded stone backward from the sling, aim with the dotted guide, and release. Disable every red-lensed camera before the shots run out.

Keyboard shortcuts: `R` restart, `M` mute, `Esc` pause/menu.

## Project layout

- `dist/blind-spot-standalone.html` — one-file offline build
- `dist/index.html` — hosted build entry
- `dist/styles.css`, `dist/game-data.js`, `dist/game.js` — readable hosted source
- `dist/vendor/matter.min.js` — bundled Matter.js 0.20.0
- `docs/GDD.md` — concise design document
- `tests/logic.test.js` — automated progression/scoring/data checks

## Testing

Run `node tests/logic.test.js`. A modern browser is required for the full canvas/WebAudio experience.
