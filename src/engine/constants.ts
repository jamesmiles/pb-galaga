// Version
export const GAME_VERSION = '0.7.3';

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
export const LASER_DAMAGE = 50;
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
export const PLAYER_BULLET_DAMAGE = 25; // least damage

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

// Snake laser defaults (level-4 laser upgrade)
export const SNAKE_SPEED = 400; // pixels per second
export const SNAKE_DAMAGE = 75;
export const SNAKE_MAX_LIFETIME = 3000; // ms
export const SNAKE_COLLISION_RADIUS = 8;
export const SNAKE_TURN_RATE = 2.0; // rad/s (gentle curves)

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
export const WEAPON_PICKUP_DROP_CHANCE = 0.15; // 15% per enemy kill
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
export const BOSS_ENTRY_SPEED = 30; // px/s
export const BOSS_FIGHTER_SPAWN_INTERVAL = 1333; // ms between bridge fighter launches

// Life pickup defaults
export const LIFE_DROP_CHANCE = 0.5; // 50% per level
export const LIFE_PICKUP_SPEED = 50; // px/s downward drift
export const LIFE_PICKUP_LIFETIME = 12000; // ms
export const LIFE_PICKUP_COLLISION_RADIUS = 10;

// Level clear delay
export const LEVEL_CLEAR_DELAY = 3000; // ms

// Score
export const WAVE_COMPLETE_BONUS = 500;

// Death sequence
export const DEATH_SEQUENCE_DURATION = 2000; // ms

// Background
export const STAR_COUNT = 100;
export const STAR_BASE_SCROLL_SPEED = 30; // pixels per second
