import { GameManager } from '../engine/GameManager';
import { Canvas2DRenderer } from '../renderer/Canvas2DRenderer';

type HarnessMode = 'fullgame' | 'player' | 'enemy' | 'projectile';

/**
 * Super Harness: single visual harness with Canvas2D rendering.
 * Replaces the old headless-only PlayerHarness, EnemyHarness, and ProjectileHarness.
 */
export class SuperHarness {
  private gm: GameManager;
  private renderer: Canvas2DRenderer;
  private modeSelect: HTMLSelectElement;
  private controlsEl: HTMLElement;
  private inspectorEl: HTMLElement;
  private logEl: HTMLElement;
  private currentMode: HarnessMode = 'fullgame';
  private inspectorTimer: ReturnType<typeof setInterval>;

  constructor() {
    // Create renderer and game manager (non-headless)
    this.renderer = new Canvas2DRenderer('game-container');
    this.gm = new GameManager({ renderer: this.renderer });

    // Wire FPS counters
    const origRender = this.renderer.render.bind(this.renderer);
    this.renderer.render = (current, previous, alpha) => {
      this.renderer.setFpsCounters(this.gm.gameLoop.engineFps, this.gm.gameLoop.renderFps);
      origRender(current, previous, alpha);
    };

    // Expose for debugging
    (window as any).__game = this.gm;
    (window as any).__harness = this;

    // Get DOM elements
    this.modeSelect = document.getElementById('mode-select') as HTMLSelectElement;
    this.controlsEl = document.getElementById('mode-controls')!;
    this.inspectorEl = document.getElementById('state-inspector')!;
    this.logEl = document.getElementById('harness-log')!;

    // Set up mode switch
    this.modeSelect.addEventListener('change', () => {
      this.currentMode = this.modeSelect.value as HarnessMode;
      this.onModeChange();
    });

    // Initial setup
    this.onModeChange();

    // Start the game loop
    this.gm.start();

    // Update state inspector periodically
    this.inspectorTimer = setInterval(() => this.updateInspector(), 200);
  }

  private log(msg: string): void {
    this.logEl.textContent += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private onModeChange(): void {
    this.controlsEl.innerHTML = '';

    if (this.currentMode === 'fullgame') {
      this.buildFullGameControls();
    } else {
      // Auto-start game if on menu
      this.ensurePlaying();
      if (this.currentMode === 'player') this.buildPlayerControls();
      else if (this.currentMode === 'enemy') this.buildEnemyControls();
      else if (this.currentMode === 'projectile') this.buildProjectileControls();
    }

    this.log(`Mode: ${this.currentMode}`);
  }

  private ensurePlaying(): void {
    const state = this.gm.getState();
    if (state.gameStatus === 'menu') {
      this.gm.inputHandler.injectMenuInput({ confirm: true });
      this.gm.tickHeadless(1);
    }
  }

  private addSection(title: string): HTMLElement {
    const div = document.createElement('div');
    div.className = 'section-title';
    div.textContent = title;
    this.controlsEl.appendChild(div);
    return div;
  }

  private addButtonGroup(): HTMLElement {
    const group = document.createElement('div');
    group.className = 'btn-group';
    this.controlsEl.appendChild(group);
    return group;
  }

  private addButton(parent: HTMLElement, label: string, onClick: () => void): void {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    parent.appendChild(btn);
  }

  // --- Full Game Controls ---
  private buildFullGameControls(): void {
    this.addSection('Game Controls');
    const group = this.addButtonGroup();
    this.addButton(group, 'Reset', () => {
      this.gm.stateManager.reset();
      this.log('Game reset');
    });
    this.addButton(group, 'Start Game', () => {
      this.ensurePlaying();
      this.log('Game started');
    });
  }

  // --- Player Controls ---
  private buildPlayerControls(): void {
    this.addSection('Movement (10 ticks)');
    const moveGroup = this.addButtonGroup();
    this.addButton(moveGroup, 'Left', () => {
      this.gm.inputHandler.injectPlayerInput({ left: true });
      this.gm.tickHeadless(10);
      this.gm.inputHandler.injectPlayerInput({ left: false });
      this.log('Move left 10 ticks');
    });
    this.addButton(moveGroup, 'Right', () => {
      this.gm.inputHandler.injectPlayerInput({ right: true });
      this.gm.tickHeadless(10);
      this.gm.inputHandler.injectPlayerInput({ right: false });
      this.log('Move right 10 ticks');
    });
    this.addButton(moveGroup, 'Up', () => {
      this.gm.inputHandler.injectPlayerInput({ up: true });
      this.gm.tickHeadless(10);
      this.gm.inputHandler.injectPlayerInput({ up: false });
      this.log('Move up 10 ticks');
    });
    this.addButton(moveGroup, 'Down', () => {
      this.gm.inputHandler.injectPlayerInput({ down: true });
      this.gm.tickHeadless(10);
      this.gm.inputHandler.injectPlayerInput({ down: false });
      this.log('Move down 10 ticks');
    });

    this.addSection('Actions');
    const actionGroup = this.addButtonGroup();
    this.addButton(actionGroup, 'Fire', () => {
      this.gm.inputHandler.injectPlayerInput({ fire: true });
      this.gm.tickHeadless(1);
      this.gm.inputHandler.injectPlayerInput({ fire: false });
      this.log('Fire');
    });
    this.addButton(actionGroup, 'Damage P1', () => {
      const p = this.gm.getState().players[0];
      if (p) {
        p.health -= 25;
        this.log(`P1 health: ${p.health}`);
      }
    });
    this.addButton(actionGroup, 'Kill P1', () => {
      const p = this.gm.getState().players[0];
      if (p) {
        p.health = 0;
        p.isAlive = false;
        p.collisionState = 'destroyed';
        this.log('P1 killed');
      }
    });

    this.addSection('Simulation');
    const simGroup = this.addButtonGroup();
    this.addButton(simGroup, 'Step 1', () => { this.gm.tickHeadless(1); this.log('Step 1'); });
    this.addButton(simGroup, 'Step 10', () => { this.gm.tickHeadless(10); this.log('Step 10'); });
    this.addButton(simGroup, 'Step 60', () => { this.gm.tickHeadless(60); this.log('Step 60'); });
  }

  // --- Enemy Controls ---
  private buildEnemyControls(): void {
    this.addSection('Kill Enemies');
    const killGroup = this.addButtonGroup();
    this.addButton(killGroup, 'Kill 1', () => {
      const alive = this.gm.getState().enemies.find(e => e.isAlive);
      if (alive) {
        alive.health = 0;
        alive.isAlive = false;
        alive.collisionState = 'destroyed';
        this.log(`Killed ${alive.id}`);
      }
    });
    this.addButton(killGroup, 'Kill 10', () => {
      let killed = 0;
      for (const e of this.gm.getState().enemies) {
        if (e.isAlive && killed < 10) {
          e.health = 0;
          e.isAlive = false;
          e.collisionState = 'destroyed';
          killed++;
        }
      }
      this.log(`Killed ${killed}`);
    });
    this.addButton(killGroup, 'Kill Half', () => {
      const alive = this.gm.getState().enemies.filter(e => e.isAlive);
      const half = Math.ceil(alive.length / 2);
      for (let i = 0; i < half; i++) {
        alive[i].health = 0;
        alive[i].isAlive = false;
        alive[i].collisionState = 'destroyed';
      }
      this.log(`Killed ${half}`);
    });
    this.addButton(killGroup, 'Kill All', () => {
      for (const e of this.gm.getState().enemies) {
        if (e.isAlive) {
          e.health = 0;
          e.isAlive = false;
          e.collisionState = 'destroyed';
        }
      }
      this.log('Killed all');
    });

    this.addSection('Simulation');
    const simGroup = this.addButtonGroup();
    this.addButton(simGroup, 'Step 1', () => { this.gm.tickHeadless(1); this.log('Step 1'); });
    this.addButton(simGroup, 'Step 60', () => { this.gm.tickHeadless(60); this.log('Step 60'); });
    this.addButton(simGroup, 'Step 600', () => { this.gm.tickHeadless(600); this.log('Step 600 (10s)'); });
  }

  // --- Projectile Controls ---
  private buildProjectileControls(): void {
    this.addSection('Fire Modes');
    const fireGroup = this.addButtonGroup();
    this.addButton(fireGroup, 'Fire Once', () => {
      this.gm.inputHandler.injectPlayerInput({ fire: true });
      this.gm.tickHeadless(1);
      this.gm.inputHandler.injectPlayerInput({ fire: false });
      this.log('Fired once');
    });
    this.addButton(fireGroup, 'Rapid Fire', () => {
      this.gm.inputHandler.injectPlayerInput({ fire: true });
      this.gm.tickHeadless(30);
      this.gm.inputHandler.injectPlayerInput({ fire: false });
      this.log('Rapid fire 30 ticks');
    });

    this.addSection('Simulation');
    const simGroup = this.addButtonGroup();
    this.addButton(simGroup, 'Step 1', () => { this.gm.tickHeadless(1); this.log('Step 1'); });
    this.addButton(simGroup, 'Step 10', () => { this.gm.tickHeadless(10); this.log('Step 10'); });
    this.addButton(simGroup, 'Step 60', () => { this.gm.tickHeadless(60); this.log('Step 60'); });
  }

  // --- State Inspector ---
  private updateInspector(): void {
    const state = this.gm.getState();
    const lines: string[] = [];

    lines.push(`Status: ${state.gameStatus} | Level: ${state.currentLevel} | Wave: ${state.currentWave}/${state.waveStatus}`);
    lines.push(`Time: ${(state.currentTime / 1000).toFixed(1)}s`);
    lines.push('');

    // Players
    for (const p of state.players) {
      lines.push(`${p.id}: pos(${p.position.x.toFixed(0)},${p.position.y.toFixed(0)}) hp:${p.health} lives:${p.lives} score:${p.score}`);
      lines.push(`  alive:${p.isAlive} invuln:${p.isInvulnerable} cooldown:${p.fireCooldown.toFixed(0)}`);
    }

    // Enemies
    const alive = state.enemies.filter(e => e.isAlive);
    const flying = state.enemies.filter(e => e.flightPathState);
    const diving = state.enemies.filter(e => e.diveState);
    lines.push('');
    lines.push(`Enemies: ${alive.length}/${state.enemies.length} alive | ${flying.length} flying | ${diving.length} diving`);

    if (state.formation) {
      lines.push(`Formation: offset(${state.formation.offsetX.toFixed(0)},${state.formation.offsetY.toFixed(0)}) dir:${state.formation.direction} spd:${state.formation.speed.toFixed(0)}`);
    }

    // Projectiles
    const activeProjs = state.projectiles.filter(p => p.isActive);
    lines.push('');
    lines.push(`Projectiles: ${activeProjs.length} active`);

    this.inspectorEl.textContent = lines.join('\n');
  }
}
