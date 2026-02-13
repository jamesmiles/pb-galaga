import { GameManager } from '../engine/GameManager';
import type { GameState, PlayerInput, PlayerId } from '../types';

export interface TestScenario {
  name: string;
  setup: (harness: HarnessBase) => void;
  validate: (state: GameState) => boolean;
}

export class HarnessBase {
  protected gm: GameManager;
  protected scenarios: TestScenario[] = [];

  constructor() {
    this.gm = new GameManager({ headless: true });
  }

  /** Get current game state. */
  getState(): GameState {
    return this.gm.state;
  }

  /** Advance N fixed time steps. */
  tick(steps: number): void {
    this.gm.tickHeadless(steps);
  }

  /** Inject player input for headless control. */
  injectInput(playerId: PlayerId, input: PlayerInput): void {
    this.gm.inputHandler.injectPlayerInput(playerId, input);
  }

  /** Start the game (transition from menu to playing). */
  startGame(): void {
    this.gm.startGame();
  }

  /** Register a test scenario. */
  addScenario(scenario: TestScenario): void {
    this.scenarios.push(scenario);
  }

  /** Run all registered scenarios. Returns results. */
  runAllScenarios(): { name: string; passed: boolean }[] {
    const results: { name: string; passed: boolean }[] = [];

    for (const scenario of this.scenarios) {
      // Reset state for each scenario
      this.gm = new GameManager({ headless: true });
      this.gm.startGame();

      scenario.setup(this);
      const passed = scenario.validate(this.gm.state);
      results.push({ name: scenario.name, passed });
    }

    return results;
  }

  /** Get the game manager directly (for advanced testing). */
  getGameManager(): GameManager {
    return this.gm;
  }
}
