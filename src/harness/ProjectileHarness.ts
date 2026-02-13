import { HarnessBase } from './HarnessBase';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';

export class ProjectileHarness extends HarnessBase {
  constructor() {
    super();
    this.registerDefaultScenarios();
  }

  private registerDefaultScenarios(): void {
    this.addScenario({
      name: 'Fire: player fires laser with spacebar',
      setup: (harness) => {
        harness.injectInput('player1', { left: false, right: false, up: false, down: false, fire: true });
        harness.tick(1);
      },
      validate: (state) => {
        return state.projectiles.length > 0 && state.projectiles[0].type === 'laser';
      },
    });

    this.addScenario({
      name: 'Movement: laser moves upward',
      setup: (harness) => {
        harness.injectInput('player1', { left: false, right: false, up: false, down: false, fire: true });
        harness.tick(1);
        const startY = harness.getState().projectiles[0]?.position.y ?? 0;
        (harness as any)._laserStartY = startY;
        harness.injectInput('player1', { left: false, right: false, up: false, down: false, fire: false });
        harness.tick(10);
      },
      validate: (state) => {
        return state.projectiles.length > 0 &&
               state.projectiles[0].position.y < (this as any)._laserStartY;
      },
    });

    this.addScenario({
      name: 'Collision: laser destroys enemy',
      setup: (harness) => {
        const state = harness.getState();
        // Place stationary enemy directly above player
        const enemy = createEnemyA(null, { x: state.players[0].position.x, y: state.players[0].position.y - 50 });
        enemy.health = 25; // One hit kill
        state.enemies.push(enemy);
        harness.injectInput('player1', { left: false, right: false, up: false, down: false, fire: true });
        harness.tick(30);
      },
      validate: (state) => {
        return state.enemies.length === 0 && state.players[0].score > 0;
      },
    });

    this.addScenario({
      name: 'Lifetime: laser removed after max lifetime',
      setup: (harness) => {
        harness.injectInput('player1', { left: false, right: false, up: false, down: false, fire: true });
        harness.tick(1);
        harness.injectInput('player1', { left: false, right: false, up: false, down: false, fire: false });
        harness.tick(300);
      },
      validate: (state) => {
        return state.projectiles.length === 0;
      },
    });

    this.addScenario({
      name: 'Cooldown: rapid fire limited by cooldown',
      setup: (harness) => {
        harness.injectInput('player1', { left: false, right: false, up: false, down: false, fire: true });
        harness.tick(5);
      },
      validate: (state) => {
        return state.projectiles.length === 1;
      },
    });
  }
}
