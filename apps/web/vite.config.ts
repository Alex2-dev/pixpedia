import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Sous-chemin de déploiement : /pixpedia/ en production, racine en dev.
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Pixpedia',
        short_name: 'Pixpedia',
        description: 'Collectionne tous les jeux vidéo jamais sortis.',
        lang: 'fr',
        theme_color: '#120E1A',
        background_color: '#120E1A',
        display: 'standalone',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Les réponses de l'API ne doivent jamais être servies depuis le cache.
        navigateFallbackDenylist: [/\/api\//],
      },
    }),
  ],
  server: {
    strictPort: true,
    // Même origine que le front : le cookie de session suit sans CORS (comme derrière Nginx en prod).
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:3014',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
