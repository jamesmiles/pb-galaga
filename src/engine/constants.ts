// Version
export const GAME_VERSION = '1.2.2';

// Game loop timing
export const FIXED_TIMESTEP = 1000 / 60; // ~16.667ms per tick (60Hz)
export const MAX_ACCUMULATED = 250; // Spiral-of-death guard (ms)

// Game bounds (pixels)
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 800;
export const GAME_BOUNDS = {
  minX: 0,
  maxX: 800,
  minY: 0,
  maxY: 800,
} as const;

// Player defaults
export const PLAYER_START_LIVES = 3;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_SPEED = 300; // pixels per second
export const PLAYER_INVULNERABILITY_DURATION = 2000; // ms
export const PLAYER_COLLISION_RADIUS = 14;
export const PLAYER_FIRE_COOLDOWN = 200; // ms between shots

// Laser defaults
export const LASER_SPEED = 500; // pixels per second
export const LASER_DAMAGE = 40;
export const LASER_MAX_LIFETIME = 3000; // ms
export const LASER_COLLISION_RADIUS = 4;

// Enemy Type A defaults
export const ENEMY_A_HEALTH = 50;
export const ENEMY_A_SCORE_VALUE = 100;
export const ENEMY_A_COLLISION_RADIUS = 14;

// Enemy Type B defaults
export const ENEMY_B_HEALTH = 100;
export const ENEMY_B_SCORE_VALUE = 200;
export const ENEMY_B_COLLISION_RADIUS = 16;

// Enemy Type C defaults
export const ENEMY_C_HEALTH = 50;
export const ENEMY_C_SCORE_VALUE = 150;
export const ENEMY_C_COLLISION_RADIUS = 12;

// Enemy Type D defaults (Curved Fighter)
export const ENEMY_D_HEALTH = 75;
export const ENEMY_D_SCORE_VALUE = 250;
export const ENEMY_D_COLLISION_RADIUS = 14;

// Enemy Type E defaults (Strategic Bomber)
export const ENEMY_E_HEALTH = 150;
export const ENEMY_E_SCORE_VALUE = 300;
export const ENEMY_E_COLLISION_RADIUS = 18;

// Enemy Type F defaults (Stealth Bomber)
export const ENEMY_F_HEALTH = 125;
export const ENEMY_F_SCORE_VALUE = 350;
export const ENEMY_F_COLLISION_RADIUS = 16;

// Enemy Type G defaults (Mini-Boss — scaled-up stealth bomber)
export const ENEMY_G_HEALTH = 1250; // 10x normal F health
export const ENEMY_G_SCORE_VALUE = 1000;
export const ENEMY_G_COLLISION_RADIUS = 40; // ~2.5x F radius

// Enemy homing missile defaults (enemy-fired)
export const ENEMY_HOMING_SPEED = 200;
export const ENEMY_HOMING_TURN_RATE = 2.5; // rad/s
export const ENEMY_HOMING_DAMAGE = 40;
export const ENEMY_HOMING_MAX_LIFETIME = 5000; // ms
export const ENEMY_HOMING_COLLISION_RADIUS = 4;

// Formation defaults
export const FORMATION_BASE_SPEED = 60; // pixels per second
export const FORMATION_CELL_WIDTH = 48;
export const FORMATION_CELL_HEIGHT = 40;
export const FORMATION_SPEED_INCREASE = 1.5; // multiplier when enemies destroyed
export const FORMATION_STEP_DOWN = 20; // pixels to descend on direction change

// Bullet defaults (enemy)
export const BULLET_SPEED = 260; // pixels per second (was 200, +30%)
export const BULLET_DAMAGE = 50;
export const BULLET_MAX_LIFETIME = 3000; // ms
export const BULLET_COLLISION_RADIUS = 3;

// Player bullet defaults
export const PLAYER_BULLET_SPEED = 550; // pixels per second (fastest)
export const PLAYER_BULLET_DAMAGE = 20; // least damage

// Plasma defaults
export const PLASMA_SPEED = 180; // pixels per second
export const PLASMA_DAMAGE = 75;
export const PLASMA_MAX_LIFETIME = 3000; // ms
export const PLASMA_COLLISION_RADIUS = 9; // was 6, +50% larger

// Rocket defaults (player secondary)
export const ROCKET_LAUNCH_SPEED = 200; // pixels per second (initial)
export const ROCKET_MAX_SPEED = 420; // pixels per second (after acceleration)
export const ROCKET_ACCELERATION = 400; // px/s²
export const ROCKET_DAMAGE = 40;
export const ROCKET_MAX_LIFETIME = 3000; // ms
export const ROCKET_COLLISION_RADIUS = 5;
export const ROCKET_FIRE_COOLDOWN = 500; // ms between secondary volleys

// Homing missile defaults (player secondary)
export const MISSILE_LAUNCH_SPEED = 150; // pixels per second (initial, slowest)
export const MISSILE_MAX_SPEED = 350; // pixels per second (after acceleration)
export const MISSILE_ACCELERATION = 350; // px/s²
export const MISSILE_DAMAGE = 10; // per missile (3 per volley = 30 total)
export const MISSILE_MAX_LIFETIME = 4000; // ms
export const MISSILE_COLLISION_RADIUS = 3;
export const MISSILE_TURN_RATE = 3.0; // rad/s
export const MISSILE_FIRE_COOLDOWN = 800; // ms between secondary volleys
export const MISSILE_HOMING_DELAY = 200; // ms before homing activates

// Snake laser defaults (level-4 rapid homing stream)
export const SNAKE_SPEED = 400; // pixels per second
export const SNAKE_DAMAGE = 15; // low per-shot, high fire rate
export const SNAKE_MAX_LIFETIME = 3000; // ms
export const SNAKE_COLLISION_RADIUS = 4; // small stream projectile
export const SNAKE_TURN_RATE = 2.0; // rad/s (gentle curves)
export const SNAKE_FIRE_COOLDOWN = 50; // ms (4x faster than normal 200ms)

// Level 5 weapon upgrades
export const PLAYER_BULLET_L5_DAMAGE = 25; // L5 bullet upgrade
export const SNAKE_L5_DAMAGE = 20; // upgraded stream damage
export const SNAKE_L5_COLLISION_RADIUS = 8; // 2x L4 radius
export const BULLET_L5_COLLISION_RADIUS = 6; // 2x normal (3)

// Chaos mode multipliers
export const CHAOS_ENEMY_MULTIPLIER = 2;
export const CHAOS_MINIBOSS_HEALTH_MULTIPLIER = 2;
export const CHAOS_MINIBOSS_FIRE_RATE_DIVISOR = 2;

// Asteroid defaults (Level 4 foreground)
export const ASTEROID_SMALL_HEALTH = 100;
export const ASTEROID_LARGE_HEALTH = 300;
export const ASTEROID_SMALL_RADIUS = 12;
export const ASTEROID_LARGE_RADIUS = 24;
export const ASTEROID_SMALL_SCORE = 50;
export const ASTEROID_LARGE_SCORE = 150;
export const ASTEROID_SPAWN_INTERVAL = 3000; // ms
export const ASTEROID_SPAWN_JITTER = 1000; // ms
export const ASTEROID_SPEED_MIN = 40; // px/s
export const ASTEROID_SPEED_MAX = 80; // px/s
export const ASTEROID_DAMAGE = 50;

// Weapon pickup defaults
export const WEAPON_PICKUP_DROP_CHANCE = 0.04; // 4% per enemy kill
export const WEAPON_PICKUP_CYCLE_INTERVAL = 5000; // ms between type flips
export const WEAPON_PICKUP_SPEED = 60; // px/s downward drift
export const WEAPON_PICKUP_LIFETIME = 10000; // ms
export const WEAPON_PICKUP_COLLISION_RADIUS = 12;
export const SECONDARY_WEAPON_DURATION = 15000; // ms (15 seconds)

// Boss defaults
export const BOSS_WIDTH = 720;
export const BOSS_HEIGHT = 200;
export const BOSS_HEALTH = 1000;
export const BOSS_TURRET_HEALTH = 400;
export const BOSS_TURRET_FIRE_RATE = 600; // ms (rapid fire)
export const BOSS_TURRET_COLLISION_RADIUS = 20;
export const BOSS_SCORE_VALUE = 5000;
export const BOSS_TURRET_SCORE_VALUE = 500;
export const BOSS_DEATH_PHASE_DURATION = 800; // ms per phase
export const BOSS_ROCKET_TURRET_HEALTH = 300;
export const BOSS_ROCKET_TURRET_FIRE_RATE = 1200; // ms
export const BOSS_ENTRY_SPEED = 30; // px/s
export const BOSS_FIGHTER_SPAWN_INTERVAL = 1333; // ms between bridge fighter launches

// Life pickup defaults
export const LIFE_DROP_CHANCE = 0.5; // 50% per level
export const LIFE_PICKUP_SPEED = 50; // px/s downward drift
export const LIFE_PICKUP_LIFETIME = 12000; // ms
export const LIFE_PICKUP_COLLISION_RADIUS = 10;

// Level clear delay
export const LEVEL_CLEAR_DELAY = 3000; // ms

// Level stats screen timing
export const LEVEL_STATS_MIN_INPUT_DELAY = 3000; // ms before confirm is accepted
export const LEVEL_STATS_TIMEOUT = 10000; // ms auto-advance

// Score
export const WAVE_COMPLETE_BONUS = 500;

// Death sequence
export const DEATH_SEQUENCE_DURATION = 2000; // ms

// Background
export const STAR_COUNT = 100;
export const STAR_BASE_SCROLL_SPEED = 30; // pixels per second

// ============================================================
// Episode 2 — Tank Mode (Levels 6-10)
// ============================================================

// Tank physics
export const TANK_TURN_RATE = 2.5;              // rad/s
export const TANK_ACCELERATION = 150;           // px/s^2
export const TANK_MAX_SPEED = 200;              // px/s forward
export const TANK_REVERSE_MAX_SPEED = 80;       // px/s backward
export const TANK_FRICTION = 120;               // px/s^2 deceleration when no input
export const TANK_COLLISION_RADIUS = 18;

// Tank dimensions (procedural drawing)
export const TANK_BODY_WIDTH = 32;
export const TANK_BODY_HEIGHT = 40;
export const TANK_TURRET_LENGTH = 26;
export const TANK_TURRET_RECOIL_DECAY = 5.0;   // 1/s (recoil decays from 1→0)

// Armour (replaces shields in Episode 2)
export const TANK_MAX_ARMOUR = 1000;
export const TANK_START_LIVES = 3;

// Cannon weapon (Player 1 primary — long range, moderate damage)
export const CANNON_FIRE_COOLDOWN = 2000;       // ms
export const CANNON_SPEED = 400;                // px/s
export const CANNON_DAMAGE = 80;
export const CANNON_RANGE = 400;                // ~1/2 screen (800px viewport)
export const CANNON_COLLISION_RADIUS = 6;

// Plasma artillery weapon (Player 2 primary — short range, high damage)
export const PLASMA_BOLT_FIRE_COOLDOWN = 2000;  // ms
export const PLASMA_BOLT_SPEED = 350;           // px/s
export const PLASMA_BOLT_DAMAGE = 120;
export const PLASMA_BOLT_RANGE = 267;           // ~1/3 screen (800px viewport)
export const PLASMA_BOLT_COLLISION_RADIUS = 8;

// Camera
export const CAMERA_SMOOTH_SPEED = 3.0;         // Lerp factor
export const CAMERA_PLAYER_ANCHOR_Y = 600;      // Players anchored near bottom of 800px viewport
export const CAMERA_MIN_BACKTRACK_SPEED = 20;   // px/s allowed backtracking

// Map
export const MAP_WIDTH = 800;                   // Same as game width
export const LEVEL6_MAP_WIDTH = 1200;           // 800 + 200 each side (25% wider)
export const LEVEL6_MAP_HEIGHT = 6400;          // 8x screen height

// Camera X
export const CAMERA_PLAYER_ANCHOR_X = 400;      // Center of 800px viewport

// Cliff terrain
export const CLIFF_TILE_SIZE = 128;             // px per tile (3x tank width)
export const CLIFF_ELEVATION_SCALE = 0.03;      // 3% visual scale increase at full elevation

// Episode 2 — Map Enemies
// Machine Gun Nest
export const GUN_NEST_HEALTH = 150;
export const GUN_NEST_FIRE_RATE = 300;          // ms between shots
export const GUN_NEST_DAMAGE = 15;
export const GUN_NEST_BULLET_SPEED = 280;       // px/s
export const GUN_NEST_COLLISION_RADIUS = 16;
export const GUN_NEST_SCORE_VALUE = 200;
export const GUN_NEST_AIM_SPEED = 2.0;          // rad/s turret rotation

// Turret (heavy)
export const TURRET_HEALTH = 250;
export const TURRET_FIRE_RATE = 2500;           // ms between shots
export const TURRET_DAMAGE = 60;
export const TURRET_PLASMA_SPEED = 200;         // px/s
export const TURRET_COLLISION_RADIUS = 20;
export const TURRET_SCORE_VALUE = 400;
export const TURRET_AIM_SPEED = 1.5;            // rad/s turret rotation

// Popup Mine
export const POPUP_MINE_HEALTH = 80;
export const POPUP_MINE_ACTIVATION_RANGE = 150; // px proximity trigger
export const POPUP_MINE_DORMANT_TIMER = 8000;   // ms random auto-activate
export const POPUP_MINE_BURST_PROJECTILES = 8;
export const POPUP_MINE_BURST_DAMAGE = 25;
export const POPUP_MINE_BURST_SPEED = 220;      // px/s
export const POPUP_MINE_POPUP_DURATION = 400;   // ms to fully pop up
export const POPUP_MINE_COOLDOWN = 5000;        // ms after burst before dormant
export const POPUP_MINE_COLLISION_RADIUS = 12;
export const POPUP_MINE_SCORE_VALUE = 150;

// Turret targeting (sticky lock-on)
export const TURRET_ACQUISITION_CONE = 0.35;    // rad (~20°) half-angle to acquire target
export const TURRET_RETENTION_CONE = 2.356;     // rad (~135°) half-angle to keep lock (270° total)
export const TURRET_MAX_TARGET_RANGE = 500;     // px max distance to acquire/retain
export const TURRET_TRACK_SPEED = 3.0;          // rad/s smooth turret rotation toward target
export const TURRET_ELEVATION_TOLERANCE = 0.5;  // Same as existing elevation checks

// Shared Episode 2 enemy constants
export const EP2_ENEMY_FIRE_RANGE = 600;        // px max distance to fire
export const EP2_ENEMY_PROJECTILE_LIFETIME = 4000; // ms
