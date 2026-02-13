import Phaser from 'phaser';
import type { GameState } from '../../types';
import { SpriteManager } from '../SpriteManager';
import { interpolatePosition, interpolateRotation } from '../InterpolationUtils';

export class GameScene extends Phaser.Scene {
  private spriteManager!: SpriteManager;
  private hudText!: Phaser.GameObjects.Text;
  private currentState: GameState | null = null;
  private previousState: GameState | null = null;
  private alpha = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.spriteManager = new SpriteManager(this);

    // HUD text for score and lives
    this.hudText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.hudText.setDepth(10);
  }

  /** Called by PhaserRenderer to pass state data. */
  setRenderData(current: GameState, previous: GameState, alpha: number): void {
    this.currentState = current;
    this.previousState = previous;
    this.alpha = alpha;
  }

  update(): void {
    if (!this.currentState || !this.previousState) return;

    const curr = this.currentState;
    const prev = this.previousState;
    const a = this.alpha;

    // Render background stars (no interpolation needed, they're updated in state)
    this.spriteManager.drawStars(curr.background.stars);

    // Render players with interpolation
    for (let i = 0; i < curr.players.length; i++) {
      const cp = curr.players[i];
      const pp = prev.players.find(p => p.id === cp.id) ?? cp;
      const pos = interpolatePosition(pp.position, cp.position, a);
      const rot = interpolateRotation(pp.rotation, cp.rotation, a);
      this.spriteManager.updatePlayer(cp, pos.x, pos.y, rot);
    }

    // Render enemies with interpolation
    for (const ce of curr.enemies) {
      const pe = prev.enemies.find(e => e.id === ce.id) ?? ce;
      const pos = interpolatePosition(pe.position, ce.position, a);
      const rot = interpolateRotation(pe.rotation, ce.rotation, a);
      this.spriteManager.updateEnemy(ce, pos.x, pos.y, rot);
    }

    // Render projectiles with interpolation
    for (const cp of curr.projectiles) {
      const pp = prev.projectiles.find(p => p.id === cp.id) ?? cp;
      const pos = interpolatePosition(pp.position, cp.position, a);
      this.spriteManager.updateProjectile(cp, pos.x, pos.y);
    }

    // Cleanup removed entities
    this.spriteManager.cleanup(
      new Set(curr.players.map(p => p.id)),
      new Set(curr.enemies.map(e => e.id)),
      new Set(curr.projectiles.map(p => p.id)),
    );

    // Update HUD
    const player = curr.players[0];
    if (player) {
      this.hudText.setText(`SCORE: ${player.score}    LIVES: ${player.lives}    HEALTH: ${player.health}`);
    }
  }

  shutdown(): void {
    this.spriteManager?.destroy();
  }
}
