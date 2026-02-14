import { HarnessBase } from './HarnessBase';

/**
 * Interactive harness for testing projectile behavior.
 * Controls: firing, projectile movement, collision testing.
 */
export class ProjectileHarness extends HarnessBase {
  private statusEl: HTMLElement;

  constructor(containerId: string) {
    super(containerId);

    this.addLabel('--- Projectile Harness ---');
    this.addLabel('Firing');
    this.addButton('Fire Once', () => this.fire());
    this.addButton('Fire 5 Times', () => this.fireMulti(5));
    this.addButton('Rapid Fire (60 ticks)', () => this.rapidFire());

    this.addLabel('Simulation');
    this.addButton('Tick 1', () => this.step(1));
    this.addButton('Tick 10', () => this.step(10));
    this.addButton('Tick 60 (1s)', () => this.step(60));

    this.statusEl = document.createElement('div');
    this.statusEl.style.cssText = 'color: #0ff; font-family: monospace; padding: 10px; background: #222; margin-top: 10px; white-space: pre;';
    this.container.insertBefore(this.statusEl, this.logEl);

    this.updateStatus();
    this.log('Projectile harness ready. Use buttons to interact.');
  }

  private fire(): void {
    this.gm.inputHandler.injectPlayerInput({ fire: true });
    this.tick(1);
    this.gm.inputHandler.injectPlayerInput({ fire: false });
    this.updateStatus();
    this.log(`Fired! Active projectiles: ${this.gm.getState().projectiles.filter(p => p.isActive).length}`);
  }

  private fireMulti(count: number): void {
    for (let i = 0; i < count; i++) {
      this.gm.inputHandler.injectPlayerInput({ fire: true });
      this.tick(15); // Wait for cooldown between shots
      this.gm.inputHandler.injectPlayerInput({ fire: false });
      this.tick(1);
    }
    this.updateStatus();
    this.log(`Fired ${count} times. Active: ${this.gm.getState().projectiles.filter(p => p.isActive).length}`);
  }

  private rapidFire(): void {
    this.gm.inputHandler.injectPlayerInput({ fire: true });
    this.tick(60);
    this.gm.inputHandler.injectPlayerInput({ fire: false });
    this.updateStatus();
    this.log(`Rapid fire (60 ticks). Active: ${this.gm.getState().projectiles.filter(p => p.isActive).length}`);
  }

  private step(n: number): void {
    this.tick(n);
    this.updateStatus();
    this.log(`Advanced ${n} ticks.`);
  }

  private updateStatus(): void {
    const state = this.gm.getState();
    const active = state.projectiles.filter(p => p.isActive);
    this.statusEl.textContent = [
      `Active projectiles: ${active.length}`,
      `Player pos: (${state.players[0]?.position.x.toFixed(1)}, ${state.players[0]?.position.y.toFixed(1)})`,
      `Fire cooldown: ${state.players[0]?.fireCooldown.toFixed(0)}ms`,
      ...active.slice(0, 5).map(p =>
        `  ${p.id}: pos(${p.position.x.toFixed(1)}, ${p.position.y.toFixed(1)}) vel(${p.velocity.y.toFixed(0)}) life=${p.lifetime.toFixed(0)}ms`
      ),
      active.length > 5 ? `  ... and ${active.length - 5} more` : '',
    ].join('\n');
  }
}
