import { HarnessBase } from './HarnessBase';
import { damagePlayer } from '../objects/player/code/PlayerShip';

/**
 * Interactive harness for testing player ship behavior.
 * Controls: movement, firing, invulnerability, damage, respawn.
 */
export class PlayerHarness extends HarnessBase {
  private statusEl: HTMLElement;

  constructor(containerId: string) {
    super(containerId);

    this.addLabel('--- Player Ship Harness ---');
    this.addLabel('Movement');
    this.addButton('Move Left (10 ticks)', () => this.movePlayer('left'));
    this.addButton('Move Right (10 ticks)', () => this.movePlayer('right'));
    this.addButton('Move Up (10 ticks)', () => this.movePlayer('up'));
    this.addButton('Move Down (10 ticks)', () => this.movePlayer('down'));

    this.addLabel('Actions');
    this.addButton('Fire (1 tick)', () => this.fire());
    this.addButton('Take Damage', () => this.damage());
    this.addButton('Kill Player', () => this.kill());
    this.addButton('Tick 1', () => this.step(1));
    this.addButton('Tick 60', () => this.step(60));
    this.addButton('Tick 600', () => this.step(600));

    this.statusEl = document.createElement('div');
    this.statusEl.style.cssText = 'color: #0ff; font-family: monospace; padding: 10px; background: #222; margin-top: 10px;';
    this.container.insertBefore(this.statusEl, this.logEl);

    this.updateStatus();
    this.log('Player harness ready. Use buttons to interact.');
  }

  private movePlayer(direction: 'left' | 'right' | 'up' | 'down'): void {
    this.gm.inputHandler.injectPlayerInput({ [direction]: true });
    this.tick(10);
    this.gm.inputHandler.injectPlayerInput({ [direction]: false });
    this.updateStatus();
    const p = this.gm.getState().players[0];
    this.log(`Moved ${direction} → pos(${p.position.x.toFixed(1)}, ${p.position.y.toFixed(1)})`);
  }

  private fire(): void {
    this.gm.inputHandler.injectPlayerInput({ fire: true });
    this.tick(1);
    this.gm.inputHandler.injectPlayerInput({ fire: false });
    this.updateStatus();
    this.log(`Fired! Projectiles: ${this.gm.getState().projectiles.length}`);
  }

  private damage(): void {
    const p = this.gm.getState().players[0];
    if (p) {
      p.isInvulnerable = false;
      damagePlayer(p, 50);
      this.updateStatus();
      this.log(`Damaged player. Health: ${p.health}, Alive: ${p.isAlive}`);
    }
  }

  private kill(): void {
    const p = this.gm.getState().players[0];
    if (p) {
      p.isInvulnerable = false;
      damagePlayer(p, p.maxHealth);
      this.updateStatus();
      this.log(`Killed player. Lives: ${p.lives}, Alive: ${p.isAlive}`);
    }
  }

  private step(n: number): void {
    this.tick(n);
    this.updateStatus();
    this.log(`Advanced ${n} ticks. Time: ${this.gm.getState().currentTime.toFixed(0)}ms`);
  }

  private updateStatus(): void {
    const state = this.gm.getState();
    const p = state.players[0];
    if (!p) {
      this.statusEl.textContent = 'No player';
      return;
    }
    this.statusEl.textContent = [
      `Status: ${state.gameStatus} | Time: ${state.currentTime.toFixed(0)}ms`,
      `Position: (${p.position.x.toFixed(1)}, ${p.position.y.toFixed(1)})`,
      `Velocity: (${p.velocity.x.toFixed(1)}, ${p.velocity.y.toFixed(1)})`,
      `Health: ${p.health}/${p.maxHealth} | Lives: ${p.lives}`,
      `Alive: ${p.isAlive} | Invulnerable: ${p.isInvulnerable} (${p.invulnerabilityTimer.toFixed(0)}ms)`,
      `Firing: ${p.isFiring} | Cooldown: ${p.fireCooldown.toFixed(0)}ms`,
      `Projectiles: ${state.projectiles.length} | Enemies: ${state.enemies.filter(e => e.isAlive).length}`,
    ].join('\n');
  }
}
