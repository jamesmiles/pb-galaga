import { HarnessBase } from './HarnessBase';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';

export class PlayerHarness extends HarnessBase {
  constructor() {
    super();
    this.registerDefaultScenarios();
  }

  private registerDefaultScenarios(): void {
    this.addScenario({
      name: 'Movement: player moves right with input',
      setup: (harness) => {
        const startX = harness.getState().players[0].position.x;
        harness.injectInput('player1', { left: false, right: true, up: false, down: false, fire: false });
        harness.tick(30);
        (harness as any)._testStartX = startX;
      },
      validate: (state) => {
        return state.players[0].position.x > (this as any)._testStartX;
      },
    });

    this.addScenario({
      name: 'Movement: player stays within bounds',
      setup: (harness) => {
        harness.injectInput('player1', { left: false, right: true, up: false, down: false, fire: false });
        harness.tick(600);
      },
      validate: (state) => {
        return state.players[0].position.x <= 780 && state.players[0].position.x >= 20;
      },
    });

    this.addScenario({
      name: 'Collision: player takes damage from enemy',
      setup: (harness) => {
        const state = harness.getState();
        // Spawn stationary enemy on top of player (null path = no movement)
        const enemy = createEnemyA(null, { ...state.players[0].position });
        state.enemies.push(enemy);
        harness.tick(1);
      },
      validate: (state) => {
        return state.players[0].health < 100 || !state.players[0].isAlive;
      },
    });

    this.addScenario({
      name: 'Death: player respawns with invulnerability',
      setup: (harness) => {
        const state = harness.getState();
        state.players[0].health = 0;
        state.players[0].isAlive = false;
        state.players[0].lives = 2;
        harness.tick(1);
      },
      validate: (state) => {
        return state.players[0].isAlive && state.players[0].isInvulnerable;
      },
    });
  }
}
