import { defineConfig, devices } from '@playwright/test';

/**
 * Tests de bout en bout des animations, sur la page interne /dev/animations du serveur de dev.
 * Lancés dans l'image Docker officielle de Playwright (Arch Linux n'est pas pris en charge) :
 *   pnpm test:e2e   (le front de dev doit tourner : docker compose up)
 */
export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5186',
    // Téléphone de la maquette : 390 × 844.
    ...devices['Pixel 7'],
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
  },
});
