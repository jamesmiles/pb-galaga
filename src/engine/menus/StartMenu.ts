import { MenuBase } from './MenuBase';

export class StartMenu extends MenuBase {
  constructor() {
    super('start', ['Start Game']);
  }

  static readonly CONTROLS_INFO = [
    'Arrow Keys: Move ship',
    'Spacebar: Fire laser',
    'ESC: Pause (coming soon)',
  ];
}
