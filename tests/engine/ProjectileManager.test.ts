import { describe, it, expect } from 'vitest';
import { updateProjectiles, handlePlayerFiring } from '../../src/engine/ProjectileManager';
import { createInitialState } from '../../src/engine/StateManager';
import { createPlayer } from '../../src/objects/player/code/PlayerShip';
import { createLaser } from '../../src/objects/projectiles/laser/code/Laser';

describe('ProjectileManager', () => {
  it('removes inactive projectiles', () => {
    const state = createInitialState();
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 300 });
    laser.isActive = false;
    state.projectiles.push(laser);

    updateProjectiles(state, 1/60);

    expect(state.projectiles).toHaveLength(0);
  });

  it('keeps active projectiles', () => {
    const state = createInitialState();
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 300 });
    state.projectiles.push(laser);

    updateProjectiles(state, 1/60);

    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0].position.y).toBeLessThan(300);
  });

  it('handlePlayerFiring spawns laser when firing', () => {
    const state = createInitialState();
    const player = state.players[0];
    player.isAlive = true;
    player.input.fire = true;
    player.fireCooldown = 0;

    handlePlayerFiring(state, player);

    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0].type).toBe('laser');
    expect(state.projectiles[0].owner).toEqual({ type: 'player', id: 'player1' });
  });

  it('fire cooldown prevents rapid firing', () => {
    const state = createInitialState();
    const player = state.players[0];
    player.isAlive = true;
    player.input.fire = true;
    player.fireCooldown = 0;

    handlePlayerFiring(state, player);
    expect(state.projectiles).toHaveLength(1);
    expect(player.fireCooldown).toBeGreaterThan(0);

    // Try to fire again immediately — should be blocked
    handlePlayerFiring(state, player);
    expect(state.projectiles).toHaveLength(1);
  });

  it('does not fire when player is dead', () => {
    const state = createInitialState();
    const player = state.players[0];
    player.isAlive = false;
    player.input.fire = true;
    player.fireCooldown = 0;

    handlePlayerFiring(state, player);
    expect(state.projectiles).toHaveLength(0);
  });
});
