import { describe, it, expect } from 'vitest';
import { InputHandler } from '../../src/engine/InputHandler';

describe('InputHandler', () => {
  it('headless mode returns default input when nothing injected', () => {
    const ih = new InputHandler(true);
    const input = ih.getPlayerInput('player1');

    expect(input.left).toBe(false);
    expect(input.right).toBe(false);
    expect(input.up).toBe(false);
    expect(input.down).toBe(false);
    expect(input.fire).toBe(false);
  });

  it('injected player input is returned', () => {
    const ih = new InputHandler(true);
    ih.injectPlayerInput('player1', {
      left: true, right: false, up: false, down: false, fire: true,
    });

    const input = ih.getPlayerInput('player1');
    expect(input.left).toBe(true);
    expect(input.fire).toBe(true);
    expect(input.right).toBe(false);
  });

  it('injected input persists across reads until changed', () => {
    const ih = new InputHandler(true);
    ih.injectPlayerInput('player1', {
      left: true, right: false, up: false, down: false, fire: false,
    });

    const input1 = ih.getPlayerInput('player1');
    const input2 = ih.getPlayerInput('player1');
    expect(input1.left).toBe(true);
    expect(input2.left).toBe(true);
  });

  it('menu input is consumed once', () => {
    const ih = new InputHandler(true);
    ih.injectMenuInput({ up: false, down: false, enter: true });

    const first = ih.getMenuInput();
    expect(first.enter).toBe(true);

    const second = ih.getMenuInput();
    expect(second.enter).toBe(false);
  });

  it('separate player inputs are independent', () => {
    const ih = new InputHandler(true);
    ih.injectPlayerInput('player1', {
      left: true, right: false, up: false, down: false, fire: false,
    });
    ih.injectPlayerInput('player2', {
      left: false, right: true, up: false, down: false, fire: false,
    });

    expect(ih.getPlayerInput('player1').left).toBe(true);
    expect(ih.getPlayerInput('player1').right).toBe(false);
    expect(ih.getPlayerInput('player2').left).toBe(false);
    expect(ih.getPlayerInput('player2').right).toBe(true);
  });

  it('clear resets all input state', () => {
    const ih = new InputHandler(true);
    ih.injectPlayerInput('player1', {
      left: true, right: true, up: true, down: true, fire: true,
    });
    ih.clear();

    const input = ih.getPlayerInput('player1');
    expect(input.left).toBe(false);
    expect(input.fire).toBe(false);
  });
});
