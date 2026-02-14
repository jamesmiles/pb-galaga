import { HarnessBase } from './HarnessBase';

/**
 * Interactive harness for testing enemy behavior.
 * Controls: formation movement, enemy damage, destruction.
 */
export class EnemyHarness extends HarnessBase {
  private statusEl: HTMLElement;

  constructor(containerId: string) {
    super(containerId);

    this.addLabel('--- Enemy Harness ---');
    this.addLabel('Simulation');
    this.addButton('Tick 1', () => this.step(1));
    this.addButton('Tick 60 (1s)', () => this.step(60));
    this.addButton('Tick 300 (5s)', () => this.step(300));
    this.addButton('Tick 600 (10s)', () => this.step(600));

    this.addLabel('Enemy Actions');
    this.addButton('Kill First Enemy', () => this.killFirst());
    this.addButton('Kill 10 Enemies', () => this.killMany(10));
    this.addButton('Kill Half', () => this.killHalf());

    this.statusEl = document.createElement('div');
    this.statusEl.style.cssText = 'color: #0ff; font-family: monospace; padding: 10px; background: #222; margin-top: 10px; white-space: pre;';
    this.container.insertBefore(this.statusEl, this.logEl);

    this.updateStatus();
    this.log('Enemy harness ready. Use buttons to interact.');
  }

  private step(n: number): void {
    this.tick(n);
    this.updateStatus();
    this.log(`Advanced ${n} ticks.`);
  }

  private killFirst(): void {
    const alive = this.gm.getState().enemies.find(e => e.isAlive);
    if (alive) {
      alive.isAlive = false;
      alive.health = 0;
      alive.collisionState = 'destroyed';
      this.updateStatus();
      this.log(`Killed enemy ${alive.id}`);
    }
  }

  private killMany(count: number): void {
    const alive = this.gm.getState().enemies.filter(e => e.isAlive);
    const toKill = alive.slice(0, count);
    for (const e of toKill) {
      e.isAlive = false;
      e.health = 0;
      e.collisionState = 'destroyed';
    }
    this.updateStatus();
    this.log(`Killed ${toKill.length} enemies.`);
  }

  private killHalf(): void {
    const alive = this.gm.getState().enemies.filter(e => e.isAlive);
    this.killMany(Math.ceil(alive.length / 2));
  }

  private updateStatus(): void {
    const state = this.gm.getState();
    const alive = state.enemies.filter(e => e.isAlive);
    const f = state.formation;
    this.statusEl.textContent = [
      `Enemies: ${alive.length}/${state.enemies.length} alive`,
      `Formation: offset(${f.offsetX.toFixed(1)}, ${f.offsetY.toFixed(1)}) dir=${f.direction} speed=${f.speed.toFixed(1)}`,
      `Grid: ${f.rows}x${f.cols} | Standoff Y: ${f.standoffY.toFixed(1)}`,
      `Wave: ${state.currentWave} | Status: ${state.waveStatus}`,
    ].join('\n');
  }
}
