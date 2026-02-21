# Changelog

## v1.4.6
- Lower MP3 music volume to 80%

## v1.4.5
- Show level names in all intro screens ("Level N: Name")
- Central `LEVEL_NAMES` map replaces hardcoded strings
- Fix Level 6 rename to "Express Elevator" (overwritten by v1.4.4)

## v1.4.4
- Episode 2 weapon pickups and upgrades system
- Player death sequence and respawn for tank mode
- HUD fixes for Episode 2

## v1.2.2
- Rename Level 6 from "Mars Landing" to "Express Elevator"

## v1.2.1
- Add missing cannon & plasma SFX MP3s to dist/

## v1.2.0
- MP3 weapon SFX for tank cannon and plasma artillery (replaces procedural zzfx beep)
- SoundManager extended with MP3 SFX support via cached HTMLAudioElement
- Fix TypeScript: make SOUND_PRESETS Partial for MP3-only effects

## v1.1.29
- Sticky turret targeting system for Episode 2 co-op

## v1.1.27
- Enemy death explosions with particles
- Camera backtrack fix (allow limited reverse scrolling)
- Longer cannon range

## v1.1.26 (v1.1.28)
- Tank-to-tank collision prevention for Episode 2 co-op
- Oriented rectangle collision using projected half-extents
- 11 unit tests for collision system

## v1.1.25
- Cliff terrain system with elevation rendering and collision
- Episode 2 ground enemies: gun nests, turrets, popup mines
- Cliff-aware projectile collision

## v1.1.0
- MP3 music support for Episode 2 (HTMLAudioElement-based)
- Level 6 backing track: "Sector 9 Overdrive"
- Music starts during level intro sequence
- Vite publicDir config for static audio assets

## v1.0.20
- Episode 2 runtime engine for tank mode (Levels 6+)
- Tank physics: acceleration, friction, turning, reverse
- Tank turret with independent aiming and recoil
- Dual primary weapons: cannon (long range) and plasma artillery (short range, high damage)
- Camera system: smooth follow with vertical scrolling and horizontal panning
- Mars terrain rendering: ground tiles, dust clouds, boulders
- Tank trail effects: tread marks and dust particles
- Tank boss encounter
- Map system with scrolling world coordinates
- Armour system replaces shields for Episode 2
- Playtest bug fixes from v0.10.0

## v0.9.5
- Halve weapon pickup drop rate to 4%

## v0.9.4
- Rapid-fire snake laser weapon
- Weapon damage rebalance across all tiers

## v0.9.2
- Level 5 snake continuous stream weapon
- Bridge impact sound effect

## v0.9.1
- Bug fixes from v0.9.0 playtest

## v0.9.0
- Chaos mode difficulty option (2x enemies, tougher mini-boss)
- Auto-fire toggle
- Per-level and per-game stats tracking (kills, deaths, pickups)
- Level stats screen between levels
- Level 5 weapon upgrades (L5 bullet damage, snake radius)
