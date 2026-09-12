# Blind Spot — Game Design Document, 0.8

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
