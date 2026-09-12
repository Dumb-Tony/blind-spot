# Test report — 0.8

Validation: September 12, 2026.

**1,994 assertions pass** against the shipped production simulation, renderer and controller. All **120 levels** have replayable three-star solutions in `tests/solutions.json`; the original Region 1 solutions still pass.

## Automated coverage

- Every level: valid launches, finite projectile physics, camera clearance, achievable three-star target, scoring boundaries, exactly-once win and no free pre-shot destruction.
- All 120 initial layouts: camera displacement after seating stays below 25 pixels. Overlapping counterweights found during development were moved before final validation.
- EMP: a 100-pixel miss does nothing; a 90-pixel hit activates; a remote matching circuit stays online; a nearby circuit jump stops after one hop; unrelated remote circuits remain unaffected.
- Tool selection: shared allowance plus individual supplies, no mid-flight switching, no charge for cancellation, unavailable-tool rejection, automatic fallback and failure when all supplies are empty.
- Bolted armor: remains fixed, cannot be pulled, and can be painted.
- Save migration: both original eight-level and later thirty-two-level saves retain stars and their last installation at the new positions. Corrupt and blocked storage are tolerated.
- Production controller: twenty cards per selected region, correct navigation, real pointer paths at three canvas sizes, selectable mixed tools, pause/resume, restart, cancellation and 30/60/200 Hz timing consistency.
- Physical regressions: fragment mass and linear momentum, inherited spin, heavy-load collapse, debris mass sensitivity and capped opening guide without predicted contact.
- Visual regressions: paint coats blocks and lenses, persists on fragments, has bounded storage and clears transient effects on restart; aftermath inspection preserves the result.
- Standalone: assets, engine, styles and code are embedded with no external script or stylesheet dependencies.

## Browser checks

The local multi-file build and final standalone HTML were opened in the browser. Checked the six-region menu, twenty-level lists, large final layout, tool dropdown, changing rebel/launcher, supply consumption, disabled switching during flight, persistent paint on collapsed structures and return to ready state. The final standalone displays version 0.8 and its calibrated star target.

The 120 complete solution replays run in the shared production engine under Node. Browser checks cover representative paths, not 120 separate manual browser playthroughs. Solver success proves a feasible route; perceived difficulty still benefits from player feedback. No cross-device human playtest study is claimed.

## Reproduce

```
node scripts/build-standalone.mjs
node tests/production.test.cjs
node scripts/serve.cjs
```

GitHub Pages repeats the build and regression suite before deployment.

The final standalone Central Works level was also completed through real browser controls: Stone then Paint, two throws, three stars and a five-camera chain.
