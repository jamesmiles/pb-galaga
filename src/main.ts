// PB-Galaga Entry Point
import { GameManager } from './engine/GameManager';
import { Canvas2DRenderer } from './renderer/Canvas2DRenderer';

// Create renderer
const renderer = new Canvas2DRenderer('game-container');

// Create game manager with renderer
const gameManager = new GameManager({ renderer });

// Pass FPS counters from GameLoop to renderer on each frame
const originalRender = renderer.render.bind(renderer);
renderer.render = (current, previous, alpha) => {
  renderer.setFpsCounters(gameManager.gameLoop.engineFps, gameManager.gameLoop.renderFps);
  originalRender(current, previous, alpha);
};

// Start the game
gameManager.start();

// Expose for debugging
(window as any).__game = gameManager;
