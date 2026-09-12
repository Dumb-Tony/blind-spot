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
