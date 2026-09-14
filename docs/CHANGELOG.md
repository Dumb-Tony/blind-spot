# 0.18 — More to break

- Added Redline Ward and Overgrowth, expanding the campaign from 120 to 160 installations across eight districts.
- Added Sol and Niko with cohesive ready, aiming and follow-through character art.
- Added the Breach Charge, which sticks on contact and produces a focused short-range structural blast.
- Added the Foam Pod, which blooms into a persistent collidable wedge and lifts nearby structures.
- Added forty stable, progressively layered layouts and mixed-tool arsenals in the final district.
- Expanded exact route, browser, inventory, stability and stress coverage to all 160 levels and six tools.

# 0.17 — In the scene

- Replaced assembled body-part rendering with cohesive full-body sprites for every rebel.
- Added consistent ready, braced aiming and release follow-through poses with continuous anatomy and clothing.
- Matched character outline, top-left lighting, cool form shadow, scale and foot contact to the gameplay environment.
- Kept the responsive pose state, slingshot layering and procedural fallback.

# 0.16 — Connected crew

- Reworked all four painted gameplay rigs with tapered, rounded limb volumes instead of rectangular cutout strips.
- Hid shoulder, elbow, hip and knee joins beneath overlapping clothing and textured limbs.
- Added near/far depth ordering, directional body highlights, form shadows and grounded character silhouettes.
- Preserved exact hand contact, planted feet, aiming reach, release follow-through and reduced-motion behavior.

# 0.15 — Room to experiment

- Reshaped Starter City's eight opening installations with broader supports, shared platforms, lower obstructions and several visually distinct attack paths.
- Raised opening three-star targets to allow cleanup play: 2 throws on levels 1–3, 3 on levels 4–7, and 4 on level 8. Added three recovery throws beyond par.
- Added forgiving nearby impact surfaces to the first two paint and EMP installations while preserving the 95-pixel EMP range.
- Added one recovery throw to the first four installations in every district and one extra mixed-tool supply per available tool.
- Added a varied-shot balance audit and real-pointer browser replay. Each opening level has three separate routes; every route passes at least 7/9 four-pixel aim variations and still clears after a deliberate miss.
- Recalibrated full-campaign routes without changing level identities or saved stars.

# 0.14 — Material matters

- Replaced the common two-rectangle break with triangular glass shards, long irregular wood splinters and chunky concrete rubble. Rendered fragment outlines match the physical convex bodies.
- Concrete now accumulates impact damage (90 HP, 5.5 speed threshold); cracks deepen and branch before it crumbles. Fixed steel remains unbreakable.
- Large wood/concrete debris can fracture a second time. Glass makes 4–20 shards according to pane dimensions; wood makes four primary pieces and concrete five. Secondary splitting is bounded by size, generation and body-count checks.
- Preserve mass and inherited translation/spin; paint follows fragments. Remove destroyed hinge, cable and hook constraints. Add glass flecks, wood slivers and concrete dust.
- Retest campaign solutions, stability, fragment geometry, momentum, aftermath and browser play.

# 0.13 — Tactile city

- Added a painted material atlas: honey wood grain, rough concrete aggregate, brushed/rusted steel and chipped orange enamel.
- Made glass translucent with beveled reflections and branching damage; wood grain follows the beam's long axis.
- Added material-specific end cuts, nails, edge spalls, plate ribs, bolts and vents. Textures remain attached through motion; rubble and thumbnails use the same renderer, with surface paint drawn above them.
- Preserved the painted rebels, campaign geometry, physics, tools, scores and progress.
- Verified all 120 browser routes and 360 stress throws; added loaded-atlas renderer regressions and a local material review page. Embedded the atlas in the standalone HTML.

# 0.12 — Contraptions and connected motion

- Reworked painted body assembly: continuous torso and waist, filled joint seams, thicker overlapping sleeves and legs, naturally bent bracing elbows.
- Added time-based posture smoothing and eased recovery while keeping the aiming hand locked to the actual tool.
- Added hinged decks with visible fixed hubs and uneven loads; added impact/EMP power cells with a short charge, bounded blast and local chains.
- Redesigned installations 9, 12, 16 and 20 in each district (24 puzzles). Preserve the original 32 layouts, all saved identities and the established tool ranges.
- Calibrated new three-star targets against complete production solutions; mark new puzzles in the level picker and explain mechanics in the field guide.
- Added impact dust, charge and burst sounds, and local shockwave feedback. Moved utility controls off the active playfield; access them while paused.
- Added mechanics, animation-smoothing and 360 varied final-shot stress checks; replay the full 120-level campaign in the browser.

# 0.11 — Unsupported structures keep falling

- Wake every dynamic body at the first launch; keep gravity active during subsequent aiming, loading and result inspection.
- Wait for final-shot motion to settle before declaring failure. Remove off-world bodies from rendering as well as physics.
- Preserve all 120 layouts and star targets, tool balance and the painted animation rig. Refresh reproducible solutions for the corrected collapses.
- Add floating-stack, sliding-support, timeout and cleanup regressions, plus an isolated 120-level browser controller replay.

# 0.10 — Painted rebels, preserved motion

- Added detailed painted character parts matched to the original portraits.
- Kept the 0.9 pose solver, grip tracking, planted feet and release timing unchanged.
- Added layered sleeves, forearms/gloves, trousers, level boots and detailed head/torso textures.
- Included painted artwork in the standalone file and documented its references and prompt.
- All 120 three-star solutions still pass; regression suite now includes painted-layer and texture-isolation coverage.

# 0.9 — Rebels take the shot

- Replaced floating gameplay portrait panels with four articulated, cel-shaded rebels.
- Added planted feet, bending knees/elbows, pull-dependent stance, actual hand/tool contact, ready reach, release follow-through and recovery.
- Preserved distinct launchers and original illustrated menu portraits.
- Added district lighting/architecture, roof contact detail, material bevels/shadows, elastic rebound and refreshed menus/HUD.
- Added pose/contact/recovery/reduced-motion regression coverage. All 120 level solutions remain valid.

# 0.8 — Six regions, 120 installations

- Expanded every existing region to twenty levels; preserved the original layouts and Region 1 balance.
- Added Junction Yard (Stone + Paint) and Central Works (all four tools), twenty levels each.
- Added limited selectable tool supplies, active rebel/launcher switching and bolted armored pods.
- EMP radius reduced from 180 to 95 pixels. Circuit propagation is limited to one nearest neighbor within 190 pixels. Revised EMP hints and short wire visuals.
- Added taller frames, heavy caps, fragile upper storeys, separated towers, counterweights and suspended loads.
- Calibrated star targets against recorded solutions, with spare completion throws.
- Migrated old eight- and thirty-two-level progress without moving earned stars to different puzzles.
- Expanded production tests, browser checks, campaign reference and standalone build.

---
Historical releases below describe their own versions.

# Changes in 0.5 — September 12, 2026

Recovered the existing cloud repository into the user's Blind Spot folder, preserving its history and artwork. No replacement game or new region was introduced.

The aiming guide is an opening arc that fades to zero. Future contact data is never passed to the renderer. Full trajectory calculation remains an internal regression helper only.

Contact damage now accounts for mass ratio and angular contact velocity. Fracture produces two physical pieces with equal shares of the original mass, inherited spin, and velocities evaluated at each piece's center. No arbitrary upward kick or mass deletion is added. Adjacent resting bodies wake when a supporting body breaks. Fragments count toward the settling decision.

All eight existing levels retain their layouts, allowances, and star targets. Physical solution recordings were regenerated because chain reactions changed. Help and level tips were updated to avoid promising an impact prediction.

The title identifies the build as 0.5. Standalone packaging remains fully local and offline.

# 0.6 — Four-region campaign
- Extended and brightened the fading opening guide to 0.8 seconds / 340 pixels. No impact marker.
- Added Inez, Dex and June with a new portrait atlas, automatic paint/EMP/pull abilities, armor, circuits and hanging beams.
- Added 24 puzzles, region selection, per-region progress and migration of existing saves.
- Kept all original Region 1 layouts and recorded solutions.
- Moved Fine aim above the playfield to keep low targets visible.
- 408 production assertions pass, including all 32 three-star solutions.

## 0.7 — Visible tool identities and aftermath
Mara retains the stone and wooden sling. Inez now launches a recognizable paint can from a pressure lobber; the impact throws magenta droplets and deposits persistent splashes, drips and ground puddles. Marks are clipped to surfaces, move with bodies and carry onto fractured debris. Paint no longer relies on a text label to communicate lens coverage.

Dex uses a glowing disc and coil launcher, with an electrical flight trail, expanding pulse, arcs to affected cameras and visible shorted-lens marks. June uses a steel hooked head and winch launcher; a cable follows the hook in flight and visibly pulls its attachment. Ability sounds distinguish splashes, electronic discharge and mechanical pull.

Victories leave at least 1.5 seconds to see the final effect. Choose LOOK AT THE DAMAGE to inspect the scene indefinitely, then use pause for level selection or R to retry. Paint is visual surface coverage using the existing splash radius, not a fluid simulation; gameplay trajectories and all 32 recorded solutions are preserved.
