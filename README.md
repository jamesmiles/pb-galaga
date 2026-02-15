# PB-Galaga

A modern browser-based arcade space shooter with pixel-art aesthetics, inspired by classic games like Galaga.

## Overview

PB-Galaga is a test-driven, browser-based game built with a fixed time-step engine and clean separation between game logic and rendering. The game features single-player and two-player co-op modes, 5 levels, a boss fight, 6 enemy types, multiple weapon systems, and procedural chiptune music.

## Key Features

- **5 Levels**: From Earth orbit to the Mars colony, each with unique formations and backgrounds
- **Boss Fight**: Level 5 mothership with 6 turrets (bullet, rocket, homing), bridge fighters, and multi-phase death sequence
- **6 Enemy Types**: Type A through F with distinct behaviors — formation flyers, divers, bombers, stealth fighters
- **Weapon Systems**: Laser and bullet primaries (4 upgrade levels), rocket and homing missile secondaries, snake laser
- **Co-op Mode**: 2-player cooperative gameplay with split HUD
- **Procedural Audio**: ZzFX sound effects and ZzFXM chiptune music (zero audio assets)
- **Fixed Time Step Engine**: 60Hz physics with interpolated rendering
- **Headless Testing**: 379 tests — game logic completely decoupled from rendering

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Rendering**: Canvas 2D (no framework — 84 KB minified)
- **Audio**: ZzFX + ZzFXM (vendored, procedural synthesis)
- **Build**: Vite 7
- **Testing**: Vitest (unit) + Playwright (visual)
- **Dependencies**: Zero runtime dependencies

## Controls

| Action | Player 1 | Player 2 |
|--------|----------|----------|
| Move | Arrow keys | WASD |
| Fire | Spacebar | Q |
| Pause | Escape | Escape |
| Mute | M | M |

## Development

```bash
npm install        # Install dev dependencies
npm run dev        # Start dev server (localhost:3000)
npm run build      # TypeScript check + Vite production build
npm test           # Run all 379 unit tests
```

## Project Structure

```
pb-galaga/
├── src/
│   ├── engine/        # GameLoop, GameManager, StateManager, collision, levels
│   ├── objects/       # Players, enemies (A-F), projectiles, boss, environment
│   ├── levels/        # Level configs (1-5) with wave definitions
│   ├── renderer/      # Canvas2DRenderer, HUD, MenuOverlay, drawing/, effects/
│   ├── audio/         # SoundManager, MusicManager, ZzFX, ZzFXM
│   └── harness/       # SuperHarness (visual test harness)
├── tests/             # Playwright visual tests
├── dist/              # Production build output
└── screenshots/       # Gameplay screenshots
```

## Sprint History

| Sprint | Focus | Status |
|--------|-------|--------|
| E-0001 | Core engine, single player, basic enemies, Level 1 | Done |
| E-0002 | Co-op, enemy types B/C, Level 2, weapon pickups | Done |
| E-0003 | Engine V2 — Canvas 2D renderer replacing Phaser | Done |
| E-0004 | Level 2 polish, audio, visual effects, super harness | Done |
| E-0005 | Levels 3-4, enemy types D/E, asteroids, snake laser | Done |
| E-0006 | Audio system — ZzFX SFX + ZzFXM music, per-level tracks | Done |
| E-0007 | Level 5 boss fight, enemy F, game complete sequence | Done |

## License

MIT — see [LICENSE](LICENSE)
