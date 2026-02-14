import { describe, it, expect } from 'vitest';
import { InputHandler } from './InputHandler';

describe('InputHandler', () => {
  describe('headless mode', () => {
    it('creates without attaching DOM listeners', () => {
      const handler = new InputHandler(true);
      // Should not throw even without window
      expect(handler).toBeDefined();
      handler.destroy();
    });

    it('returns all-false input by default', () => {
      const handler = new InputHandler(true);
      const input = handler.getPlayerInput();
      expect(input.left).toBe(false);
      expect(input.right).toBe(false);
      expect(input.up).toBe(false);
      expect(input.down).toBe(false);
      expect(input.fire).toBe(false);
      handler.destroy();
    });
  });

  describe('injectPlayerInput', () => {
    it('injects and polls player input', () => {
      const handler = new InputHandler(true);

      handler.injectPlayerInput({ left: true, fire: true });
      const input = handler.getPlayerInput();

      expect(input.left).toBe(true);
      expect(input.fire).toBe(true);
      expect(input.right).toBe(false);

      handler.destroy();
    });

    it('persists input across polls (not consumed)', () => {
      const handler = new InputHandler(true);
      handler.injectPlayerInput({ right: true });

      const input1 = handler.getPlayerInput();
      const input2 = handler.getPlayerInput();

      expect(input1.right).toBe(true);
      expect(input2.right).toBe(true);

      handler.destroy();
    });
  });

  describe('injectMenuInput', () => {
    it('injects menu input that is consumed on read', () => {
      const handler = new InputHandler(true);

      handler.injectMenuInput({ confirm: true });
      const input1 = handler.getMenuInput();
      expect(input1.confirm).toBe(true);

      // Second read should be consumed
      const input2 = handler.getMenuInput();
      expect(input2.confirm).toBe(false);

      handler.destroy();
    });
  });

  describe('clearAll', () => {
    it('clears all key state', () => {
      const handler = new InputHandler(true);
      handler.injectPlayerInput({ left: true, right: true, fire: true });

      handler.clearAll();
      const input = handler.getPlayerInput();

      expect(input.left).toBe(false);
      expect(input.right).toBe(false);
      expect(input.fire).toBe(false);

      handler.destroy();
    });
  });

  describe('player 2 input', () => {
    it('returns separate input for player 2', () => {
      const handler = new InputHandler(true);

      // Player 1 input only
      handler.injectPlayerInput({ left: true });

      const p1 = handler.getPlayerInput();
      const p2 = handler.getPlayer2Input();

      expect(p1.left).toBe(true);
      expect(p2.left).toBe(false);

      handler.destroy();
    });
  });
});
