import { describe, expect, it } from 'vitest';
import { PLATFORM_FAMILIES, PLATFORM_WHITELIST, platformFamily } from './platforms';

describe('platformFamily', () => {
  it('reconnaît les plateformes de la liste blanche', () => {
    expect(platformFamily('win')).toBe('pc');
    expect(platformFamily('ps5')).toBe('playstation');
    expect(platformFamily('switch')).toBe('nintendo');
    expect(platformFamily('dc')).toBe('sega');
    expect(platformFamily('android')).toBe('mobile');
    expect(platformFamily('arcade')).toBe('retro');
  });

  it('refuse le reste', () => {
    expect(platformFamily('ouya')).toBeNull();
    expect(platformFamily('')).toBeNull();
  });

  it('couvre chaque famille', () => {
    const used = new Set(PLATFORM_WHITELIST.values());
    for (const f of PLATFORM_FAMILIES) expect(used.has(f)).toBe(true);
  });
});
