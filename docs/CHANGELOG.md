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
