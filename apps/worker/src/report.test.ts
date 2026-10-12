import { describe, expect, it } from 'vitest';
import { countStatus, emptyReport, formatDuration, formatReport } from './report';

describe('rapport', () => {
  it('compte les statuts par raison', () => {
    const r = emptyReport('full');
    countStatus(r, 'eligible', null);
    countStatus(r, 'excluded', 'inclusion:platform');
    countStatus(r, 'excluded', 'inclusion:platform');
    countStatus(r, 'quarantine', 'content:keyword:nsfw');
    expect(r).toMatchObject({
      eligible: 1,
      excluded: 2,
      quarantined: 1,
      excludedByReason: { 'inclusion:platform': 2 },
      quarantinedByReason: { 'content:keyword:nsfw': 1 },
    });
    const text = formatReport(r);
    expect(text).toContain('Import complet');
    expect(text).toContain('inclusion:platform');
  });

  it('formate les durées', () => {
    expect(formatDuration(4_200)).toBe('4 s');
    expect(formatDuration(125_000)).toBe('2 min 5 s');
    expect(formatDuration(3_725_000)).toBe('1 h 2 min');
  });
});
