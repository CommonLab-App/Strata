import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { firstPaintScript } from './src/app/firstPaint.ts'

const FIRST_PAINT_MARK = '<!--first-paint-->'

// The stored or system theme, applied before first paint so that the dark theme never flashes light. The script
// is made from the app's own definition of the preference, so the two cannot drift (firstPaint.test.ts).
export const firstPaint = {
  name: 'first-paint',
  transformIndexHtml(html: string) {
    if (!html.includes(FIRST_PAINT_MARK)) throw new Error(`index.html has no ${FIRST_PAINT_MARK} for the first-paint script`)
    return html.replace(FIRST_PAINT_MARK, () => `<script>${firstPaintScript()}</script>`)
  },
}

/**
 * Emits sw.js beside index.html from src/sw/worker.js with the bundle's assets, the shell and the fonts to precache.
 * The cache is named by a hash of that list, so a deploy that changes any file installs a fresh cache.
 */
export const serviceWorker = {
  name: 'service-worker',
  generateBundle(this: { emitFile(file: { type: 'asset'; fileName: string; source: string }): unknown }, _: unknown, bundle: Record<string, unknown>) {
    const fonts = readdirSync(path.resolve(import.meta.dirname, 'public/fonts')).filter((f) => f.endsWith('.woff2')).map((f) => `fonts/${f}`)
    const precache = ['./', 'manifest.webmanifest', 'favicon.svg', ...Object.keys(bundle).filter((f) => f !== 'index.html'), ...fonts]
    const version = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12)
    const source = readFileSync(path.resolve(import.meta.dirname, 'src/sw/worker.js'), 'utf8').replaceAll('__VERSION__', version).replaceAll('__PRECACHE__', JSON.stringify(precache))
    this.emitFile({ type: 'asset', fileName: 'sw.js', source })
  },
}

export default defineConfig({
  // Relative, so the same build serves from / or from /strata/.
  base: './',
  plugins: [react(), tailwindcss(), firstPaint, serviceWorker],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@data': path.resolve(import.meta.dirname, './data'),
    },
  },
  build: {
    // MapLibre's chunk is a little over 1 MB minified and does not tree-shake further; it is loaded lazily by the Explore pane.
    chunkSizeWarningLimit: 1100,
    modulePreload: {
      // A lazy chunk that imports from the entry chunk would preload the entry again (WebKit warns).
      resolveDependencies: (_, deps) => deps.filter((dep) => !/^assets\/index-[^/]+\.js$/.test(dep)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // Vitest hands a test an empty string for a stylesheet unless told otherwise; firstPaint.test.ts reads the app's for its colour schemes.
    css: { include: [/src\/index\.css/] },
  },
})
