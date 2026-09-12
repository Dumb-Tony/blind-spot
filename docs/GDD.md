# Blind Spot — Game Design Document, 0.6

## Core loop
Aim, launch a tool, let physics and abilities resolve, disable every surveillance camera, earn one to three stars. Rebels stay at the launcher. The fictional Ministry's surveillance hardware is the target. Tone is playful, colorful and rebellious.

## Campaign
Four regions, eight levels each. Each introduces one rebel, one automatic impact tool and one structural or surveillance mechanic. All regions are available from the level-select dropdown; next-level navigation crosses region boundaries. Stars save per level; older Region 1 saves migrate in place.

1. **Starter City / Mara / Street Stone.** The original eight levels remain unchanged. Wood breaks, glass shatters, concrete transfers weight, anchored steel stays fixed.
2. **Color Quarter / Inez / Paint Can.** Armored lenses resist direct collision damage. First impact bursts paint over a 145-pixel radius, disabling nearby lenses. Puzzles introduce pairs, barriers, separated pods, glass splash surfaces, elevated structures and a clustered finale. Falling mounts remain a valid alternative.
3. **Signal Heights / Dex / EMP Puck.** First impact pulses within 180 pixels. Every nearby camera goes offline; matching circuit letters propagate shutdown to remote cameras. Cyan A and amber B wires show membership. Circuits do not cross between letters. Puzzles teach reachable nodes, separate networks, barriers and intersecting networks. The pulse can pass through structural materials.
4. **Iron Docks / June / Pull Hook.** First contact with a movable body creates a physical pull for 1.1 seconds toward a point left and above it. Off-center contact creates torque. Hanging beams have two suspension constraints. Sustained extension beyond 0.55 pixels for 0.12 seconds tears a cable. Puzzles teach swinging, falling loads, independent cranes, support removal and a two-crane finale.

The 24 new levels each allow four tools. Two or fewer earns three stars, three earns two, four earns one. Clever chain reactions may beat these targets. Existing Region 1 thresholds remain unchanged. A failed attempt earns no stars.

## Aiming and readability
Mouse/pointer drag, keyboard arrows/Space, and Fine aim sliders share the same launch model. The guide now spans up to 0.8 seconds or 340 pixels and fades only in its latter half. It shows direction and early curvature, never a predicted impact or target marker. Fine aim sits near the top, keeping low cameras visible.

Current tool and rebel appear in the HUD. Paint armor has a magenta outline; circuit letters and wires distinguish networks; cables and the temporary golden pull line show physical attachments. New portraits accompany the original city backdrop with region-specific color treatment. Region 1's art remains intact.

## Physics
Matter.js runs at a fixed 60 Hz game clock with two substeps. Contact damage uses mass ratio and angular contact velocity. Fracture retains total mass and linear momentum; physical fragments inherit spin. Nearby sleeping bodies wake after a supporting body breaks. Debris participates in settling. No level-specific scripted camera kills are used.

The world pauses between tools for inspection. Resolution uses a quiet window and a 14-second upper bound. Disabling all cameras wins; exhausting tools after resolution loses. Paint/EMP effects occur only at first impact. Hooks cannot grip anchored steel. Cosmetic particles are distinct from physical fragments.

## Delivery and limits
One self-contained offline HTML plus readable source, tests, bundled engine license and generated artwork. GitHub Pages is the public release. Desktop is the primary platform. Camera puzzles require vision; this is not a fully screen-reader-playable game. Cross-browser/device testing and further difficulty tuning remain future work. This is the first playable pass of Regions 2–4, reusing the existing city setting rather than adding new background paintings.
