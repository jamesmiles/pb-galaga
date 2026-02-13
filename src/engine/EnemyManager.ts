import type { GameState, Enemy } from '../types';
import { updateEnemy } from '../objects/enemies/enemyA/code/EnemyA';

/** Update all enemies and remove destroyed ones. */
export function updateEnemies(state: GameState, dtSeconds: number): void {
  for (const enemy of state.enemies) {
    updateEnemy(enemy, dtSeconds);
  }
  state.enemies = state.enemies.filter((e) => e.isAlive);
}

/** Handle enemy destruction: award score to killer player. */
export function handleEnemyDestruction(enemy: Enemy, killerPlayerId: string, state: GameState): void {
  const player = state.players.find((p) => p.id === killerPlayerId);
  if (player) {
    player.score += enemy.scoreValue;
  }
  enemy.isAlive = false;
  enemy.collisionState = 'destroyed';
}

/** Check if all enemies in the current wave have been destroyed. */
export function isWaveComplete(state: GameState): boolean {
  return state.waveStatus === 'active' && state.enemies.length === 0;
}
