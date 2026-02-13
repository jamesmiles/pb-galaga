// PB-Galaga Data Model
// All TypeScript interfaces from the architecture data model.

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

// --- Player ---

export interface PlayerInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
}

export type PlayerId = 'player1' | 'player2';
export type ShipColor = 'red' | 'blue';
export type FireMode = 'normal' | 'rapid' | 'spread';
export type CollisionState = 'none' | 'colliding' | 'destroyed';

export interface Player {
  id: PlayerId;
  shipColor: ShipColor;

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

  fireMode: FireMode;
  fireCooldown: number;
  powerupActive: PowerupType | null;
  powerupTimer: number;

  isThrusting: boolean;
  isFiring: boolean;
  collisionState: CollisionState;

  input: PlayerInput;
}

// --- Enemy ---

export type EnemyType = 'A' | 'B' | 'C';
export type EnemyFireMode = 'none' | 'laser' | 'bullet';

export interface FlightPath {
  points: Vector2D[];
  duration: number;
  loop: boolean;
}

export interface Enemy {
  id: string;
  type: EnemyType;

  position: Vector2D;
  velocity: Vector2D;
  rotation: number;

  path: FlightPath | null;
  pathProgress: number;

  isAlive: boolean;
  health: number;
  maxHealth: number;

  fireMode: EnemyFireMode;
  fireCooldown: number;
  fireRate: number;

  isThrusting: boolean;
  isFiring: boolean;
  collisionState: CollisionState;

  scoreValue: number;
  collisionRadius: number;
}

// --- Projectile ---

export type ProjectileType = 'laser' | 'bullet' | 'rocket' | 'missile' | 'plasma';

export type ProjectileOwner =
  | { type: 'player'; id: PlayerId }
  | { type: 'enemy'; id: string };

export interface Projectile {
  id: string;
  type: ProjectileType;
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

export type MenuType = 'start' | 'pause' | 'gameover' | 'levelcomplete';

export interface MenuState {
  type: MenuType;
  selectedOption: number;
  options: string[];
  data?: {
    finalScore?: number;
    level?: number;
    wave?: number;
  };
}

// --- Level ---

export type FormationType = 'line' | 'v-formation' | 'swarm' | 'grid';

export interface EnemySpawnConfig {
  type: EnemyType;
  count: number;
  formation: FormationType;
  path: FlightPath;
  spawnDelay: number;
}

export interface WaveConfig {
  waveNumber: number;
  enemies: EnemySpawnConfig[];
  delay: number;
}

export interface LevelConfig {
  levelNumber: number;
  name: string;
  waves: WaveConfig[];
  backgroundTheme: string;
  musicTrack: string;
}

// --- Game State ---

export type GameMode = 'single' | 'co-op';
export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete';
export type WaveStatus = 'active' | 'complete' | 'transition';

export interface GameState {
  currentTime: number;
  deltaTime: number;
  gameMode: GameMode;
  gameStatus: GameStatus;

  currentLevel: number;
  currentWave: number;
  waveStatus: WaveStatus;

  players: Player[];
  enemies: Enemy[];
  projectiles: Projectile[];
  powerups: Powerup[];

  background: BackgroundState;
  menu: MenuState | null;
}
