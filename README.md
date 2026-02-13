# PB-Galaga

A modern browser-based arcade space shooter with pixel-art aesthetics, inspired by classic games like Galaga.

## Overview

PB-Galaga is a test-driven, browser-based game built with a fixed time-step engine and clean separation between game logic and rendering. The game features single-player and two-player co-op modes, multiple enemy types, various projectile systems, and power-ups.

## Key Features

- **Fixed Time Step Engine**: Consistent gameplay across different frame rates
- **Double Buffered State**: Smooth rendering with interpolation
- **Headless Testing**: Game logic completely decoupled from rendering
- **Test Harnesses**: Isolated testing environments for all game objects
- **Co-op Mode**: Support for two-player cooperative gameplay
- **Modern Pixel Art**: Retro aesthetic with contemporary polish

## Architecture

For detailed architecture documentation, see:

- [Architecture Overview](.patchboard/docs/design-architecture/core/architecture.md)
- [System Context](.patchboard/docs/design-architecture/core/system-context.md)
- [Data Model](.patchboard/docs/design-architecture/core/data-model.md)

## Development Status

Currently in planning phase with architecture documentation complete.

### Planned Sprints

**Sprint 1**: Core engine, single player, basic enemies, first level  
**Sprint 2**: Two-player co-op, additional enemy types, expanded levels

## Technology Stack

- **Language**: TypeScript
- **Rendering**: Phaser (latest)
- **Testing**: Headless game mode with automated test scripts
- **Deployment**: Static site hosting (browser-only, no backend)

## Project Structure

```
pb-galaga/
├── src/
│   ├── engine/        # Game loop, state management, menus
│   ├── objects/       # Players, enemies, projectiles, power-ups
│   ├── levels/        # Level configurations and wave definitions
│   ├── renderer/      # Phaser rendering layer
│   └── harness/       # Test harnesses for game objects
├── tests/             # Automated tests
├── assets/            # Sprites, sounds, animations
└── public/            # Static files for deployment
```

## License

TBD