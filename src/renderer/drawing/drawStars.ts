import type { Star } from '../../types';

/**
 * Render background stars using Canvas 2D.
 * Brighter/larger stars get a subtle shadowBlur glow for depth.
 */
export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[]): void {
  for (const star of stars) {
    const gray = Math.floor(star.brightness * 255);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;

    // Subtle glow on brighter stars
    if (star.brightness > 0.7) {
      ctx.shadowBlur = 2;
      ctx.shadowColor = `rgba(180, 200, 255, ${star.brightness * 0.5})`;
    }

    ctx.fillRect(
      Math.floor(star.position.x),
      Math.floor(star.position.y),
      Math.ceil(star.size),
      Math.ceil(star.size),
    );

    if (star.brightness > 0.7) {
      ctx.shadowBlur = 0;
    }
  }
}
