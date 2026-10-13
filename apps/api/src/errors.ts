import type { FastifyReply } from 'fastify';
import type { z } from 'zod';

/** Erreur métier renvoyée telle quelle au client (`{ error: code }`). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

export function sendInvalid(reply: FastifyReply, error: z.ZodError) {
  return reply.code(400).send({ error: 'invalid_input', issues: error.issues });
}
