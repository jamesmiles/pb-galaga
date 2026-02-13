// Game Constants

// Display
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Physics / Timing
export const FIXED_TIMESTEP = 1000 / 60; // ~16.667ms per update (60 Hz)
export const MAX_ACCUMULATED = 250; // Spiral-of-death guard (ms)

// Player
export const PLAYER_SPEED = 300; // pixels/sec max velocity
export const PLAYER_ACCELERATION = 1500; // pixels/sec^2
export const PLAYER_FRICTION = 800; // pixels/sec^2 deceleration
export const PLAYER_MARGIN = 20; // pixels from edge
export const PLAYER_START_LIVES = 3;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_COLLISION_RADIUS = 12;
export const PLAYER_INVULNERABILITY_DURATION = 2000; // ms

// Laser
export const LASER_SPEED = 500; // pixels/sec
export const LASER_DAMAGE = 25;
export const LASER_MAX_LIFETIME = 3000; // ms
export const LASER_COLLISION_RADIUS = 5;
export const LASER_FIRE_COOLDOWN = 200; // ms (5 shots/sec)

// Enemy Type A
export const ENEMY_A_HEALTH = 50;
export const ENEMY_A_SCORE_VALUE = 100;
export const ENEMY_A_COLLISION_RADIUS = 15;

// Background
export const STAR_COUNT = 200;
export const STAR_SCROLL_SPEED = 50; // pixels/sec base speed
export const STAR_DEPTH_LAYERS = [0.2, 0.4, 0.7, 1.0];
