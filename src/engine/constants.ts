// Game loop timing
export const FIXED_TIMESTEP = 1000 / 60; // ~16.667ms per tick (60Hz)
export const MAX_ACCUMULATED = 250; // Spiral-of-death guard (ms)

// Game bounds (pixels)
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GAME_BOUNDS = {
  minX: 0,
  maxX: 800,
  minY: 0,
  maxY: 600,
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

// Formation defaults
export const FORMATION_BASE_SPEED = 60; // pixels per second
export const FORMATION_CELL_WIDTH = 48;
export const FORMATION_CELL_HEIGHT = 40;
export const FORMATION_SPEED_INCREASE = 1.5; // multiplier when enemies destroyed
export const FORMATION_STEP_DOWN = 20; // pixels to descend on direction change

// Background
export const STAR_COUNT = 100;
export const STAR_BASE_SCROLL_SPEED = 30; // pixels per second
