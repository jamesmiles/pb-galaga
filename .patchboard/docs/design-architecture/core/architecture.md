# PB-Galaga Architecture

## Overview

PB-Galaga is a modern browser-based arcade game inspired by classic space shooters. The game is built with a test-first approach, emphasizing clean separation of concerns between game logic, state management, and rendering.

### Key Principles

1. **Browser-First**: The game runs entirely in the browser/client with no server dependencies
2. **Fixed Time Step Engine**: Uses a 'Fixed time step with synchronization' game loop for consistent physics and gameplay
3. **Headless Capable**: Game loop (engine) and game state are decoupled from the renderer, enabling headless testing
4. **Double Buffered State**: Game state is double buffered (current and previous) to enable interpolation and reduce perceived lag
5. **Test Harness Driven**: All game object types have isolated test harnesses for comprehensive testing
6. **Multiplayer Ready**: Supports both single player and two player co-op modes
7. **Test-First Engineering**: Test scripts and AI can advance the game loop independently of rendering

### Visual Design

The game has a modern pixel-art arcade aesthetic, combining retro gameplay with contemporary visual polish.

## Core Modules

### 1. Engine Module (`/engine`)

The engine module contains the core game systems:

- **Game Loop**: Fixed time step loop with synchronization
- **Game Manager**: Orchestrates game state transitions and lifecycle
- **Menu Systems**: Start menu, pause menu, game over screen, level complete screen
- **State Manager**: Manages double-buffered game state (current/previous)
- **Input Handler**: Processes player input for single and two-player modes

### 2. Game Objects Module (`/objects`)

Game objects are organized by type with self-contained resources:

```
/objects
  /[object-type]
    /sounds/*
    /animations/*
    /code/*
```

#### Object Categories

**Player Ships**
- Red ship (Player 1)
- Blue ship (Player 2)
- Features: thrusters, fire modes, power up modes
- Collision detection and destruction sequences
- Lives system (starts with 3 lives)
- Score accumulation

**Enemies**
- Type A: Non-firing alien transport
- Type B: Slow fighter with laser projectile
- Type C: Mobile fighter with bullet projectile
- Features: thrusters, fire modes
- Destruction sequences and scoring

**Projectiles**
- Lasers (player and enemy)
- Bullets
- Rockets
- Missiles
- Plasma
- Collision detection and effects

**Power-ups**
- Health restoration
- Shield enhancement
- Firepower upgrades
- Stealth mode

**Environment Objects**
- Background stars (parallax scrolling)
- Asteroids
- Bosses (future enhancement)
- Foreground/background effects

### 3. Levels Module (`/levels`)

Level definitions contain:
- Enemy wave configurations
- Enemy flight paths and formations
- Level-specific content (backgrounds, foregrounds, effects)
- Progression logic and win conditions

### 4. Renderer Module

Built on Phaser (latest version):
- "Dumb" renderer that visualizes game state
- Interpolates between current and previous state for smooth animation
- Handles sprite rendering, animations, and effects
- Can be completely disabled for headless testing

### 5. Test Harness System

Each game object type has an isolated test harness:
- Runs objects in an isolated instance of engine, state, and renderer
- Test menus for exploring all modes and animations
- Supports both rendered and headless testing
- Enables comprehensive validation without full game integration

## Data Flow

### Game Loop

```
┌─────────────────────────────────────────────┐
│  Fixed Time Step Loop (e.g., 60 FPS)        │
│  ┌───────────────────────────────────────┐  │
│  │ 1. Process Input                      │  │
│  │ 2. Update Game State (Fixed Delta)   │  │
│  │ 3. Swap Buffers (Previous ← Current) │  │
│  │ 4. Collision Detection                │  │
│  │ 5. State Transitions                  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Render Loop (Variable Frame Rate)          │
│  ┌───────────────────────────────────────┐  │
│  │ 1. Calculate Interpolation Alpha      │  │
│  │ 2. Interpolate State (Prev → Current) │  │
│  │ 3. Render Interpolated State          │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### State Management

**Double Buffering**:
- Current State: Active game state being updated
- Previous State: Last complete state (for interpolation)
- States contain: player positions, enemy positions, projectiles, scores, lives, level progress

### Key Scenarios

**Player Movement**:
Input → Input Handler → Game State Update → State Buffer Swap → Render Interpolation

**Projectile Collision**:
Collision Detection → State Update (damage/destruction) → Score Update → Destruction Sequence → Render

**Level Progression**:
Wave Defeat → Level Manager → Next Wave/Level Complete → State Transition → Menu Display

**Game Over**:
Player Death (Lives = 0) → Game Manager → Game Over State → Menu Display → Restart Option

## Directory Structure

```
pb-galaga/
├── src/
│   ├── engine/
│   │   ├── GameLoop.ts
│   │   ├── GameManager.ts
│   │   ├── StateManager.ts
│   │   ├── InputHandler.ts
│   │   └── menus/
│   │       ├── StartMenu.ts
│   │       ├── PauseMenu.ts
│   │       ├── GameOverMenu.ts
│   │       └── LevelCompleteMenu.ts
│   ├── objects/
│   │   ├── player/
│   │   │   ├── code/
│   │   │   ├── animations/
│   │   │   └── sounds/
│   │   ├── enemies/
│   │   │   ├── enemyA/
│   │   │   ├── enemyB/
│   │   │   └── enemyC/
│   │   ├── projectiles/
│   │   │   ├── laser/
│   │   │   └── bullet/
│   │   └── powerups/
│   ├── levels/
│   │   ├── level1.ts
│   │   └── waveConfigs.ts
│   ├── renderer/
│   │   ├── PhaserRenderer.ts
│   │   └── RenderUtils.ts
│   └── harness/
│       ├── HarnessBase.ts
│       ├── PlayerHarness.ts
│       ├── EnemyHarness.ts
│       └── ProjectileHarness.ts
├── tests/
├── assets/
│   ├── sprites/
│   ├── sounds/
│   └── animations/
└── public/
```

## Security Model

As a browser-only game, security considerations are minimal:
- No authentication or authorization required
- No sensitive data handling
- All game state is client-side
- No external API dependencies

## Operational Model

### Deployment
- Static site hosting (GitHub Pages, Netlify, Vercel, etc.)
- Simple build process (TypeScript compilation + asset bundling)
- No runtime dependencies or backend services

### Testing Strategy
- Unit tests for game logic (headless mode)
- Integration tests using test harnesses
- Visual regression testing for rendering
- Automated test scripts that drive the game loop
- AI-driven validation of game state

### Performance Targets
- Maintain 60 FPS game loop
- Smooth rendering through interpolation
- Efficient collision detection
- Memory-efficient sprite management

## Development Roadmap

### Sprint 1 (Core Functionality)
- Core game engine, state management, and renderer
- Player ship (red) with movement and controls
- Player laser projectile with collision
- Enemy Type A (non-firing transport)
- Start game menu with controls info
- Simple level 1 with enemy swarm
- Player lives system (3 lives)
- Player score system
- Background stars with parallax
- Game over sequence
- Test harnesses for player, laser, and enemy A

### Sprint 2 (Multiplayer & Content)
- Two player (blue ship) support with controls
- Enemy Type B (slow fighter with laser)
- Bullet projectile
- Enemy Type C (mobile fighter with bullets)
- Expanded level 1 with multiple waves
- Level complete sequence

## Design Decisions

### ADR-001: Fixed Time Step with Interpolation
**Decision**: Use fixed time step for game logic with interpolated rendering  
**Rationale**: Ensures consistent physics and gameplay across different frame rates while maintaining smooth visual appearance

### ADR-002: Double Buffered State
**Decision**: Maintain current and previous game state  
**Rationale**: Enables smooth interpolation in renderer without coupling rendering frame rate to game logic update rate

### ADR-003: Headless Testing Capability
**Decision**: Complete decoupling of game logic from rendering  
**Rationale**: Allows comprehensive automated testing, AI validation, and faster test execution

### ADR-004: Test Harness for Each Object Type
**Decision**: Create isolated test environments for all game objects  
**Rationale**: Enables thorough testing of all object modes, animations, and behaviors without requiring full game integration

### ADR-005: Phaser for Rendering Only
**Decision**: Use Phaser as a "dumb" rendering layer  
**Rationale**: Leverages Phaser's robust sprite and animation capabilities while maintaining clean architecture and testability
