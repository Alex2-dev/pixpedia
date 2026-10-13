import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/src/**/*.test.ts', 'apps/**/src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
    // Les tests d'intégration partagent la base pixpedia_test : un fichier à la fois.
    fileParallelism: false,
  },
});
