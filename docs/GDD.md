# Blind Spot — Game Design Document, 0.12

## Play loop
Aim, launch, watch the structure react, then choose the next shot. The intended feel is the readable launch-and-collapse puzzle loop of Angry Birds: scarce shots, useful material differences, vulnerable supports, weight transfer, chain reactions, quick retries and optional three-star mastery. Blind Spot retains its own surveillance targets, characters, artwork and tool effects.

The simulation and the original Region 1 were extended in place. Physics remains at two 120 Hz substeps per 60 Hz controller tick. The playfield remains 1280 × 720 so aiming and touch coordinates retain their established feel. Larger regions mean twenty puzzles each; later installations also occupy more of the existing field, from roughly x=658 to 1140, with upper storeys reaching about y=220. No camera scrolling or off-screen targeting is introduced.

## Six twenty-level regions
Starter City, Color Quarter, Signal Heights and Iron Docks each retain their original eight installations and gain twelve larger puzzles. Junction Yard adds twenty stone-and-paint puzzles. Central Works adds twenty full-crew puzzles. Deterministic structural compositions use independent towers, suspended beams, fixed pods, glass barriers, steel awnings, counterweights, heavy caps and upper storeys. There is no runtime random puzzle generation.

Difficulty builds through stages: exposed supports, separated targets, stacked loads, multiple approaches, then district finales. More targets and compound structures raise planning demands. Neighboring puzzles vary in angle and material; subjective difficulty is not guaranteed to rise identically for every player. All layouts have recorded three-star solutions and spare shots for ordinary completion. See CAMPAIGN.md for per-level targets.

## Mixed supplies
Players choose an available tool while ready or aiming. Switching cancels the old aim without spending a shot. Launching consumes one selected item and one shared throw. Supplies cannot change in flight. If a tool runs out, the next available type loads automatically; exhausting supplies or the throw allowance loses the attempt. Restart restores everything. The HUD shows remaining supply and changes the portrait, launcher and projectile with the selected tool.

Junction Yard pairs structural stone shots with paint cleanup. Central Works offers all four abilities. Bolted armored pods visibly attach to fixed platforms and require paint or EMP; they cannot simply be knocked to the ground. Other cameras retain impact and broken-mount vulnerability. Clever alternatives remain valid.

## Materials and destruction
Wood fractures; glass fractures more readily. Concrete retains its mass and falls. Anchored steel stays fixed. Fragments preserve total mass, linear momentum and angular velocity, then collide with cameras and other debris. Removing supports wakes nearby bodies. Contact strength includes rotation and the other body's mass, so a heavy falling beam matters more than a tiny fast splinter.

## Tools and feedback
Stone remains the familiar sling. Paint uses a pressure lobber, a spinning can, airborne splashes, clipped surface marks and ground puddles. Marks move with surfaces and survive fracture. EMP uses a coil launcher and disc, followed by the smaller pulse ring, affected-node arcs and persistent shorted-camera marks. Hooks use a winch, visible cable and barbed head; a temporary constraint applies the physical pull.

EMP direct radius is 95 pixels, formerly 180. A directly hit circuit node may reach its nearest matching live neighbor within 190 pixels, once. It never recursively propagates and never switches off a distant circuit for free. Dashed wires only join nodes within the same short-link distance. Structural materials do not occlude the pulse. Multiple nodes directly within the pulse each receive their own single-neighbor opportunity.

Paint radius remains 145 pixels. A pull lasts 1.1 seconds, aimed left and above the contact, and only attaches to movable bodies. Sustained suspension strain tears cables. The opening guide remains capped at 0.8 seconds / 340 pixels and exposes no predicted contact.

## Progress compatibility
Original installations have stable legacy IDs. Unversioned eight- or thirty-two-slot saves map through these IDs to the expanded campaign. Version 2 stores the expanded stars array and last level. Invalid values are bounded, blocked storage is tolerated, and retries do not reduce best stars. No save reset is required.

## 0.9 character and scene direction

In-play characters are articulated canvas illustrations rather than portrait cards. Each has a distinct palette and identifying accessories: Mara’s coral jacket/lime scarf, Inez’s purple jacket/painted trousers, Dex’s teal hoodie/goggles, and June’s gold jacket/overalls. Feet remain fixed on the roof while hips, shoulders, knees and arms respond to pull tension. A two-link arm solve keeps the grip aligned with the physical tool across all valid pull angles. The supporting hand braces the sling or launcher frame.

The ready state reaches into position over 0.35 seconds. A launch event carries the actual release coordinates; the hand follows through over 0.22 seconds and recovers by 0.85 seconds. The elastic has a brief damped rebound. These motions are render-only and do not alter collision bodies, impulses or launch timing. Pausing freezes the animation clock. Reduced motion removes idle breathing, scarf flutter, elastic rebound and camera shake; essential aiming and release feedback remain.

Original menu portraits remain intact. Six district palettes add atmospheric lighting and non-collidable distant architecture. Contrasting roof edges and character contact shadows establish a common ground plane. Beveled material highlights and offset shadows improve the legibility of structures without changing their hitboxes.

## 0.10 painted character skin

The approved 0.9 pose solver and motion timing remain unchanged. A painted layer now replaces the visible polygon bodies once its image decodes. It uses six types of illustrated components for each rebel, sampled from one atlas matched to the original portrait style. Upper sleeves overlap forearms, trouser layers overlap at knees, and independently drawn boots keep their soles planted. Texture preparation runs once per decoded image, not each frame. Level geometry, game physics, supplies, EMP balance and save formats are untouched. Detailed artwork and existing body movement take precedence over minor decorative effects: expressions and scarf folds are painted into the texture.

## Contraptions update (0.12)

Four authored layouts per district replace stages 9, 12, 16 and 20. A hinged heavy deck rotates about a world-fixed hub, with a matching visible pedestal. Deck and pedestal share an exclusion group so they do not collide with one another; all other objects still collide. End braces initially hold the load. Debris can continue to support it after fracture.

Orange power cells have a short 0.18-second charge. A damaging impact or an EMP inside 95 pixels starts the charge. Bursts apply a finite radial velocity impulse inside 175 pixels, weaken nearby breakable blocks, disable exposed cameras within 105 pixels, and charge nearby cells once. Shielded and bolted lenses retain their existing behavior. The power-cell casing is consumed; visual fragments are cosmetic. No blast extends EMP network range.

Painted characters reuse the existing atlas. Torso, pelvis and joint overlaps create a connected silhouette; the bracing elbow bends below the shoulder. Exponential posture smoothing uses elapsed time, while aiming contact stays exact. Follow-through and recovery ease into the next pose.
