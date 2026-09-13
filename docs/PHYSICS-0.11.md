# Physics repair and playtest — 0.11

## What caused the floating objects

Matter's sleeping bodies could retain a suspended position when their support was removed or shifted away. The previous fracture wake-up only covered bodies within eight pixels of the broken piece; it did not reactivate every body above that piece.

A separate state-machine problem stopped physics whenever the next tool loaded, while aiming, and after a win or loss. The fourteen-second shot timeout could therefore freeze a collapsing structure in midair.

## Changes

Initial seating still uses sleeping bodies and the unlaunched level remains still. The first launch wakes every dynamic body and disables sleeping for the active installation. Gravity then continues through ready, aiming and result states. Pause still freezes play. The last throw waits for quiet motion instead of declaring failure at fourteen seconds. Win events remain exactly once.

Off-world blocks and projectiles are removed from drawing lists as well as the physics world. Removed cameras retain scoring records but no longer draw. Fixed steel, bolted lenses and intact suspension cables remain intentional supports.

No layouts, shot budgets, three-star thresholds, tool ranges, artwork or save formats changed. Reference throws were refreshed because continuous physics changes how debris lands.

## Validation

- All 120 production-engine solution replays pass within existing three-star targets.
- The production suite passes over 1,900 assertions, plus targeted floating regressions.
- Dedicated fixtures remove or slide away the base of an entirely sleeping stack; its heavy block and camera both fall. Further fixtures cover ready/aiming/win/loss gravity, the fourteen-second timeout, last-shot settling, initial stability and off-world cleanup.
- Controller checks confirm physics continues on the result screen and pause/resume still works.
- All 120 levels also passed automated browser replays through actual DOM pointer handlers and tool controls. Every active body was checked for finite position/angle and absence of sleeping; each result was rendered and allowed another three seconds of settling.

The browser harness uses an accelerated clock and isolated in-memory progress. It suppresses intermediate drawing for speed, so this is automated browser coverage, not 120 manual real-time playthroughs. Real-time standalone visual checks supplement it. This does not establish that every possible shot or device is bug-free.

To reproduce: run the standalone builder and `node tests/production.test.cjs`. Run `node scripts/serve.cjs`, open `http://127.0.0.1:4186/qa-physics.html`, and choose **Run all 120 levels**. The QA routes are local-server fixtures and are not published in the game.
