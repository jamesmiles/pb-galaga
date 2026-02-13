import { describe, it, expect } from 'vitest';

describe('Project setup', () => {
  it('types module exports correctly', async () => {
    const types = await import('../src/types');
    // Verify key types exist by checking they're importable
    expect(types).toBeDefined();
  });
});
