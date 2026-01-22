import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import packageJson from './package.json'
import { createSharedConfig } from './vite.shared'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const plugins: PluginOption[] = [react()]

  if (IS_ELECTRON) {
    plugins.push(
      electron({
        main: {
          entry: 'electron/main/index.ts',
          vite: {
            build: {
              outDir: 'dist-electron/main',
              rollupOptions: {
                // Keep native/electron-only deps external; bundle nostr-tools etc.
                external: ['electron', 'ws']
              }
            }
          }
        },
        preload: {
          input: 'electron/preload/index.ts',
          vite: {
            build: {
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: ['electron'],
                output: {
                  format: 'cjs',
                  entryFileNames: '[name].cjs'
                }
              }
            }
          }
        }
      })
    )
  } else {
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,jpg,svg}'],
          globDirectory: 'dist/',
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          cleanupOutdatedCaches: true
        },
        devOptions: {
          enabled: true
        },
        manifest: {
          name: 'Nostr!moe',
          short_name: 'Nostr!moe',
          icons: [
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/pwa-monochrome.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'monochrome'
            }
          ],
          start_url: '/',
          display: 'standalone',
          background_color: '#FFFFFF',
          theme_color: '#FFFFFF',
          description: packageJson.description
        }
      })
    )
  }

  return {
    base: IS_ELECTRON ? './' : '/',
    define: {
      'import.meta.env.GIT_COMMIT': getGitHash(),
      'import.meta.env.APP_VERSION': getAppVersion(),
      'import.meta.env.VITE_COMMUNITY_RELAY_SETS': JSON.parse(
        JSON.stringify(env.VITE_COMMUNITY_RELAY_SETS ?? '[]')
      ),
      'import.meta.env.VITE_COMMUNITY_RELAYS': (env.VITE_COMMUNITY_RELAYS ?? '')
        .split(',')
        .map((url) => normalizeUrl(url))
        .filter(Boolean)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins
  }
})
