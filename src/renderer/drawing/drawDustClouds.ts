import { GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';

// Import dust cloud sprites
import dustCloud1Url from '../../backgrounds/dust-cloud-1.png';
import dustCloud2Url from '../../backgrounds/dust-cloud-2.png';
import dustCloud3Url from '../../backgrounds/dust-cloud-3.png';
import dustSwirl1Url from '../../backgrounds/dust-swirl-1.png';
import dustSwirl2Url from '../../backgrounds/dust-swirl-2.png';

const DUST_SPRITE_URLS = [dustCloud1Url, dustCloud2Url, dustCloud3Url, dustSwirl1Url, dustSwirl2Url];

interface DustCloud {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spriteIndex: number;
  alpha: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;
}

/**
 * Manages atmospheric dust cloud overlays for Mars levels.
 * Renders ABOVE player entities but BELOW HUD.
 * Purely visual — no game state impact.
 */
export class DustCloudManager {
  private sprites: HTMLImageElement[] = [];
  private spritesLoaded = false;
  private clouds: DustCloud[] = [];
  private spawnTimer = 0;
  private readonly spawnInterval = 2500; // ms between spawns
  private readonly maxClouds = 6;

  constructor() {
    this.loadSprites();
  }

  private loadSprites(): void {
    let loaded = 0;
    for (const url of DUST_SPRITE_URLS) {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === DUST_SPRITE_URLS.length) {
          this.spritesLoaded = true;
        }
      };
      img.src = url;
      this.sprites.push(img);
    }
  }

  update(dt: number): void {
    if (!this.spritesLoaded) return;

    // Spawn new clouds
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval && this.clouds.length < this.maxClouds) {
      this.spawnTimer = 0;
      this.spawnCloud();
    }

    // Update cloud positions
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const cloud = this.clouds[i];
      const dtSec = dt / 1000;
      cloud.x += cloud.vx * dtSec;
      cloud.y += cloud.vy * dtSec;
      cloud.rotation += cloud.rotationSpeed * dtSec;

      // Remove clouds that have drifted off screen
      if (cloud.x < -200 || cloud.x > GAME_WIDTH + 200 ||
          cloud.y < -200 || cloud.y > GAME_HEIGHT + 200) {
        this.clouds.splice(i, 1);
      }
    }
  }

  private spawnCloud(): void {
    const spriteIndex = Math.floor(Math.random() * this.sprites.length);
    // Spawn from edges
    const fromLeft = Math.random() > 0.5;
    const x = fromLeft ? -120 : GAME_WIDTH + 120;
    const y = 100 + Math.random() * (GAME_HEIGHT - 300);

    this.clouds.push({
      x,
      y,
      vx: fromLeft ? 15 + Math.random() * 20 : -(15 + Math.random() * 20),
      vy: -5 + Math.random() * 10,
      spriteIndex,
      alpha: 0.15 + Math.random() * 0.2,
      scale: 1.5 + Math.random() * 2.0,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.spritesLoaded) return;

    for (const cloud of this.clouds) {
      const sprite = this.sprites[cloud.spriteIndex];
      if (!sprite || !sprite.complete) continue;

      const w = sprite.width * cloud.scale;
      const h = sprite.height * cloud.scale;

      ctx.save();
      ctx.globalAlpha = cloud.alpha;
      ctx.translate(cloud.x, cloud.y);
      ctx.rotate(cloud.rotation);
      ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  reset(): void {
    this.clouds = [];
    this.spawnTimer = 0;
  }
}
