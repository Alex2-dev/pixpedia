/** Familles de la liste blanche des plateformes (spec §3.3). */
export const PLATFORM_FAMILIES = [
  'pc',
  'playstation',
  'xbox',
  'nintendo',
  'sega',
  'mobile',
  'retro',
] as const;
export type PlatformFamily = (typeof PLATFORM_FAMILIES)[number];

const family = (f: PlatformFamily, slugs: string[]) => slugs.map((s) => [s, f] as const);

/**
 * Liste blanche par slug IGDB. Une plateforme absente n'est pas officielle.
 * À vérifier avec `pnpm worker:probe`, qui liste les plateformes non reconnues.
 */
export const PLATFORM_WHITELIST: ReadonlyMap<string, PlatformFamily> = new Map([
  ...family('pc', ['win', 'mac', 'linux', 'dos']),
  ...family('playstation', ['ps', 'ps2', 'ps3', 'ps4--1', 'ps5', 'psp', 'psvita']),
  ...family('xbox', ['xbox', 'xbox360', 'xboxone', 'series-x', 'series-x-s']),
  ...family('nintendo', [
    'nes',
    'famicom',
    'fds',
    'snes',
    'sfam',
    'n64',
    'n64dd',
    'ngc',
    'wii',
    'wiiu',
    'switch',
    'switch-2',
    'gb',
    'gbc',
    'gba',
    'nds',
    'dsi',
    '3ds',
    'new-nintendo-3ds',
    'virtualboy',
  ]),
  ...family('sega', [
    'sg1000',
    'sms',
    'genesis-slash-megadrive',
    'segacd',
    'sega32',
    'saturn',
    'dc',
    'gamegear',
  ]),
  ...family('mobile', ['ios', 'android']),
  ...family('retro', [
    'arcade',
    'atari2600',
    'atari5200',
    'atari7800',
    'atari8bit',
    'atari-st',
    'jaguar',
    'lynx',
    'neogeoaes',
    'neogeomvs',
    'neo-geo-cd',
    'neo-geo-pocket',
    'neo-geo-pocket-color',
    'amiga',
    'amiga-cd32',
  ]),
]);

export function platformFamily(slug: string): PlatformFamily | null {
  return PLATFORM_WHITELIST.get(slug) ?? null;
}
