import { describe, expect, it } from 'vitest';
import { collectionQuerySchema, loginSchema, openPackSchema, registerSchema } from './schemas';

const valid = {
  username: 'Link_64',
  email: 'Link@Hyrule.fr',
  password: 'triforce-courage',
  countryCode: 'fr',
  ageConfirmed: true,
};

describe('registerSchema', () => {
  it('normalise email et pays', () => {
    const r = registerSchema.parse(valid);
    expect(r.email).toBe('link@hyrule.fr');
    expect(r.countryCode).toBe('FR');
  });

  it.each([
    ['pseudo trop court', { username: 'ab' }],
    ['pseudo avec espace', { username: 'Link 64' }],
    ['email invalide', { email: 'pas-un-email' }],
    ['mot de passe trop court', { password: 'court' }],
    ['pays invalide', { countryCode: 'FRA' }],
    ['âge non confirmé (15 ans minimum)', { ageConfirmed: false }],
  ])('refuse : %s', (_label, patch) => {
    expect(registerSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepte email + mot de passe', () => {
    expect(loginSchema.parse({ email: 'A@B.fr', password: 'x' }).email).toBe('a@b.fr');
  });
});

describe('openPackSchema', () => {
  it('exige une clé d’idempotence UUID', () => {
    expect(openPackSchema.safeParse({ packTypeId: 1, idempotencyKey: 'abc' }).success).toBe(false);
    expect(
      openPackSchema.safeParse({
        packTypeId: 1,
        idempotencyKey: '7b0d5a3e-3c1e-4c8e-9f7a-0f1d2c3b4a5e',
      }).success,
    ).toBe(true);
  });
});

describe('collectionQuerySchema', () => {
  it('applique les valeurs par défaut et borne la page', () => {
    expect(collectionQuerySchema.parse({})).toMatchObject({
      page: 1,
      pageSize: 50,
      sort: 'recent',
    });
    expect(collectionQuerySchema.safeParse({ pageSize: '500' }).success).toBe(false);
    expect(collectionQuerySchema.parse({ rarity: 'hof', page: '3' })).toMatchObject({
      rarity: 'hof',
      page: 3,
    });
  });
});
