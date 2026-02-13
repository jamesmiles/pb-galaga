# PB-Galaga

Modern browser-based arcade space shooter built with TypeScript and Phaser 3.

## Prerequisites

- Node.js v22+ (recommended: install via [nvm](https://github.com/nvm-sh/nvm))
- npm (included with Node.js)

## Build

```bash
npm install
npm run build
```

This runs TypeScript compilation followed by Vite bundling. Output goes to `dist/`.

## Run (Development)

```bash
npm run dev
```

Opens a local dev server at `http://localhost:5173` with hot module replacement. The game renders in an 800x600 canvas.

### Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Move ship |
| Spacebar | Fire laser |
| Enter | Select menu option |
| Arrow Up/Down | Navigate menus |

## Run (Production Preview)

```bash
npm run build
npm run preview
```

Serves the production build at `http://localhost:4173`.

## Tests

### Unit & Integration Tests (Vitest)

```bash
npm run test          # Run all tests once
npm run test:watch    # Run tests in watch mode
```

Tests are in `tests/` and cover all game systems headlessly (no browser required):

| Directory | Coverage |
|-----------|----------|
| `tests/engine/` | Game loop, state manager, input, collisions, projectiles, enemies, level manager |
| `tests/engine/menus/` | Start menu and game over menu logic |
| `tests/objects/` | Player ship, laser projectiles, Enemy Type A |
| `tests/objects/environment/` | Background parallax stars |
| `tests/levels/` | Level 1 configuration |
| `tests/renderer/` | Interpolation utilities |
| `tests/harness/` | Player, enemy, and projectile test harnesses |
| `tests/integration/` | Full game loop end-to-end test |

### Visual Tests (Playwright)

```bash
npm run test:visual
```

Captures screenshots of key game states using headless Chromium. Screenshots are saved to `screenshots/`. Requires Chromium installed via:

```bash
npx playwright install chromium
```

## Test Harnesses

Test harnesses provide isolated, scenario-based testing of individual game subsystems. Each harness creates its own headless `GameManager` instance and runs predefined scenarios.

### Available Harnesses

| Harness | File | Scenarios |
|---------|------|-----------|
| Player | `src/harness/PlayerHarness.ts` | Movement, boundary clamping, collision damage, death/respawn with invulnerability |
| Enemy | `src/harness/EnemyHarness.ts` | Straight path following, arc path following, destruction on zero health, score award on collision |
| Projectile | `src/harness/ProjectileHarness.ts` | Fire laser, upward movement, enemy collision/destruction, lifetime removal, fire cooldown |

### Running Harnesses via Tests

```bash
# Run all harness tests
npx vitest run tests/harness/

# Run a specific harness
npx vitest run tests/harness/PlayerHarness.test.ts
npx vitest run tests/harness/EnemyHarness.test.ts
npx vitest run tests/harness/ProjectileHarness.test.ts
```

### Using Harnesses Programmatically

```typescript
import { PlayerHarness } from './src/harness/PlayerHarness';

const harness = new PlayerHarness();
const results = harness.runAllScenarios();
for (const [name, passed] of results) {
  console.log(`${name}: ${passed ? 'PASS' : 'FAIL'}`);
}
```

### Creating Custom Scenarios

```typescript
import { HarnessBase } from './src/harness/HarnessBase';

const harness = new HarnessBase();
harness.startGame();

// Inject player input
harness.injectInput('player1', { left: false, right: true, up: false, down: false, fire: true });

// Advance 60 ticks (1 second at 60Hz)
harness.tick(60);

// Inspect state
const state = harness.getState();
console.log(state.players[0].position);
console.log(state.projectiles.length);
```

## Visual Testing (for Agents)

Visual testing uses Playwright to automate the browser, interact with the game, and capture screenshots for verification.

### Setup

```bash
npm install
npx playwright install chromium
```

### Running Visual Tests

```bash
npm run test:visual
```

This will:
1. Start the Vite dev server automatically
2. Launch headless Chromium
3. Navigate to the game
4. Capture screenshots at 6 key states:
   - `01-start-menu.png` — Start menu with title and controls
   - `02-gameplay-enemies.png` — Gameplay with enemy swarm spawned
   - `03-player-movement.png` — Player ship moved to the right
   - `04-firing-lasers.png` — Laser projectiles fired upward
   - `05-combat-score.png` — Combat with score and health changes
   - `06-game-over.png` — Game over screen with final score
5. Save screenshots to `screenshots/`

### Writing Custom Visual Tests

Visual tests live in `e2e/` and use the Playwright test runner. Key patterns:

```typescript
import { test, type Page } from '@playwright/test';

// Hold a key long enough for the game loop to process it
async function pressKey(page: Page, key: string, holdMs = 100) {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
}

// Screenshot the canvas (not the full page)
async function screenshotCanvas(page: Page, path: string) {
  const canvas = page.locator('canvas');
  await canvas.screenshot({ path });
}

// Access game internals via window.__game
await page.evaluate(() => {
  const game = (window as any).__game;
  const state = game.stateManager.currentState;
  // Inspect or modify state for testing
});
```

### Configuration

Playwright config is in `playwright.config.ts`. It auto-starts Vite on port 3000.

### Tips for Agents

- Always wait at least 2 seconds after `page.goto()` for Phaser to boot
- Use `keyboard.down()`/`keyboard.up()` with delays, not `keyboard.press()` — the game loop needs time to read key state between keydown and keyup events
- The game exposes `window.__game` (GameManager) and `window.__renderer` (PhaserRenderer) for debugging and state manipulation
- To force game over: set player lives=0, isAlive=false, then call `game.gameOver()`
- Screenshots of the `canvas` element are more reliable than full-page screenshots

## Architecture

The game uses a strict separation between logic and rendering:

- **Game logic** runs in a fixed-timestep loop at 60Hz (`src/engine/`)
- **Rendering** is handled by Phaser 3 as a "dumb" visualizer (`src/renderer/`)
- **State** is double-buffered for interpolation between frames
- All logic works in **headless mode** without a browser

See `.patchboard/docs/design-architecture/core/architecture.md` for full details.

## Project Structure

```
src/
  engine/          # Core game loop, state, input, collision, managers
    menus/         # Menu state machines
  objects/
    player/code/   # Player ship logic
    enemies/enemyA/code/  # Enemy Type A logic
    projectiles/laser/code/  # Laser projectile logic
    environment/   # Background parallax
  levels/          # Level configurations
  renderer/        # Phaser rendering layer
    scenes/        # Phaser scenes (Game, Menu)
  harness/         # Test harnesses
  types.ts         # All TypeScript interfaces
tests/             # Vitest test files
e2e/               # Playwright visual tests
screenshots/       # Visual test output
```
