import { describe, expect, it } from 'vitest';
import {
  FIRST_HOF_SKIP_LOCK_MS,
  canSkip,
  isFinal,
  skip,
  startSequence,
  tick,
  type DropSequenceOptions,
} from './dropSequence';

const boss: DropSequenceOptions = { durationMs: 1400, skipLockMs: 0, reduced: false };
const firstHof: DropSequenceOptions = {
  durationMs: 4500,
  skipLockMs: FIRST_HOF_SKIP_LOCK_MS,
  reduced: false,
};

describe('séquence de drop', () => {
  it('démarre en cours et se termine à la fin de l’animation', () => {
    let s = startSequence(boss, 0);
    expect(s.phase).toBe('playing');
    s = tick(s, boss, 1399);
    expect(s.phase).toBe('playing');
    s = tick(s, boss, 1400);
    expect(s.phase).toBe('done');
    expect(isFinal(s.phase)).toBe(true);
  });

  it('un toucher saute directement à l’état final', () => {
    const s = skip(startSequence(boss, 0), boss, 200);
    expect(s.phase).toBe('skipped');
    // Une fois sautée, la fin naturelle ne change plus rien.
    expect(tick(s, boss, 5000).phase).toBe('skipped');
  });

  it('bloque le saut 1,5 s au premier Hall of Fame', () => {
    const s = startSequence(firstHof, 1000);
    expect(canSkip(s, firstHof, 1000 + 1499)).toBe(false);
    expect(skip(s, firstHof, 1000 + 1499).phase).toBe('playing');
    expect(skip(s, firstHof, 1000 + 1500).phase).toBe('skipped');
  });

  it('en mode réduit, part directement de l’état final', () => {
    const s = startSequence({ ...boss, reduced: true }, 0);
    expect(s.phase).toBe('skipped');
    expect(canSkip(s, boss, 0)).toBe(false);
  });

  it('ne revient jamais en arrière', () => {
    const done = tick(startSequence(boss, 0), boss, 2000);
    expect(skip(done, boss, 2100).phase).toBe('done');
  });
});
