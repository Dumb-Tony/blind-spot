# Test report — 0.6

Validation: September 12, 2026.

**408 assertions pass** using the shipped production simulation, renderer and controller scripts. The controller suite uses a minimal DOM/canvas adapter; it is not a full browser.

- All 32 levels clear within three-star targets using recorded real launches; `tests/solutions.json` contains each sequence.
- The original eight Region 1 solutions still pass after the expansion.
- All scoring boundaries, finite body properties, no pre-shot free destruction, exactly-once win events, failure, cancel, pause/resume, restart and refresh-rate invariance pass.
- Old eight-level progress expands to 32 while preserving earned stars. Region picker and next-level navigation select the right level and tool.
- Pointer-controller solutions pass for the first level of each new region.
- Armor resists direct impact, paint coats armor, EMP crosses matching circuits but not unrelated remote circuits, and hooks create and release real constraints.
- Fracture mass/momentum, heavy support collapse, mass-sensitive debris impacts and guide limits remain covered.
- The guide is at most 0.8 seconds / 340 pixels, reaches visibly past the sling, and returns no impact information.
- The standalone build embeds both artwork atlases, engine, styles and game scripts without external script or stylesheet references.

Targeted browser inspection confirmed region selection, the Inez portrait, HUD tool labels and the longer fading guide. Fine aim was then moved upward to avoid obscuring low targets. The earlier 0.5 browser playthrough completed all original eight levels; a full 32-level manual browser playthrough has not been performed. Do not confuse deterministic solvability checks with subjective difficulty or cross-device validation.

Limitations: sound output not audited; physics outcomes can vary slightly across engines; new-region difficulty is an initial pass; new regions share a tinted version of the original city background.
