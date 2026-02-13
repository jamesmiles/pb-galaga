# PB-Galaga Data Model

## Overview

The PB-Galaga data model defines the game state structures that persist throughout gameplay. All game state is client-side and managed in memory using a double-buffered approach for smooth interpolation.

### Storage Locations

1. **In-Memory Game State**: Primary game data (current and previous buffers)
2. **Local Storage**: Optional persistence for high scores and settings
3. **Asset Files**: Sprites, sounds, and animations loaded at startup

## Schemas

### Game State Schema

The top-level game state container:

```typescript
interface GameState {
  // Meta information
  currentTime: number;
  deltaTime: number;
  gameMode: 'single' | 'co-op';
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete';
  
  // Level information
  currentLevel: number;
  currentWave: number;
  waveStatus: 'active' | 'complete' | 'transition';
  
  // Player states
  players: Player[];
  
  // Active game objects
  enemies: Enemy[];
  projectiles: Projectile[];
  powerups: Powerup[];
  
  // Environment
  background: BackgroundState;
  
  // UI state
  menu: MenuState | null;
}
```

### Player Schema

```typescript
interface Player {
  id: 'player1' | 'player2';
  shipColor: 'red' | 'blue';
  
  // Position and movement
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  
  // Status
  isAlive: boolean;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  
  // Stats
  lives: number;
  score: number;
  health: number;
  maxHealth: number;
  
  // Abilities
  fireMode: 'normal' | 'rapid' | 'spread';
  fireCooldown: number;
  powerupActive: PowerupType | null;
  powerupTimer: number;
  
  // State
  isThrusting: boolean;
  isFiring: boolean;
  collisionState: 'none' | 'colliding' | 'destroyed';
  
  // Input (for current frame)
  input: PlayerInput;
}

interface Vector2D {
  x: number;
  y: number;
}

interface PlayerInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
}
```

### Enemy Schema

```typescript
interface Enemy {
  id: string;
  type: 'A' | 'B' | 'C';
  
  // Position and movement
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  
  // Path following
  path: FlightPath | null;
  pathProgress: number;
  
  // Status
  isAlive: boolean;
  health: number;
  maxHealth: number;
  
  // Behavior
  fireMode: 'none' | 'laser' | 'bullet';
  fireCooldown: number;
  fireRate: number;
  
  // State
  isThrusting: boolean;
  isFiring: boolean;
  collisionState: 'none' | 'colliding' | 'destroyed';
  
  // Scoring
  scoreValue: number;
}

interface FlightPath {
  points: Vector2D[];
  duration: number;
  loop: boolean;
}
```

### Projectile Schema

```typescript
interface Projectile {
  id: string;
  type: 'laser' | 'bullet' | 'rocket' | 'missile' | 'plasma';
  owner: ProjectileOwner;
  
  // Position and movement
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  speed: number;
  
  // Properties
  damage: number;
  isActive: boolean;
  lifetime: number;
  maxLifetime: number;
  
  // Collision
  collisionRadius: number;
  hasCollided: boolean;
}

type ProjectileOwner = 
  | { type: 'player'; id: 'player1' | 'player2' }
  | { type: 'enemy'; id: string };
```

### Powerup Schema

```typescript
type PowerupType = 'health' | 'shield' | 'firepower' | 'stealth';

interface Powerup {
  id: string;
  type: PowerupType;
  
  // Position
  position: Vector2D;
  velocity: Vector2D;
  
  // Status
  isActive: boolean;
  lifetime: number;
  
  // Properties
  duration: number; // Effect duration once collected
  value: number; // Magnitude of effect
}
```

### Background State Schema

```typescript
interface BackgroundState {
  stars: Star[];
  scrollSpeed: number;
}

interface Star {
  position: Vector2D;
  depth: number; // For parallax effect (0.0 - 1.0)
  size: number;
  brightness: number;
}
```

### Menu State Schema

```typescript
interface MenuState {
  type: 'start' | 'pause' | 'gameover' | 'levelcomplete';
  selectedOption: number;
  options: string[];
  data?: {
    finalScore?: number;
    level?: number;
    wave?: number;
  };
}
```

### Level Configuration Schema

```typescript
interface LevelConfig {
  levelNumber: number;
  name: string;
  waves: WaveConfig[];
  backgroundTheme: string;
  musicTrack: string;
}

interface WaveConfig {
  waveNumber: number;
  enemies: EnemySpawnConfig[];
  delay: number; // Delay before wave starts
}

interface EnemySpawnConfig {
  type: 'A' | 'B' | 'C';
  count: number;
  formation: FormationType;
  path: FlightPath;
  spawnDelay: number; // Stagger spawn timing
}

type FormationType = 'line' | 'v-formation' | 'swarm' | 'grid';
```

## Invariants

### Core Invariants

1. **Double Buffer Consistency**
   - Previous state must be a complete snapshot of the last frame
   - Current state is the only mutable state
   - Buffer swap occurs exactly once per game loop iteration

2. **Player Constraints**
   - Lives: 0 ≤ lives ≤ 5
   - Health: 0 ≤ health ≤ maxHealth
   - Score: score ≥ 0 (monotonically increasing)
   - Position: Must be within game boundaries
   - Single player mode: Only player1 exists
   - Co-op mode: Both player1 and player2 exist

3. **Enemy Constraints**
   - Health: 0 ≤ health ≤ maxHealth
   - Type A enemies never fire
   - Type B enemies use laser projectiles only
   - Type C enemies use bullet projectiles only
   - Destroyed enemies are removed from state

4. **Projectile Constraints**
   - lifetime ≤ maxLifetime
   - Projectiles exceeding lifetime are removed
   - Collided projectiles are removed immediately
   - Player projectiles cannot hit players
   - Enemy projectiles cannot hit enemies

5. **Collision Constraints**
   - Player-enemy collision: Both take damage
   - Projectile-target collision: Target takes damage, projectile destroyed
   - Player-powerup collision: Effect applied, powerup removed
   - No collision between same-faction entities

6. **Wave Progression**
   - Wave completes only when all wave enemies are destroyed
   - Level completes only when all waves are complete
   - New wave cannot start while current wave is active

### State Transition Rules

```
menu → playing: Start game selected
playing → paused: Pause input received
paused → playing: Resume selected
playing → gameover: All players have 0 lives
playing → levelcomplete: All level waves complete
levelcomplete → playing: Next level selected
gameover → menu: Return to menu selected
```

## Validation

### Compile-Time Validation

1. **TypeScript Type Checking**
   - All interfaces enforced at compile time
   - Type safety for state transitions
   - IDE autocomplete and error detection

2. **Enumeration Constraints**
   - Game mode must be 'single' or 'coop'
   - Game status must be valid state
   - Enemy types must be 'A', 'B', or 'C'
   - Powerup types must be defined types

### Runtime Validation

1. **Boundary Checking**
   ```typescript
   function validatePosition(pos: Vector2D, bounds: Bounds): boolean {
     return pos.x >= bounds.minX && pos.x <= bounds.maxX &&
            pos.y >= bounds.minY && pos.y <= bounds.maxY;
   }
   ```

2. **Range Validation**
   ```typescript
   function validatePlayerState(player: Player): boolean {
     return player.lives >= 0 && player.lives <= 5 &&
            player.health >= 0 && player.health <= player.maxHealth &&
            player.score >= 0;
   }
   ```

3. **Collision Validation**
   ```typescript
   function validateCollision(obj1: GameObject, obj2: GameObject): boolean {
     const distance = calculateDistance(obj1.position, obj2.position);
     return distance < (obj1.collisionRadius + obj2.collisionRadius);
   }
   ```

### Test Validation

1. **State Consistency Tests**
   - Verify buffer swap correctness
   - Check state immutability between frames
   - Validate interpolation calculations

2. **Invariant Tests**
   - Assert all invariants after each game loop iteration
   - Test boundary conditions
   - Verify state transitions

3. **Integration Tests**
   - Test complete game flows
   - Validate wave progression
   - Check game over conditions
   - Verify scoring logic

## Data Persistence

### Local Storage Schema

```typescript
interface PersistentData {
  highScores: HighScore[];
  settings: GameSettings;
}

interface HighScore {
  score: number;
  playerCount: number;
  date: string; // ISO 8601 format (e.g., "2026-02-13T11:45:05.897Z")
  level: number;
}

interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  controlScheme: 'arrows' | 'wasd';
}
```

### Asset Loading

Assets are loaded at initialization and cached:

1. **Sprite Sheets**: PNG files with JSON manifests
2. **Sound Effects**: MP3/OGG files
3. **Animations**: JSON configurations
4. **Level Data**: JSON configuration files

No runtime asset loading or dynamic asset generation required.
