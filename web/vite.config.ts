import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Zayra Biryani',
        short_name: 'Zayra Biryani',
        description: 'Authentic Hyderabadi dum biryani from Bhubaneswar. Opening soon.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // Matches the site's emerald brand so the OS splash/status bar never
        // flashes a mismatched color while the page loads.
        background_color: '#f7f1e5',
        theme_color: '#0a2a21',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Menu/prices should never be served stale for long: check the
        // network first, fall back to cache only when offline.
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => !sameOrigin && url.pathname.includes('/config'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bn-config',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Dish photos rarely change once uploaded — cache aggressively.
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'bn-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
