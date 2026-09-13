# Painted rebel artwork — 0.10

The motion rig from 0.9 is unchanged. The painted skin is attached to its existing shoulders, hips, elbows, hands and planted feet. The detailed heads pivot at the neck; sleeves overlap the elbow joins, gloves follow the grip, and boots stay level with the roof.

- Selected asset: `dist/assets/rebel-parts-painted.png`, 1024 × 1536.
- References: Mara in `region-one-atlas.png`; Inez, Dex and June in `rebels-atlas.png`.
- Generation: built-in imagegen, with the original artwork as identity and style references. No CLI/API fallback.
- Integration: `dist/rebel-skin.js`, measured source rectangles and layered texture drawing. Torso crops exclude the original hanging sleeves so the animated arms can replace them.
- The generator returned an RGB checkerboard despite the transparency request. A background-extraction edit also returned RGB and softened the texture, so the richer first image was selected unchanged. The renderer isolates edge-connected neutral background once in an in-memory canvas, preserving enclosed light details. The raw source asset remains unmodified.
- Both the public game and standalone HTML include the painted atlas. The prior geometric renderer is retained only as a loading/failure fallback.

## Generation prompt

Use case: illustration-story. Generate one production sprite atlas for the game Blind Spot, using both supplied images ONLY as character identity and detailed painted comic style references. Image 1's left character is Mara. Image 2 has Inez, Dex, June left-to-right. Preserve their faces, hair, colors, fabric textures, ink linework, dimensional painted shadows and highlights. Do not copy any scenery or background.

OUTPUT: one portrait PNG, ideally exactly 2048 x 3072 pixels, genuine transparent alpha background everywhere between isolated parts, not a drawn checkerboard. EXACTLY four equally sized columns and six equally sized rows, giving 24 invisible 512x512 cells. No visible grid, text, labels, borders or drop shadows. Parts centered in each cell, fully fitting with generous transparent margins, never crossing cell boundaries.

COLUMNS from left to right: (1) Mara: short tousled dark brown bob, warm tan face, coral red bomber jacket, lime scarf, cream shirt, green backpack straps, teal cargo trousers, cream/teal sneakers. (2) Inez: warm brown skin, curly black hair in bun, gold hoop earrings, purple jacket, magenta scarf, black shirt, diagonal equipment strap, teal trousers with colorful paint spatters, dark high-top sneakers, fingerless dark gloves. (3) Dex: fair warm skin, tousled brown hair, round blue-lensed goggles over eyes, teal hoodie and dark backpack straps, charcoal cargo trousers, black sneakers, fingerless gloves. (4) June: warm medium skin, black messy bun, goggles atop head, mustard yellow jacket over navy work overalls and pale shirt, black backpack straps, navy trousers, brown workboots, fingerless gloves.

ROWS from top to bottom — SAME component type for all four columns:
ROW 1: only isolated head plus short neck, faces looking RIGHT in three-quarter profile, no torso.
ROW 2: only isolated torso neck-to-hips with jacket and torso clothing/accessories/scarf/backpack straps, absolutely NO head, NO arms and NO legs. Shoulder attachment areas smoothly terminate. Preserve layered costume.
ROW 3: only ONE upper arm with the character's jacket/hoodie sleeve, shoulder joint at TOP, elbow at BOTTOM. Points straight down.
ROW 4: only ONE bare forearm with gripping hand at bottom, elbow joint at TOP. Inez/Dex/June fingerless gloves; Mara bare hand. Fist gently closed as if gripping a handle, no held objects. Points straight down.
ROW 5: only ONE trouser upper leg, hip joint at TOP, knee at BOTTOM. Points straight down.
ROW 6: only ONE lower trouser leg, knee joint at TOP and complete shoe/boot at BOTTOM, toe points RIGHT. Points straight down.

All 24 components are anatomically coherent painted paper-doll rig parts, consistent orientation and lighting. Softly rounded overlapping joint ends suitable for rotating skeletal animation. These are illustrative costume components, no injury or gore. Detailed expressive original graphic-novel illustration matching references; intricate hair, seams, wrinkles, fabric wear, natural faces and finger anatomy. No geometric vector simplification, no flat symbols, no full assembled characters, no extra limbs. 4 columns x 6 rows is critical.

## 0.12 assembly revision

No new images generated. Reuse the same painted atlas with a continuous torso crop, painted waist, connected limb roots and thicker overlaps. Correct the bracing elbow direction and smooth the pose; preserve all original faces, outfits and menu portraits.
