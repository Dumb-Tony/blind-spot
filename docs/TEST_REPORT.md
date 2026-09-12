# Test report — Region 1 v0.5

Date: September 12, 2026. The recovered cloud build passed its original 127 checks before changes.

## Automated production checks
`node tests/production.test.cjs`: **142 assertions passed** against the shipped simulation, renderer and controller (DOM adapter for controller tests).

- All eight levels clear within their three-star allowances, without scripted kills.
- Recorded solution shot counts: **1, 1, 1, 1, 1, 2, 1, 1**.
- No pre-shot destruction, finite launch mass/positions, exactly-once wins, misses/failure, tiny-drag cancellation, restart and scoring boundaries.
- Real controller pointer handlers at multiple canvas sizes; pause/resume; storage denied and malformed saves; progression reload; 30/60/200 Hz fixed-step behavior.
- Matching trajectory physics; time/distance-bounded opening guide with no hit result; standalone dependency embedding.
- Fracture conserves total mass and linear momentum and inherits spin; clearing supports releases the heavy load; mass-sensitive debris impacts.

## Browser playthrough
Used the local browser at 1280 × 720, through actual drag/release controls and the game's menus. Completed all eight levels with **24/24 stars and 8/8 installations offline** visible in level select. Level 6 required two shots; the finale produced a four-camera chain with one shot. Verified level selection, next-level transition, progress surviving a page reload, and illustrated artwork. Visually inspected the short fading guide using Fine aim: no target ring or predicted contact label.

Levels 1–4 were played before the final nearby-body wake adjustment; levels 5–8 were played after reloading that adjustment. All eight were rechecked by the final automated production suite.

## Limits
Browser coverage is the desktop in-app Chromium browser, not a device/browser matrix. Sound synthesis is present; subjective speaker output was not audited. The simulation has a 14-second shot ceiling to avoid indefinite stalls. Full standalone dependency embedding is checked automatically; standalone browser startup is separately smoke-tested. Cosmetic particles are not collision bodies; the two larger fragments are physical. No later regions were added.
