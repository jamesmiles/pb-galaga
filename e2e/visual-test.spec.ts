import { test, type Page } from '@playwright/test';

/**
 * Visual tests for PB-Galaga.
 *
 * Run with:
 *   npm run test:visual
 *
 * Screenshots are saved to ./screenshots/
 */

const GAME_URL = 'http://localhost:3000';

/** Hold a key long enough for the game loop to process it (>1 tick at 60Hz). */
async function pressKey(page: Page, key: string, holdMs = 100): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(50);
}

/** Take a screenshot of the Phaser canvas element. */
async function screenshotCanvas(page: Page, path: string): Promise<void> {
  const canvas = page.locator('canvas');
  await canvas.screenshot({ path });
}

/** Start the game from the menu. */
async function startGame(page: Page): Promise<void> {
  await pressKey(page, 'Enter', 150);
  // Wait for state transition and first enemies to begin spawning
  await page.waitForTimeout(500);
}

test.describe('PB-Galaga Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForSelector('canvas', { timeout: 10000 });
    // Wait for Phaser to boot and render the first frame
    await page.waitForTimeout(2000);
  });

  test('01 - Start Menu', async ({ page }) => {
    await screenshotCanvas(page, 'screenshots/01-start-menu.png');
  });

  test('02 - Gameplay with enemies spawning', async ({ page }) => {
    await startGame(page);
    // Wait for enemies to spawn (12 enemies x 250ms stagger = ~3s)
    await page.waitForTimeout(3500);
    await screenshotCanvas(page, 'screenshots/02-gameplay-enemies.png');
  });

  test('03 - Player movement', async ({ page }) => {
    await startGame(page);
    await page.waitForTimeout(500);

    // Move player to the right
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(800);
    await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(200);

    await screenshotCanvas(page, 'screenshots/03-player-movement.png');
  });

  test('04 - Firing lasers', async ({ page }) => {
    await startGame(page);
    await page.waitForTimeout(500);

    // Hold fire to shoot a burst of lasers
    await page.keyboard.down('Space');
    await page.waitForTimeout(1500);
    await page.keyboard.up('Space');
    await page.waitForTimeout(100);

    await screenshotCanvas(page, 'screenshots/04-firing-lasers.png');
  });

  test('05 - Combat with score', async ({ page }) => {
    await startGame(page);
    // Wait for enemies to appear
    await page.waitForTimeout(2000);

    // Move up toward enemies while firing
    await page.keyboard.down('ArrowUp');
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');
    await page.keyboard.up('ArrowUp');
    await page.waitForTimeout(200);

    await screenshotCanvas(page, 'screenshots/05-combat-score.png');
  });

  test('06 - Game Over screen', async ({ page }) => {
    await startGame(page);
    await page.waitForTimeout(500);

    // Use the exposed __game object to force game over
    await page.evaluate(() => {
      const game = (window as any).__game;
      if (game) {
        const state = game.stateManager.currentState;
        state.players[0].lives = 0;
        state.players[0].health = 0;
        state.players[0].isAlive = false;
      }
    });

    // Wait for game over to trigger and render
    await page.waitForTimeout(500);

    // Force game over if checkGameOver hasn't run yet
    await page.evaluate(() => {
      const game = (window as any).__game;
      if (game && game.stateManager.currentState.gameStatus === 'playing') {
        game.gameOver();
      }
    });

    await page.waitForTimeout(1000);
    await screenshotCanvas(page, 'screenshots/06-game-over.png');
  });
});
