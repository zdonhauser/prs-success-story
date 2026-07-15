import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Set by the deploy workflow for the /staging/ build so the installed
// staging PWA is distinguishable from prod on a home screen.
const isStaging = process.env.VITE_APP_ENV === 'staging'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
