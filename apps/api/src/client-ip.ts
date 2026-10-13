import type { FastifyRequest } from 'fastify';

/**
 * IP du joueur, pour la limitation de débit. Derrière Cloudflare, toutes les requêtes
 * arrivent depuis les IP de Cloudflare : la vraie adresse est dans `CF-Connecting-IP`.
 * L'en-tête n'est fiable que parce que Nginx n'accepte que les IP de Cloudflare sur /pixpedia/.
 */
export function clientIp(req: Pick<FastifyRequest, 'headers' | 'ip'>): string {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf.trim()) return cf.trim();
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.trim()) return real.trim();
  return req.ip;
}
