# Connected character animation — 0.16

## Approach

The gameplay characters remain the existing painted Mara, Inez, Dex and June artwork. Their source pieces are now drawn through a connected 2.5D rig: tapered limb silhouettes clip the painted textures, neighboring pieces overlap inside clothing, and the renderer orders far limbs, torso and near limbs by depth. This keeps animation responsive to the real projectile position while giving the body continuous volume.

## Visual review

- Reviewed all four characters side by side at the same pull and height.
- Reviewed aiming, release follow-through and recovery poses.
- Removed visible circular joint covers after the first pass made elbows and knees resemble ball hinges.
- Confirmed hands remain connected to forearms, legs remain planted, and silhouettes do not open at extreme pulls.

## Regression coverage

- Exact hand-to-projectile contact at extreme pull directions.
- Finite arm joints and planted feet for every tool character.
- Frame-rate-independent posture smoothing and reduced-motion behavior.
- Full 120-level route suite, material fracture suite, contraption fixtures and 360 varied physics stress runs.
