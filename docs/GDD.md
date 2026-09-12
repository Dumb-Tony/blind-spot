# Blind Spot — concise GDD

## Promise
A playful 2D physics puzzle: aim, launch an improvised tool, collapse structures, disable every fictional surveillance camera, earn 1–3 stars. No human targets. Region 1 introduces Mara, a courier and skater, and her taped heavy Street Stone. Mara remains beside the launcher. Eight levels end at the Ministry of Looking.

## Controls and feel
Drag the glowing stone backward and release. A forgiving grab radius, pointer capture and canvas coordinate conversion support scaled windows. Tiny pulls and cancelled drags cost nothing. A fading guide shows only the opening 0.4 seconds, capped at 180 pixels. No predicted contact marker or collision label is shown. Fine-aim sliders and arrows/Space provide alternatives. Escape cancels or pauses; R restarts; M mutes. Fullscreen is optional.

Combine punchy, forgiving launches with readable chain reactions. Wood splinters, glass shatters, concrete falls intact and anchored steel blocks shots. Cameras shut down through direct impact, debris impact or sustained loss of mounting. No secondary tool ability.

## Simulation and outcomes
Locally bundled Matter.js runs two substeps per fixed 60 Hz game step, independent of display refresh rate. Prediction uses matching physical properties and step size. Structures seat before play with damage disabled. The world pauses between shots for inspection. Broken blocks create physical fragments plus cosmetic particles.

After launch, motion resolves before another stone loads. Bounded settling waits prevent indefinite stalls. Success requires all cameras disabled; failure requires tools exhausted with cameras remaining after resolution. Save each result once. Storage failure never blocks gameplay.

## Eight-level curriculum
| Level | Lesson | Stones | Three / two stars: at most |
|---|---|---:|---:|
| First blind spot | Exposed camera and sling | 3 | 1 / 2 |
| Knee-jerk reaction | Wooden supports | 3 | 1 / 2 |
| Glass houses | Break a shield | 3 | 1 / 2 |
| Double take | Momentum between towers | 4 | 2 / 3 |
| Heavy paperwork | Drop a concrete weight | 3 | 1 / 2 |
| Overprotective | Arc over anchored steel | 4 | 2 / 3 |
| Domino department | Top-heavy chain reactions | 4 | 2 / 3 |
| The Ministry of Looking | Four-camera material finale | 5 | 2 / 4 |

Any other successful completion earns one star. Failure earns none. Thresholds are visible during play. Hints are optional. All eight levels are open for testing and replay; local progress records best stars.

## Presentation
Graphic-novel city at golden hour; navy, cream, lime, coral and cyan. Illustrated Mara has a distinctive silhouette and subtle motion beside the sling. Oversized red lenses, scan cones, sparks and cracked lenses distinguish cameras and shutdowns. Wood grain, cyan panes, concrete panels and steel hazard stripes distinguish materials. Particles, brief shake, trails and chain labels emphasize results. Synthesized launch, impact, break, shutdown and completion sounds have mute. Reduced motion suppresses shake and reduces animation.

Menus prioritize immediate Play, clear controls, thumbnail levels, stars, restart and outcomes. Satire targets the fictional Ministry's bureaucracy, not civilians.

## Expansion and delivery
Separate data, physics, renderer and controller modules. Future regions each add one rebel, one tool and one new mechanic: painter/paint splash/shielded cameras; tinkerer/EMP/electronic clusters; mechanic/pull tool/suspended weights. These are future design directions only. Avoid inventory management, hacking minigames and complex upgrades.

The standalone HTML embeds all dependencies and artwork; readable source and engine license accompany it. Desktop play is primary. No music, cloud saves, moving enemies or later regions. Keyboard aiming, DOM controls, mute and reduced motion help accessibility, but the spatial canvas puzzle is not fully screen-reader playable. Physical outcomes may vary slightly between browser engines.

## Physics revision 0.5
Mass-sensitive contact damage and angular contact velocity distinguish heavy falling weights from small debris. Physical fragments retain total mass and linear momentum and inherit spin. Nearby sleeping bodies wake on fracture. Debris is included in settling; quiet time is 0.85 seconds with a 14-second per-shot upper bound. This is a game-oriented rigid-body simulation, not a finite-element structural solver. No scripted camera kills or puzzle-specific collapse triggers are used.
