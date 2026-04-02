import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // NOTE: PWA SW generation disabled because workbox-build crashes on paths
    // containing apostrophes (Sophi's Playground). Will be fixed in Phase 9
    // when deploying — the deployed path won't have this issue.
    VitePWA({
      disable: process.env.NODE_ENV === 'production',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'sounds/*.mp3'],
      manifest: {
        name: "Sophi's Playground",
        short_name: "Sophi's",
        description: 'Minijuegos multijugador divertidos y seguros para jugar con tus amigas',
        theme_color: '#c4a7e7',
        background_color: '#1a1225',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  server: {
    port: 4000,
    open: true,
  },
});
