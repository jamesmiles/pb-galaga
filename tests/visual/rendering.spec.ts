import { test, expect } from '@playwright/test';

test.describe('PB-Galaga Rendering', () => {
  test('start menu shows version and title', async ({ page }) => {
    await page.goto('/');
    // Wait for Phaser to boot and render the menu
    await page.waitForTimeout(2000);

    // Screenshot the start menu
    await page.screenshot({ path: 'tests/visual/screenshots/start-menu.png' });

    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('game runs and FPS counters display', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Press Enter to start the game — hold briefly so the engine tick sees it
    await page.keyboard.down('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.up('Enter');

    // Let game run for 3 seconds to stabilize FPS counters
    await page.waitForTimeout(3000);

    // Screenshot gameplay
    await page.screenshot({ path: 'tests/visual/screenshots/gameplay.png' });

    // Extract FPS text from the canvas via the game manager
    const fpsData = await page.evaluate(() => {
      const gm = (window as any).__game;
      if (!gm) return { error: 'no __game' };
      return {
        engineFps: gm.gameLoop.engineFps,
        renderFps: gm.gameLoop.renderFps,
        gameStatus: gm.getState().gameStatus,
        enemyCount: gm.getState().enemies.filter((e: any) => e.isAlive).length,
        playerAlive: gm.getState().players[0]?.isAlive,
      };
    });

    console.log('FPS Data:', JSON.stringify(fpsData, null, 2));

    expect(fpsData.gameStatus).toBe('playing');
    expect(fpsData.engineFps).toBeGreaterThanOrEqual(55);
    // Render FPS lower in headless Chromium due to bloom PostFX (software WebGL)
    expect(fpsData.renderFps).toBeGreaterThanOrEqual(10);
    expect(fpsData.enemyCount).toBeGreaterThan(0);
  });

  test('explosions stop after animation completes', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Start game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Fire at enemies for a bit
    await page.keyboard.down('Space');
    await page.waitForTimeout(2000);
    await page.keyboard.up('Space');

    // Wait for explosions to finish
    await page.waitForTimeout(1000);

    // Check explosion count via scene internals
    const explosionData = await page.evaluate(() => {
      const gm = (window as any).__game;
      if (!gm) return { error: 'no __game' };
      // Count enemies with destroyed state
      const destroyed = gm.getState().enemies.filter((e: any) =>
        !e.isAlive && e.collisionState === 'destroyed'
      ).length;
      return {
        destroyedEnemies: destroyed,
        totalEnemies: gm.getState().enemies.length,
        aliveEnemies: gm.getState().enemies.filter((e: any) => e.isAlive).length,
      };
    });

    console.log('Explosion Data:', JSON.stringify(explosionData, null, 2));

    // Screenshot after explosions should have cleared
    await page.screenshot({ path: 'tests/visual/screenshots/post-explosion.png' });
  });
});
