/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Set by the deploy workflow for the /staging/ build so the installed
// staging PWA is distinguishable from prod on a home screen.
const isStaging = process.env.VITE_APP_ENV === 'staging'

export default defineConfig({
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // The prod service worker's scope (site root) contains /staging/,
      // and workbox's default navigation fallback would answer staging
      // navigations with prod's cached index.html — silently serving the
      // old build on the staging URL. Deny staging paths so the staging
      // site always loads its own build.
      workbox: {
        navigateFallbackDenylist: [/\/staging\//],
      },
      includeAssets: ['logo-color.png', 'logo-black.png', 'logo-white.png', 'apple-touch-icon.png'],
      manifest: {
        name: isStaging ? 'PRS Success Story (Staging)' : 'PRS Success Story Builder',
        short_name: isStaging ? 'Story (Stg)' : 'Success Story',
        description: 'Create branded PRS Good Neighbor Program success stories',
        theme_color: '#1e3a5f',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
