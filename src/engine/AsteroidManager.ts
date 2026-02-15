import type { GameState, Asteroid } from '../types';
import {
  GAME_WIDTH, GAME_HEIGHT,
  ASTEROID_SMALL_HEALTH, ASTEROID_LARGE_HEALTH,
  ASTEROID_SMALL_RADIUS, ASTEROID_LARGE_RADIUS,
  ASTEROID_SMALL_SCORE, ASTEROID_LARGE_SCORE,
  ASTEROID_SPAWN_INTERVAL, ASTEROID_SPAWN_JITTER,
  ASTEROID_SPEED_MIN, ASTEROID_SPEED_MAX,
} from './constants';

let nextAsteroidId = 0;

/**
 * Manages foreground asteroids for Level 4.
 * Spawns at regular intervals, drifts downward, removed off-screen.
 */
export class AsteroidManager {
  private spawnTimer = 0;
  private nextSpawnDelay = ASTEROID_SPAWN_INTERVAL;

  update(state: GameState, dtMs: number): void {
    if (state.currentLevel !== 4 || state.gameStatus !== 'playing') return;

    // Spawn timer
    this.spawnTimer += dtMs;
    if (this.spawnTimer >= this.nextSpawnDelay) {
      this.spawnAsteroid(state);
      this.spawnTimer = 0;
      this.nextSpawnDelay = ASTEROID_SPAWN_INTERVAL + (Math.random() * 2 - 1) * ASTEROID_SPAWN_JITTER;
    }

    // Update existing asteroids
    const dtSec = dtMs / 1000;
    for (const a of state.asteroids) {
      if (!a.isAlive) continue;
      a.position.x += a.velocity.x * dtSec;
      a.position.y += a.velocity.y * dtSec;
      a.rotation += a.rotationSpeed * dtSec;
    }

    // Remove off-screen or dead asteroids
    state.asteroids = state.asteroids.filter(
      a => a.isAlive && a.position.y < GAME_HEIGHT + 50
    );
  }

  private spawnAsteroid(state: GameState): void {
    const isLarge = Math.random() < 0.4;
    const radius = isLarge ? ASTEROID_LARGE_RADIUS : ASTEROID_SMALL_RADIUS;
    const speed = ASTEROID_SPEED_MIN + Math.random() * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN);

    const asteroid: Asteroid = {
      id: `asteroid-${nextAsteroidId++}`,
      size: isLarge ? 'large' : 'small',
      position: {
        x: radius + Math.random() * (GAME_WIDTH - radius * 2),
        y: -radius,
      },
      velocity: {
        x: (Math.random() - 0.5) * 20, // slight horizontal drift
        y: speed,
      },
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 2, // -1 to +1 rad/s
      health: isLarge ? ASTEROID_LARGE_HEALTH : ASTEROID_SMALL_HEALTH,
      maxHealth: isLarge ? ASTEROID_LARGE_HEALTH : ASTEROID_SMALL_HEALTH,
      collisionRadius: radius,
      isAlive: true,
      scoreValue: isLarge ? ASTEROID_LARGE_SCORE : ASTEROID_SMALL_SCORE,
    };

    state.asteroids = [...state.asteroids, asteroid];
  }

  reset(): void {
    this.spawnTimer = 0;
    this.nextSpawnDelay = ASTEROID_SPAWN_INTERVAL;
  }
}
