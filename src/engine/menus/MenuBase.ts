import type { MenuState, MenuType } from '../../types';
import type { MenuInput } from '../InputHandler';

export abstract class MenuBase {
  protected menuState: MenuState;

  constructor(type: MenuType, options: string[], data?: MenuState['data']) {
    this.menuState = {
      type,
      selectedOption: 0,
      options,
      data,
    };
  }

  getState(): MenuState {
    return this.menuState;
  }

  /** Process menu input. Returns selected option string if enter pressed, null otherwise. */
  handleInput(input: MenuInput): string | null {
    if (input.up) {
      this.menuState.selectedOption = Math.max(0, this.menuState.selectedOption - 1);
    }
    if (input.down) {
      this.menuState.selectedOption = Math.min(
        this.menuState.options.length - 1,
        this.menuState.selectedOption + 1,
      );
    }
    if (input.enter) {
      return this.menuState.options[this.menuState.selectedOption];
    }
    return null;
  }
}
