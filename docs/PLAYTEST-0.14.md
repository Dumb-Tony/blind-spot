# Material fracture — 0.14

Extended the existing local build in `C:\GPT_DEV\Blind Spot`.

## Behavior

Glass breaks into 4–20 convex triangular collision shards, scaled to panel size. Wood splits into four uneven, elongated pieces. Concrete accumulates damage and crumbles into five angular pieces; its impact threshold and 90 HP keep it tougher than glass or wood. Large wood/concrete fragments can break once more. Steel stays fixed and unbreakable.

Each piece occupies its part of the parent's footprint, inherits its velocity at that point and shares the parent's mass proportionally by area. No artificial outward explosion is added. Further splitting clips against the existing polygon. Rendering uses that polygon for the silhouette and paint clipping. Broken hinge, cable and hook attachments are removed.

## Validation

- Production regression checks all 120 winning routes, scoring boundaries, input, material rendering, physics and character motion, plus dedicated fracture fixtures.
- 360 varied final-shot stress runs: finite physics, no unresolved attempts.
- Dedicated fracture fixtures check material-specific polygon shapes, convexity, mass, linear momentum, secondary breakup limits, settling, fixed steel, hinge cleanup and progressive concrete impact damage.
- Existing support-collapse and contraption fixtures pass.
- Browser fracture scene uses actual stones and collision handling. Verified glass shards, wood splinters and concrete changing from cracks after one hit to rubble after a follow-up. Visual inspection includes settled and moving fragments.
- All 120 final browser input replays pass with three stars, finite physics and no sleeping dynamic bodies. The accelerated replay uses isolated progress and is distinct from the real-time visual/impact tests.
- Polygon debris made some recorded chain reactions sensitive to runtime differences. Route candidates were checked in both the browser and Node simulation; existing star targets and shot allowances were retained.

Build: `node scripts/build-standalone.mjs`. Regression: `node tests/production.test.cjs`. Local browser checks: `node scripts/serve.cjs`, then `/qa-fracture.html` and `/qa-physics.html`.

The standalone HTML embeds all source and artwork. No new raster artwork is required for this physics pass.
