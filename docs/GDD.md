# Blind Spot — Region 1 Vertical Slice GDD

## Product definition

**Genre:** 2D physics-destruction puzzle  
**Platform:** Desktop browser; standalone offline HTML is the reference build  
**Audience:** Players who enjoy readable, replayable trajectory puzzles and comic chain reactions  
**Tone:** Bright, cheeky, youthful, and fictional. The targets are machines and infrastructure—never people.

## Player promise

Study a surveillance installation, drag back an improvised projectile, and release it into a structure. A strong shot should either smash a camera directly or turn the building itself into the weapon. Every required camera must be disabled before the limited supply of tools runs out.

## Design pillars

1. **Understand it in seconds.** Drag, aim, release, watch, retry.
2. **Readable cause and effect.** Cameras glow red; wood breaks; glass shatters; heavy blocks fall and transfer force.
3. **Elegant destruction.** Direct hits work, while striking a support can produce a better solution and score.
4. **Fast experimentation.** Instant restart, short settle time, and no punishment for retrying.
5. **Playful resistance.** Colorful fictional bureaucracy, improvised tools, no realistic violence or human targets.

## Region 1: Starter City

Starter City is watched by the fictional **Ministry of Appropriate Behavior** and its red-lensed OmniPeek cameras. The first rebel, **Mara**, is a student skater and neighborhood courier. She stands beside a hand-built sling and contributes the region’s only tool: a dense, duct-taped rubble ball nicknamed the **Street Stone**.

Region 1 teaches:

- drag-and-release aiming and trajectory reading;
- direct camera hits;
- multiple targets and limited shots;
- fragile glass;
- breakable structural wood;
- heavy, non-breakable blocks as falling weights;
- support removal and chain reactions.

The region contains eight levels. Level 8 is the oversized **OmniPeek Relay** finale.

## Core loop

1. Inspect the installation and available shots.
2. Drag the Street Stone backward from the sling.
3. Read the projected arc and release.
4. Physics resolve: blocks crack, glass shatters, towers fall, and cameras can be hit by debris.
5. When motion settles, either load the next shot, complete the level, or fail.
6. Earn 1–3 stars based only on shots used; replay for a cleaner collapse.

## Rules and scoring

- All red-lensed cameras are required targets.
- A camera is disabled by a sufficiently strong impact, being knocked from its mount, or falling/tilting beyond recovery.
- A shot is consumed when released.
- If all cameras are disabled, the level is won after the destruction settles.
- If cameras remain when the last shot settles, the level fails.
- **3 stars:** meet the displayed clean-shot target.
- **2 stars:** complete within the displayed efficient target.
- **1 star:** complete with any remaining legal solution.
- The best result per level is saved locally and unlocks the next level.

## Materials

| Material | Read | Behavior |
|---|---|---|
| Wood | Orange grain | Light, structural, breaks under a strong impact |
| Glass | Cyan pane | Very fragile, shatters easily, poor support |
| Heavy block | Blue-gray stone | Dense and unbreakable; useful as a falling weight |
| Steel | Dark fixed footing | Immovable foundation or boundary |

## Level sequence

| # | Name | Lesson | Shots | 3★ / 2★ |
|---|---|---|---:|---:|
| 1 | Say Cheese | Direct hit | 3 | 1 / 2 |
| 2 | Weak at the Knees | Break a wooden support | 3 | 1 / 2 |
| 3 | Double Exposure | Two targets; efficient sequencing | 4 | 2 / 3 |
| 4 | Glass Policy | Shatter a transparent shield | 4 | 2 / 3 |
| 5 | Leaning Argument | Topple a narrow tower | 3 | 1 / 2 |
| 6 | Paperwork Cascade | Drop heavy blocks into cameras | 4 | 2 / 3 |
| 7 | Privacy Wall | Attack exposed structure, not armor | 4 | 2 / 3 |
| 8 | OmniPeek Relay | Combine all Region 1 lessons | 5 | 2 / 4 |

## Controls and feedback

- Mouse or touch: drag the loaded stone and release.
- `R`: restart instantly.
- `M`: mute/unmute.
- `Esc`: pause or return to navigation.
- The guide uses the projectile’s real launch velocity, air drag, and gravity to plot the unobstructed arc.
- Impacts trigger material-specific sound, particles, camera sparks, hit pause, and mild screen shake.

## Technical architecture

- Matter.js 0.20.0 is bundled locally; no network is required at play time.
- Level definitions are plain data: bounds, blocks, targets, shot limits, and star thresholds.
- Region, rebel, tool, and material definitions are registries, allowing later content without rewriting the play loop.
- Rendering, audio, input, physics events, progression, overlays, and persistence are separated into readable modules in source, then embedded into the one-file standalone build.

## Expansion contract

Each later region adds exactly one rebel, one signature tool, one structural/surveillance mechanic, and one visual identity. Existing tools may return in curated level loadouts. A tool must be explainable in one sentence and must not add combat against people, inventory management, or a separate minigame.

## Vertical-slice acceptance criteria

- Eight selectable, unlockable, restartable levels.
- Accurate drag/release trajectory and one clear starter tool.
- Distinct camera targets and all four Region 1 materials.
- Physical pushing, rotation, breakage, debris damage, and structural collapse.
- Deterministic win/fail evaluation after motion settles.
- Visible shots, camera count, star thresholds, best scores, sound toggle, instructions, and persistent progress.
- Standalone HTML launches locally without a server or CDN.

## Known scope boundary

This slice uses intentionally compact procedural 2D art and synthesized audio. It does not yet include a campaign map, narrative cutscenes, alternate tools, mobile-specific level layouts, or a level editor.
