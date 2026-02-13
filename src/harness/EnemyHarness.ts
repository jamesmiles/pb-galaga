import { HarnessBase } from './HarnessBase';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';
import { STRAIGHT_DOWN, ARC_LEFT } from '../engine/FlightPathUtils';

export class EnemyHarness extends HarnessBase {
  constructor() {
    super();
    this.registerDefaultScenarios();
  }

  private registerDefaultScenarios(): void {
    this.addScenario({
      name: 'Path following: enemy follows straight path',
      setup: (harness) => {
        const state = harness.getState();
        const enemy = createEnemyA(STRAIGHT_DOWN);
        state.enemies.push(enemy);
        harness.tick(60);
      },
      validate: (state) => {
        return state.enemies.length > 0 && state.enemies[0].pathProgress > 0;
      },
    });

    this.addScenario({
      name: 'Path following: enemy follows arc path',
      setup: (harness) => {
        const state = harness.getState();
        const enemy = createEnemyA(ARC_LEFT);
        state.enemies.push(enemy);
        harness.tick(60);
      },
      validate: (state) => {
        return state.enemies.length > 0 && state.enemies[0].pathProgress > 0;
      },
    });

    this.addScenario({
      name: 'Destruction: enemy removed when health = 0',
      setup: (harness) => {
        const state = harness.getState();
        const enemy = createEnemyA(null, { x: 100, y: 100 });
        enemy.health = 0;
        state.enemies.push(enemy);
        harness.tick(1);
      },
      validate: (state) => {
        return state.enemies.length === 0;
      },
    });

    this.addScenario({
      name: 'Score: destroying enemy awards score',
      setup: (harness) => {
        const state = harness.getState();
        // Spawn stationary enemy on top of player for collision
        const enemy = createEnemyA(null, { ...state.players[0].position });
        state.enemies.push(enemy);
        harness.tick(1);
      },
      validate: (state) => {
        return state.players[0].score > 0;
      },
    });
  }
}
