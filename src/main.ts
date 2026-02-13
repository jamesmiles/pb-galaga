import { GameManager } from './engine/GameManager';
import { PhaserRenderer } from './renderer/PhaserRenderer';

// Initialize game
const gm = new GameManager({ headless: false });
const renderer = new PhaserRenderer('game-container');

// Override the game loop's render callback to use PhaserRenderer
const originalGameLoop = gm.gameLoop;
const originalRender = (originalGameLoop as any).renderFn;
(originalGameLoop as any).renderFn = (alpha: number) => {
  renderer.render(
    gm.stateManager.currentState,
    gm.stateManager.previousState,
    alpha,
  );
};

// Start the game loop
gm.start();

// Expose for debugging
(window as any).__game = gm;
(window as any).__renderer = renderer;

console.log('PB-Galaga started!');
