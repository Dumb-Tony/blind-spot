# Cohesive character sprites — 0.17

## Result

Mara, Inez, Dex and June now render as complete characters rather than compositions of separate heads, torsos and limbs. Each rebel has a ready pose, a braced aiming pose and a release follow-through. Clothing folds and anatomy remain continuous across every joint.

The atlas was generated with the built-in image-generation tool from the existing painted character reference. The final prompt required the original faces, clothing and palette; identical scale and foot baselines; warm top-left lighting; cool lower-right shadow; restrained navy outlines; and explicitly excluded loose limbs, puppet pins, doll articulation, collage and cardboard-cutout styling.

## Integration review

- Checked a complete sprite in the production playfield against the rooftop, slingshot and HUD.
- Confirmed the feet share the roof baseline and the slingshot overlaps the body correctly.
- Checked all four columns and all three pose rows through the automated atlas fixture.
- Retained the connected procedural renderer as a load fallback.

## Regression coverage

The full 120-level route suite, character pose calculations, material fracture checks, contraption fixtures and 360 varied physics stress runs remain part of the release gate.
