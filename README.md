# Blind Spot — Six Regions (0.17)

Play: https://dumb-tony.github.io/blind-spot/
Source: https://github.com/Dumb-Tony/blind-spot

Open `dist/blind-spot-standalone.html` to play offline. Artwork, physics, styles and sound are embedded. This expands the existing local game; saved stars and level identities remain intact.

## In the scene

Version 0.17 replaces assembled body-part animation with twelve cohesive full-body gameplay sprites: ready, braced aim and release poses for all four rebels. Their outlines, lighting, scale, ground shadows and foot baseline are matched to the rooftops, while the live rig continues to choose poses from the real aiming and release state.

## Connected character animation

Version 0.16 preserves the four painted character designs while replacing rectangular limb slices and visible joint caps with tapered, overlapping body volumes. Limbs now tuck behind clothing, near and far sides have distinct depth, and soft highlights and shadows follow the connected poses through aiming, release and recovery. The result is an interactive 2.5D character rig rather than a pre-rendered video.

## Room to experiment

Version 0.15 reshapes Starter City's eight opening installations around broad structural targets and multiple attack paths. Players can hit legs, decks, glass, weights, or cameras directly, with three-star targets that allow cleanup throws. The opening paint and EMP installations add nearby impact surfaces without increasing either tool's range. The first four installations in every district carry an extra recovery throw and mixed-tool supplies where applicable.

Every Starter City installation has three separated winning shot paths in the automated balance audit. Each path wins at least seven of nine trials when both axes vary by four pixels, and each survives a deliberate missed throw. All 120 campaign routes continue to pass in the browser.

See [the early-game balance report](docs/PLAYTEST-0.15.md).

## Material-specific destruction

Version 0.14 makes glass shatter into triangular physical shards, wood split into uneven splinters, and concrete crack and crumble into angular rubble. Larger wood and concrete pieces can fracture once more after a hard collision. Fragments retain mass, inherited motion and surface paint; destroyed beams release their constraints. Fixed steel remains solid. Existing layouts, characters, tool ranges and saved progress are preserved; winning routes have been retested for the new debris behavior.

See [the fracture test report](docs/PLAYTEST-0.14.md).

## Tactile material surfaces

Version 0.13 replaces flat structural fills with distinct painted surfaces: lengthwise wood grain and end cuts, translucent beveled glass, pitted concrete aggregate, brushed and rusted steel plates, and chipped orange enamel power cells. Textures remain fixed to moving bodies and appear on debris and level thumbnails. Paint splatters stay above the surfaces. The existing characters, physics, campaign layouts, tools and saved progress are preserved.

See [the material test report](docs/PLAYTEST-0.13.md) and [artwork notes](docs/ARTWORK.md). The standalone HTML embeds the new atlas and works offline.

## Contraptions and connected character motion

Version 0.12 adds hinged platforms, local power-cell bursts and **24 substantially redesigned puzzles**: installations **9, 12, 16 and 20 in every region**, marked CONTRAPTION in level select. The original 32 introductory layouts remain intact. The rebels retain their painted artwork, with continuous torsos, covered joints, natural bracing elbows and smooth posture/recovery. Ground impacts kick up dust; new objects have visible hubs, charge flashes, burst rings and distinct sound.

Power cells react to hard impacts or an EMP within its unchanged 95-pixel range. Their 175-pixel burst pushes nearby bodies and can chain to another cell. Fixed armor and distant targets remain separate problems. Hinged decks stay attached to their gold hub; uneven loads tip them after braces give way. Broken fragments can still prop them up, so a partial collapse can need another shot.

All 120 levels retain recorded three-star routes. Existing best stars stay saved, including on redesigned levels. Pause opens sound, shake and fullscreen controls; keeping them off the active playfield prevents them from covering low cameras.

## Physics update

Version 0.11 fixes unsupported sleeping stacks and simulation freezes between throws and on result screens. Blocks, cameras and debris keep responding to gravity after play starts. The final throw waits for the structure to settle before declaring failure. Layouts, shot limits, artwork and progress are preserved. All 120 levels have refreshed three-star solutions.

## Visual update

Version 0.10 restores the original illustrated character style while preserving the 0.9 movement rig. Faces, hair, clothes, gloves and shoes use painted textures rather than polygon artwork. See `docs/ARTWORK.md` for source references and the generation prompt.


Gameplay rebels now use detailed painted artwork matched to the original portraits, attached to articulated bodies with planted boots, bending limbs, pull-dependent weight shifts and hands that track the actual tool. Ready poses reach into place; release triggers follow-through and recovery. Mara braces the sling, while Inez, Dex and June operate their distinct launchers. Their illustrated menu portraits are preserved.

District lighting, distant architecture, roof edges, material bevels and shadows, menu cards and HUD styling have also been refreshed. That earlier visual pass preserved gameplay. This release’s redesigned layouts and targets are listed in docs/CAMPAIGN.md.

## Campaign

| Region | Available tools | Levels |
|---|---|---:|
| Starter City | Street Stone | 20 |
| Color Quarter | Paint Can | 20 |
| Signal Heights | EMP Puck | 20 |
| Iron Docks | Pull Hook | 20 |
| Junction Yard | Stone + Paint | 20 |
| Central Works | All four tools | 20 |

120 installations, 360 possible stars. The original eight levels remain at the beginning of each existing region. New stages broaden the playfield occupation, add taller frames and suspended loads, then combine separated targets, heavy caps, fragile upper storeys and ground-level cleanup. The two new regions teach choosing tools before combining them in larger operations. Difficulty follows staged ramps; individual puzzles reward different strengths and alternate solutions.

Choose **LOAD TOOL** before throwing in mixed regions. Each tool has a limited supply, and every throw uses the shared level allowance. Paint or a close EMP pulse defeats bolted armored cameras; ordinary cameras can still fall with their supports. The active rebel and launcher change with your selection.

## Controls and abilities

Drag the glowing tool left and down, then release. The fading guide shows only the first 0.8 seconds / 340 pixels, with no impact marker. Fine aim provides sliders. Arrows aim; Space throws; Escape cancels or pauses; R restarts; M mutes. Tools activate on first impact.

- **Stone:** impact, support damage and momentum through breakable structures.
- **Paint:** a visible 145-pixel splash, droplets, drips and persistent surface coverage. Broken painted pieces keep their paint.
- **EMP:** a **95-pixel pulse**, reduced from 180. Each directly reached circuit node can disable its single nearest matching neighbor within **190 pixels**. That neighbor does not propagate further. Distant matching letters no longer grant map-wide shutdown. Pulse range is measured from contact to lens center; materials do not block the field.
- **Hook:** grips a movable body and pulls for 1.1 seconds. Off-center hits rotate beams; strained suspension cables tear. Fixed steel and bolted cameras cannot be pulled.

Three stars reward the tested shot target shown before aiming; two and one stars allow extra throws. Inspect the damage after winning to see the painted ruins. All regions remain open. Browser saves from the 8- and 32-level builds migrate to the same original installations.

## Source and validation

- `dist/game-data.js`: original layouts, deterministic campaign compositions, supplies and calibrated star targets.
- `dist/physics.js`: shared Matter.js simulation, inventory, abilities, constraints, fracture and aiming guide.
- `dist/rebel-skin.js`: painted character layers and one-time texture preparation.
- `dist/rebel-rig.js`: articulated gameplay characters, two-link arm poses and release motion.
- `dist/renderer.js`, `dist/game.js`: visuals, input, sound, menus and save migration.
- `docs/GDD.md`, `docs/CAMPAIGN.md`, `docs/TEST_REPORT.md`, `docs/CHANGELOG.md`: design, level reference and validation.
- `tests/solutions.json`: reproducible winning launches for all 120 levels (spoilers).

Run `node scripts/build-standalone.mjs`, then `node tests/production.test.cjs`. No dependency installation is needed. `node scripts/serve.cjs` starts the local preview. `node tests/solve-overhaul.cjs --save` searches and records solutions; it is intentionally slower than the normal regression suite. GitHub Pages runs the build and regression suite before deployment on pushes to `main`.

The `region1-cloud-baseline` tag preserves the recovered cloud original. Earlier versioned ZIPs are historical snapshots. GitHub Pages is the public sharing link.

For the automated browser replay, start the local server and open /qa-physics.html, then select Run all 120 levels. This uses isolated progress, real pointer handlers and an accelerated clock; it renders each result and checks body validity.

The aiming-tolerance review gives 13 sensitive contraption puzzles a cleanup throw within the three-star target. See docs/PLAYTEST-0.12.md for validation and local browser review tools.
