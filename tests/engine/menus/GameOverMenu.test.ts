import { describe, it, expect } from 'vitest';
import { GameOverMenu } from '../../../src/engine/menus/GameOverMenu';

describe('GameOverMenu', () => {
  it('has Restart and Main Menu options', () => {
    const menu = new GameOverMenu(500);
    expect(menu.getState().options).toContain('Restart');
    expect(menu.getState().options).toContain('Main Menu');
  });

  it('stores final score', () => {
    const menu = new GameOverMenu(1200);
    expect(menu.getState().data?.finalScore).toBe(1200);
  });

  it('navigates down to second option', () => {
    const menu = new GameOverMenu(500);
    menu.handleInput({ up: false, down: true, enter: false });
    expect(menu.getState().selectedOption).toBe(1);
  });

  it('navigates up from second option', () => {
    const menu = new GameOverMenu(500);
    menu.handleInput({ up: false, down: true, enter: false });
    menu.handleInput({ up: true, down: false, enter: false });
    expect(menu.getState().selectedOption).toBe(0);
  });

  it('does not navigate above first option', () => {
    const menu = new GameOverMenu(500);
    menu.handleInput({ up: true, down: false, enter: false });
    expect(menu.getState().selectedOption).toBe(0);
  });

  it('does not navigate below last option', () => {
    const menu = new GameOverMenu(500);
    menu.handleInput({ up: false, down: true, enter: false });
    menu.handleInput({ up: false, down: true, enter: false });
    menu.handleInput({ up: false, down: true, enter: false });
    expect(menu.getState().selectedOption).toBe(1);
  });

  it('returns Restart on enter with first option', () => {
    const menu = new GameOverMenu(500);
    const result = menu.handleInput({ up: false, down: false, enter: true });
    expect(result).toBe('Restart');
  });

  it('returns Main Menu on enter with second option', () => {
    const menu = new GameOverMenu(500);
    menu.handleInput({ up: false, down: true, enter: false });
    const result = menu.handleInput({ up: false, down: false, enter: true });
    expect(result).toBe('Main Menu');
  });
});
