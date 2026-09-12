# Test report — 0.11

Validation: September 12, 2026.

**Over 1,900 assertions plus floating regressions pass** against the shipped production simulation, renderer and controller. All **120 levels** have replayable three-star solutions in `tests/solutions.json`; the original Region 1 layouts and star targets are unchanged. See [Physics repair and playtest](PHYSICS-0.11.md) for the current validation.

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

## Browser checks from earlier releases

The local multi-file build and final standalone HTML were opened in the browser. Checked the six-region menu, twenty-level lists, large final layout, tool dropdown, changing rebel/launcher, supply consumption, disabled switching during flight, persistent paint on collapsed structures and return to ready state. The final standalone displays version 0.8 and its calibrated star target.

Earlier browser checks covered representative paths. Version 0.11 additionally passes all 120 automated browser controller replays as documented in PHYSICS-0.11.md. Solver success proves a feasible route; perceived difficulty still benefits from player feedback. No cross-device human playtest study is claimed.

## Reproduce

```
node scripts/build-standalone.mjs
node tests/production.test.cjs
node scripts/serve.cjs
```

GitHub Pages repeats the build and regression suite before deployment.

The final standalone Central Works level was also completed through real browser controls: Stone then Paint, two throws, three stars and a five-camera chain.

## Visual overhaul checks (0.9)

All four rigs are rendered through the production canvas adapter at four extreme aiming positions. Hand coordinates match the actual pulled projectile, feet stay planted, and elbow coordinates remain finite. Release starts from the real contact point, follows through and recovers. Idle breathing is absent with reduced motion; reset clears the old release state. All 120 existing solution replays still pass. Browser inspection covers grounded character appearance, bracing and pull poses, launcher changes, the updated scene, menus and standalone build.

## Painted character checks (0.10)

All 120 existing solutions and the 0.9 pose/contact checks still pass. New tests cover finite painted source/destination rectangles for all four character columns, exclusion of exterior neutral texture background while retaining enclosed white highlights, preservation of dark linework, and offline embedding. The generated source and an assembled asset contact sheet (ready and pulling poses for all four rebels) were inspected. This turn did not repeat browser interaction testing; the browser checks above describe earlier versions. The 0.9 motion source is unchanged.
