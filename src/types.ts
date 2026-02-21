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

// --- Episode ---

export type Episode = 1 | 2;

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

export interface PlayerStats {
  kills: number;
  deaths: number;
  powerupsCollected: number;
  respawns: number;
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
  primaryWeapon: 'laser' | 'bullet' | 'cannon' | 'plasma-artillery';
  primaryLevel: 1 | 2 | 3 | 4 | 5;
  secondaryWeapon: 'rocket' | 'missile' | null;
  secondaryTimer: number;
  secondaryCooldown: number;
  fireCooldown: number;
  isThrusting: boolean;
  isFiring: boolean;
  collisionState: 'none' | 'colliding' | 'destroyed';
  input: PlayerInput;
  deathSequence: DeathSequence | null;
  stats: PlayerStats;
  levelStats: PlayerStats;
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
  type: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  isAlive: boolean;
  health: number;
  maxHealth: number;
  fireMode: 'none' | 'laser' | 'bullet' | 'plasma' | 'spread' | 'homing';
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
  type: 'laser' | 'bullet' | 'rocket' | 'missile' | 'plasma' | 'snake' | 'cannon-shell' | 'plasma-bolt';
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
  // Optional fields for acceleration/homing behavior
  acceleration?: number;
  maxSpeed?: number;
  turnRate?: number;
  isHoming?: boolean;
  homingDelay?: number;
  arcGravity?: number;          // Downward acceleration for arc trajectory (Episode 2)
  elevation?: number;           // Elevation at spawn (from firing tank's elevation)
}

// --- Boss ---

export interface BossTurret {
  id: string;
  position: Vector2D;       // Absolute position (updated from boss center + offset)
  offsetX: number;           // Relative to boss center
  offsetY: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  fireCooldown: number;
  fireRate: number;
  collisionRadius: number;
  fireType: 'bullet' | 'rocket' | 'homing'; // What projectile this turret fires
}

export interface BossDeathSequence {
  phase: number;             // 0-4 (turrets 0-3, then bridge=4)
  timer: number;
  phaseDuration: number;
}

export interface CollisionZone {
  offsetX: number;           // Relative to boss center
  offsetY: number;
  width: number;
  height: number;
}

export interface BossState {
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  isAlive: boolean;
  health: number;
  maxHealth: number;
  turrets: BossTurret[];
  layer: 'entering' | 'active' | 'dying';
  deathSequence: BossDeathSequence | null;
  scoreValue: number;
  upperCollisionZones: CollisionZone[];
}

// --- Life Pickup ---

export interface LifePickup {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  isActive: boolean;
  lifetime: number;
}

// --- Respawn Pickup (co-op) ---

export interface RespawnPickup {
  id: string;
  targetPlayerId: 'player1' | 'player2';
  position: Vector2D;
  velocity: Vector2D;
  isActive: boolean;
  lifetime: number;
}

// --- Weapon Pickup ---

export interface WeaponPickup {
  id: string;
  category: 'primary' | 'secondary';
  currentWeapon: 'laser' | 'bullet' | 'rocket' | 'missile' | 'cannon' | 'plasma-artillery' | 'armour';
  position: Vector2D;
  velocity: Vector2D;
  isActive: boolean;
  cycleTimer: number;
  lifetime: number;
}

// --- Asteroid ---

export interface Asteroid {
  id: string;
  size: 'small' | 'large';
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  rotationSpeed: number;
  health: number;
  maxHealth: number;
  collisionRadius: number;
  isAlive: boolean;
  scoreValue: number;
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

// --- Tank (Episode 2) ---

export interface TankState {
  heading: number;              // Tank body angle in radians (0 = east, PI/2 = north)
  turretAngle: number;          // Computed turret angle (derived from heading)
  turretTargetAngle: number;    // Desired turret angle (smooth rotation target)
  turretRecoil: number;         // 0..1 recoil animation progress
  speed: number;                // Current forward speed (can be negative for reverse)
  turnRate: number;             // Radians per second
  acceleration: number;         // px/s^2
  maxSpeed: number;             // px/s forward
  reverseMaxSpeed: number;      // px/s backward
  friction: number;             // Deceleration when no input
  elevation: number;            // 0 = low ground, 1 = high ground, fractional on ramps
  targetEnemyId: string | null; // Locked-on enemy ID (sticky targeting)
}

// --- Cliff Terrain (Episode 2) ---

export type CliffTileType =
  | 'edge-north' | 'edge-south' | 'edge-east' | 'edge-west'
  | 'corner-ne-convex' | 'corner-nw-convex' | 'corner-se-convex' | 'corner-sw-convex'
  | 'corner-ne-concave' | 'corner-nw-concave' | 'corner-se-concave' | 'corner-sw-concave'
  | 'ramp-south-north' | 'ramp-east-west' | 'ramp-west-east'
  | 'surface';

export interface CliffTile {
  col: number;
  row: number;
  type: CliffTileType;
}

export interface CliffStructure {
  id: string;
  position: Vector2D;           // World position of top-left corner of tile grid
  tiles: CliffTile[];
}

// --- Map (Episode 2) ---

export interface MapObject {
  id: string;
  type: 'boulder' | 'destructible-rock' | 'decoration' | 'dust-patch';
  position: Vector2D;           // World coordinates
  width: number;
  height: number;
  health?: number;
  maxHealth?: number;
  collisionRadius?: number;     // Only for collidable objects
  sprite: string;               // Key into sprite lookup (e.g. 'rocks-1')
  rotation?: number;
}

export interface CloudOverlay {
  id: string;
  position: Vector2D;           // World coordinates
  width: number;
  height: number;
  speed: number;                // Horizontal drift speed (negative = left)
  alpha: number;
  sprite: string;               // 'cloud-1' through 'cloud-4'
}

export interface DustEffect {
  id: string;
  position: Vector2D;
  width: number;
  height: number;
  speed: number;
  alpha: number;
  sprite: string;               // 'dust-cloud-1' through 'dust-swirl-4'
}

// --- Map Enemies (Episode 2) ---

export type MapEnemyType = 'gun-nest' | 'turret' | 'popup-mine'
  | 'rocket-copter' | 'laser-copter' | 'spread-bomber' | 'homing-bomber' | 'hover-tank';

export interface MapEnemyPlacement {
  id: string;
  type: MapEnemyType;
  position: Vector2D;           // World coordinates
  elevation: number;            // 0 = low ground, 1 = on cliff
}

export interface MapEnemy {
  id: string;
  type: MapEnemyType;
  position: Vector2D;
  elevation: number;
  isAlive: boolean;
  health: number;
  maxHealth: number;
  collisionRadius: number;
  scoreValue: number;
  // Turret/aim state
  aimAngle: number;             // Current turret direction (radians)
  fireCooldown: number;         // ms remaining until next shot
  fireRate: number;             // ms between shots
  // Popup mine state
  isActivated: boolean;
  activationRange: number;      // Proximity trigger distance (px)
  dormantTimer: number;         // ms until auto-activate
  popupProgress: number;        // 0..1 animation (0=buried, 1=up)
  burstFired: boolean;          // Has radial burst been fired this cycle?
  cooldownTimer: number;        // ms remaining after burst
  // Mobile enemy fields (copters, bombers, hover-tank)
  velocity?: Vector2D;
  patrolMinX?: number;
  patrolMaxX?: number;
  isAerial?: boolean;
  behaviorState?: 'patrol' | 'engage' | 'flythrough' | 'returning';
  spawnY?: number;               // Original Y for bomber re-entry
  moveSpeed?: number;
}

export interface MapConfig {
  totalHeight: number;          // Total map height in pixels
  surfaceTexture: string;       // e.g. 'mars-surface'
  startPosition: Vector2D;      // Player start in world coords
  finishLineY: number;          // World Y coordinate of finish line
  objects: MapObject[];
  clouds: CloudOverlay[];
  dustEffects: DustEffect[];
  cliffs?: CliffStructure[];    // Cliff terrain structures (Episode 2)
  enemyPlacements?: MapEnemyPlacement[];  // Static enemy positions (Episode 2)
}

// --- Camera (Episode 2) ---

export interface CameraState {
  worldY: number;               // Top of viewport in world coordinates
  targetY: number;              // Where camera wants to be
  worldX: number;               // Left edge of viewport in world coordinates
  targetX: number;              // Where camera wants to be horizontally
  smoothSpeed: number;          // Lerp factor for smooth following
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
  type: 'start' | 'pause' | 'gameover' | 'levelcomplete' | 'levelselect' | 'levelintro' | 'gamecomplete' | 'difficulty' | 'levelstats' | 'playercount';
  selectedOption: number;
  options: string[];
  data?: {
    finalScore?: number;
    p2Score?: number;
    level?: number;
    wave?: number;
    introText?: string;
    introChars?: number;
    levelName?: string;
    testCoop?: boolean;
    pendingMode?: string;
    pendingEpisode?: Episode;
    p1LevelStats?: PlayerStats;
    p2LevelStats?: PlayerStats;
    p1GameStats?: PlayerStats;
    p2GameStats?: PlayerStats;
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

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete' | 'levelintro' | 'gamecomplete' | 'levelstats';
export type GameMode = 'single' | 'co-op';
export type GameDifficulty = 'normal' | 'chaos';

export interface GameState {
  currentTime: number;
  deltaTime: number;
  gameMode: GameMode;
  difficulty: GameDifficulty;
  gameStatus: GameStatus;
  currentLevel: number;
  currentWave: number;
  waveStatus: 'active' | 'complete' | 'transition' | 'clearing';
  players: Player[];
  enemies: Enemy[];
  projectiles: Projectile[];
  powerups: Powerup[];
  weaponPickups: WeaponPickup[];
  asteroids: Asteroid[];
  background: BackgroundState;
  formation: FormationState;
  menu: MenuState | null;
  boss: BossState | null;
  lifePickups: LifePickup[];
  respawnPickups: RespawnPickup[];
  autoFire: { p1: boolean; p2: boolean };
  // Episode 2 fields (null during Episode 1)
  episode: Episode;
  tankStates: Record<string, TankState> | null;
  map: MapConfig | null;
  camera: CameraState | null;
  mapEnemies: MapEnemy[] | null;
  // Pending impact effects queued by engine, consumed by renderer
  pendingImpacts: { x: number; y: number; id: string; type: 'cannon-shell' | 'plasma-bolt' }[];
}

// --- Level Config ---

export type FormationType = 'line' | 'v-formation' | 'swarm' | 'grid' | 'w-curve' | 'chiral' | 'diagonal' | 'side-wave' | 'm-shape' | 'inverted-v' | 'x-formation';

export interface LevelConfig {
  levelNumber: number;
  name: string;
  waves: WaveConfig[];
}

export interface WaveSlot {
  type: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  row: number;
  col: number;
}

export interface WaveConfig {
  waveNumber: number;
  enemies: EnemySpawnConfig[];
  delay: number;
  formation?: FormationType;  // Wave-level formation type (used with slots)
  slots?: WaveSlot[];         // Explicit enemy placement; overrides enemies array
  bossSpawn?: boolean;        // If true, spawn boss instead of formation enemies
}

export interface EnemySpawnConfig {
  type: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  count: number;
  formation: FormationType;
  rows: number;
  cols: number;
  spawnDelay: number;
}

// --- Episode Engine Interface ---

export interface EpisodeEngine {
  update(state: GameState, dtSeconds: number): void;
  render(ctx: CanvasRenderingContext2D, current: GameState, previous: GameState, alpha: number, renderDt: number): void;
  onLevelStart(state: GameState, level: number): void;
  onLevelComplete(state: GameState): void;
  detectDeaths?(current: GameState, particleSystem: any): void;
}

// --- Renderer Interface ---

export interface GameRenderer {
  render(current: GameState, previous: GameState, alpha: number): void;
  destroy(): void;
  setActiveEngine?(engine: EpisodeEngine): void;
}
