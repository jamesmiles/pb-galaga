import { MenuBase } from './MenuBase';

export class GameOverMenu extends MenuBase {
  constructor(finalScore: number) {
    super('gameover', ['Restart', 'Main Menu'], { finalScore });
  }
}
