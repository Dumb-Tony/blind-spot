# Material surface pass — 0.13

Local source: `C:\GPT_DEV\Blind Spot`. The existing game is extended, not rebuilt.

## Scope

- Four painted bitmap materials with distinct grain, aggregate, brushed metal and enamel wear.
- Translucent glass with reflections and branching damage.
- Wood end cuts and nails, concrete spalls, steel plate edges and bolts, cell vents and exposed terminals.
- Body-local texture mapping for intact blocks and rubble; paint remains above every surface.
- Identical campaign geometry, physics, tools, scoring and saved progress.

## Validation

- Production regression: 1,929 assertions, mechanics fixtures and 360 final-shot stress runs; no unresolved attempts.
- Renderer regression uses the loaded-atlas drawing path, checks all four source quadrants, transparent glass, upright wood grain, unchanged texture coordinates after translation/rotation, and paint on debris.
- Browser review page `/qa-materials.html`: actual renderer at gameplay scale, horizontal and vertical blocks, damaged blocks, rubble, paint, and rotation. All five surfaces visually checked against a striped backdrop to verify glass transparency.
- Browser campaign replay: all 120 production input routes, isolated progress and accelerated clock. This is automated input replay, not 120 manual feel tests.
- Real-time browser throw and aftermath review supplement the automation. Offline HTML includes the new material bitmap.

Run `node scripts/build-standalone.mjs` then `node tests/production.test.cjs`. Use `node scripts/serve.cjs` and open `/qa-materials.html` or `/qa-physics.html` for the local-only review tools.
