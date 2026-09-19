import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import type { Connect, Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// Sem a barra final, /pt cairia no fallback de SPA e abriria o Spelling Bee.
const redirectPortugueseWithoutSlash: Connect.NextHandleFunction = (req, res, next) => {
  const [path, query] = (req.url ?? '').split('?')
  if (path !== '/pt') return next()
  res.statusCode = 301
  res.setHeader('Location', query ? `/pt/?${query}` : '/pt/')
  res.end()
}

function soletrandoPage(): Plugin {
  return {
    name: 'soletrando-page',
    configureServer: (server) => void server.middlewares.use(redirectPortugueseWithoutSlash),
    configurePreviewServer: (server) => void server.middlewares.use(redirectPortugueseWithoutSlash),
  }
}

// https://vite.dev/config/
// Duas Versões no mesmo build: `/` é o Spelling Bee e `/pt/` é o Soletrando (docs/adr/0001).
export default defineConfig({
  plugins: [react(), soletrandoPage()],
  build: {
    rolldownOptions: {
      input: {
        main: page('./index.html'),
        pt: page('./pt/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
