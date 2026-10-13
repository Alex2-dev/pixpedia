// Charge .env pour les tests d'intégration (TEST_DATABASE_URL), s'il existe.
try {
  process.loadEnvFile('.env');
} catch {
  // Pas de .env : les tests d'intégration sont ignorés.
}
