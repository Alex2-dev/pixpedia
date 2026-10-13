import { describe, expect, it } from 'vitest';
import { clientIp } from './client-ip';

describe('clientIp', () => {
  it('prend l’IP transmise par Cloudflare en priorité', () => {
    expect(
      clientIp({
        ip: '172.24.0.5',
        headers: { 'cf-connecting-ip': '203.0.113.7', 'x-real-ip': '1.1.1.1' },
      }),
    ).toBe('203.0.113.7');
  });

  it('se rabat sur X-Real-IP puis sur l’IP de la connexion', () => {
    expect(clientIp({ ip: '172.24.0.5', headers: { 'x-real-ip': '198.51.100.2' } })).toBe(
      '198.51.100.2',
    );
    expect(clientIp({ ip: '127.0.0.1', headers: {} })).toBe('127.0.0.1');
  });
});
