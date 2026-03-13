import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { copyFile, mkdir } from 'fs/promises'
import path from 'path'
import { type Plugin, type ResolvedConfig, defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

function copyOneSignalWorkers(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'copy-onesignal-workers',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async closeBundle() {
      const publicDir = path.resolve(config.root, 'public')
      const outDir = path.resolve(config.root, config.build.outDir)
      const workerFiles = [
        'OneSignalSDKWorker.js',
        'OneSignalSDKUpdaterWorker.js',
        'OneSignalSDK.sw.js',
      ]

      await mkdir(outDir, { recursive: true })

      await Promise.all(
        workerFiles.map(async (fileName) => {
          const sourcePath = path.join(publicDir, fileName)
          const destinationPath = path.join(outDir, fileName)

          await copyFile(sourcePath, destinationPath)
        }),
      )
    },
  }
}

export default defineConfig({
  server: {
    port: 8000,
  },
  preview: {
    port: 8000,
  },
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    copyOneSignalWorkers(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'Horsch',
        short_name: 'Horsch',
        description: 'Horsch Order Management',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa/72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa/128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa/144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa/192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa/512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          effector: ['effector', 'effector-react'],
          utils: ['axios'],
        },
      },
    },
  },
})
