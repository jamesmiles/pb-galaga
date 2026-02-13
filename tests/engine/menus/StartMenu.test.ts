import { describe, it, expect } from 'vitest';
import { StartMenu } from '../../../src/engine/menus/StartMenu';

describe('StartMenu', () => {
  it('has Start Game option', () => {
    const menu = new StartMenu();
    expect(menu.getState().options).toContain('Start Game');
  });

  it('has controls info', () => {
    expect(StartMenu.CONTROLS_INFO.length).toBeGreaterThan(0);
    expect(StartMenu.CONTROLS_INFO.some(c => c.includes('Arrow'))).toBe(true);
    expect(StartMenu.CONTROLS_INFO.some(c => c.includes('Spacebar'))).toBe(true);
  });

  it('starts with first option selected', () => {
    const menu = new StartMenu();
    expect(menu.getState().selectedOption).toBe(0);
  });

  it('returns selected option on enter', () => {
    const menu = new StartMenu();
    const result = menu.handleInput({ up: false, down: false, enter: true });
    expect(result).toBe('Start Game');
  });

  it('returns null when no enter pressed', () => {
    const menu = new StartMenu();
    const result = menu.handleInput({ up: false, down: false, enter: false });
    expect(result).toBeNull();
  });
});
