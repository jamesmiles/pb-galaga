// ============================================================
// PB-Galaga Data Model
// See: .patchboard/docs/design-architecture/core/data-model.md
// ============================================================

// --- Primitives ---

export interface Vector2D {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// --- Input ---

export interface PlayerInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
}

export interface MenuInput {
  up: boolean;
  down: boolean;
  confirm: boolean;
  back: boolean;
}

// --- Player ---

export interface DeathSequence {
  active: boolean;
  startTime: number;
  duration: number;
  position: Vector2D;
}

export interface Player {
  id: 'player1' | 'player2';
  shipColor: 'red' | 'blue';
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  isAlive: boolean;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  lives: number;
  score: number;
  health: number;
  maxHealth: number;
  fireMode: 'normal' | 'rapid' | 'spread';
  fireCooldown: number;
  isThrusting: boolean;
  isFiring: boolean;
  collisionState: 'none' | 'colliding' | 'destroyed';
  input: PlayerInput;
  deathSequence: DeathSequence | null;
}

// --- Enemy ---

export interface DiveState {
  phase: 'break' | 'approach' | 'sweep';
  progress: number;
  targetX: number;
  startPos: Vector2D;
}

export interface FlightPathState {
  progress: number;           // 0..1 along the bezier curve
  controlPoints: Vector2D[];  // Bezier control points for entry path
  targetSlot: Vector2D;       // Final formation position
  speed: number;              // Entry speed in pixels/sec
}

export interface Enemy {
  id: string;
  type: 'A' | 'B' | 'C' | 'D' | 'E';
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  isAlive: boolean;
  health: number;
  maxHealth: number;
  fireMode: 'none' | 'laser' | 'bullet' | 'plasma' | 'spread';
  fireCooldown: number;
  fireRate: number;
  isThrusting: boolean;
  isFiring: boolean;
  collisionState: 'none' | 'colliding' | 'destroyed';
  scoreValue: number;
  collisionRadius: number;
  // Formation slot (for Type A block formation)
  formationRow: number;
  formationCol: number;
  diveState: DiveState | null;
  flightPathState: FlightPathState | null;
}

// --- Projectile ---

export type ProjectileOwner =
  | { type: 'player'; id: 'player1' | 'player2' }
  | { type: 'enemy'; id: string };

export interface Projectile {
  id: string;
  type: 'laser' | 'bullet' | 'rocket' | 'missile' | 'plasma';
  owner: ProjectileOwner;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  speed: number;
  damage: number;
  isActive: boolean;
  lifetime: number;
  maxLifetime: number;
  collisionRadius: number;
  hasCollided: boolean;
}

// --- Powerup ---

export type PowerupType = 'health' | 'shield' | 'firepower' | 'stealth';

export interface Powerup {
  id: string;
  type: PowerupType;
  position: Vector2D;
  velocity: Vector2D;
  isActive: boolean;
  lifetime: number;
  duration: number;
  value: number;
}

// --- Background ---

export interface Star {
  position: Vector2D;
  depth: number;
  size: number;
  brightness: number;
}

export interface BackgroundState {
  stars: Star[];
  scrollSpeed: number;
}

// --- Menu ---

export interface MenuState {
  type: 'start' | 'pause' | 'gameover' | 'levelcomplete' | 'levelselect';
  selectedOption: number;
  options: string[];
  data?: {
    finalScore?: number;
    p2Score?: number;
    level?: number;
    wave?: number;
  };
}

// --- Formation ---

export interface FormationState {
  rows: number;
  cols: number;
  direction: 1 | -1; // 1 = right, -1 = left
  speed: number;
  baseSpeed: number;
  offsetX: number;
  offsetY: number;
  cellWidth: number;
  cellHeight: number;
  standoffY: number; // Y position where formation stops descending
}

// --- Game State ---

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete';
export type GameMode = 'single' | 'co-op';

export interface GameState {
  currentTime: number;
  deltaTime: number;
  gameMode: GameMode;
  gameStatus: GameStatus;
  currentLevel: number;
  currentWave: number;
  waveStatus: 'active' | 'complete' | 'transition';
  players: Player[];
  enemies: Enemy[];
  projectiles: Projectile[];
  powerups: Powerup[];
  background: BackgroundState;
  formation: FormationState;
  menu: MenuState | null;
}

// --- Level Config ---

export type FormationType = 'line' | 'v-formation' | 'swarm' | 'grid' | 'w-curve' | 'chiral' | 'diagonal' | 'side-wave' | 'm-shape' | 'inverted-v';

export interface LevelConfig {
  levelNumber: number;
  name: string;
  waves: WaveConfig[];
}

export interface WaveSlot {
  type: 'A' | 'B' | 'C' | 'D' | 'E';
  row: number;
  col: number;
}

export interface WaveConfig {
  waveNumber: number;
  enemies: EnemySpawnConfig[];
  delay: number;
  formation?: FormationType;  // Wave-level formation type (used with slots)
  slots?: WaveSlot[];         // Explicit enemy placement; overrides enemies array
}

export interface EnemySpawnConfig {
  type: 'A' | 'B' | 'C' | 'D' | 'E';
  count: number;
  formation: FormationType;
  rows: number;
  cols: number;
  spawnDelay: number;
}

// --- Renderer Interface ---

export interface GameRenderer {
  render(current: GameState, previous: GameState, alpha: number): void;
  destroy(): void;
}
