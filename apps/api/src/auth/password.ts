import { hash, verify } from '@node-rs/argon2';

// `Algorithm` est un const enum, inaccessible avec verbatimModuleSyntax : 2 = Argon2id.
const ARGON2ID = 2;

// Paramètres argon2id recommandés par l'OWASP (19 Mio, 2 passes).
const OPTIONS = { algorithm: ARGON2ID, memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  return verify(passwordHash, password);
}

/** Hash factice : un email inconnu coûte autant qu'un mauvais mot de passe (pas d'énumération par le temps). */
let dummyHash: Promise<string> | null = null;
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= hashPassword('mot-de-passe-factice-pour-le-timing');
  await verify(await dummyHash, password);
  return false;
}
