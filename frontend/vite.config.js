import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://salahdirectory.in',
      dynamicRoutes: [
        '/register-mosque',
        '/nearby-mosques',
        '/login'
      ],
      changefreq: {
        '/': 'daily',
        '/register-mosque': 'weekly',
        '/nearby-mosques': 'daily',
        '/login': 'monthly'
      },
      priority: {
        '/': 1.0,
        '/register-mosque': 0.8,
        '/nearby-mosques': 0.9,
        '/login': 0.7
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'prayer-times-api',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /https:\/\/mosque-time-directory-backend\.onrender\.com\/api\/(?!auth\/).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'backend-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /^http:\/\/localhost:5000\/api\/(?!auth\/).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'backend-api-local',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              networkTimeoutSeconds: 5
            }
          }
        ]
      },
      manifest: {
        name: 'Salah Directory',
        short_name: 'Salah Directory',
        description: 'Find nearby mosques, accurate prayer timings, Qibla direction, and Islamic resources.',
        theme_color: '#0F766E',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
