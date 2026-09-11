# Blind Spot — Region 1 Test Report

## Passed

- Startup regression with browser storage forcibly denied: initialization continues, PLAY attaches, and level select opens.
- Sling-state regression: the parked stone restores finite mass/inertia, receives launch velocity, and moves after release.
- JavaScript syntax checks for the level registry and game runtime.
- Standalone build generation with all CSS, game code, level data, audio logic, and Matter.js embedded.
- Offline-integrity check: the standalone file contains no external script or stylesheet references.
- Data validation for eight levels, known materials, starter rebel/tool registration, ordered star thresholds, and finale placement.
- Deterministic Matter.js simulation of all eight installations. Each level disabled every required camera within its configured shot allowance:
  - Say Cheese: 1/3 shots
  - Weak at the Knees: 1/3 shots
  - Double Exposure: 1/4 shots
  - Glass Policy: 1/4 shots
  - Leaning Argument: 1/3 shots
  - Paperwork Cascade: 2/4 shots
  - Privacy Wall: 1/4 shots
  - OmniPeek Relay: 2/5 shots
- Logic checks for 1-, 2-, and 3-star results at every level’s thresholds.
- Source and packaged build hashes generated after the final build.

## Browser test limitation

An automated real-browser smoke test was written to cover title → level select → drag/release → win overlay. The available Playwright runtime did not include a browser binary, and downloading that binary was blocked by the execution environment. The browser smoke script remains in `tests/browser-smoke.mjs` for a later run. Physics and game-data behavior were validated headlessly against the exact bundled Matter.js version instead.

## Fixed after first publication

- The initial build accessed `localStorage` before wiring the menu. Browsers that deny storage access threw during startup and left the title screen inert. All persistence access is now optional and failure-safe, and the denied-storage case has a dedicated regression test.
- The initial build created the loaded stone as permanently static. Matter.js therefore had no finite dynamic mass to restore when released: the shot counter advanced while the body became invalid and appeared not to launch. Stones are now created dynamically, parked after their physical properties exist, and restored correctly on release.

## Honest slice limitations

- Physics puzzles can admit emergent solutions beyond the scripted validation shots; that is intentional.
- Progress and mute state are local to one browser/device.
- Synthesized effects begin only after user interaction because browsers block autoplay audio.
- Touch input is supported, but the level compositions are tuned for a landscape desktop-sized playfield.
