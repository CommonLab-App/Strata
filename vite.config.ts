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

export default defineConfig({
  // Relative, so the same build serves from / or from /strata/.
  base: './',
  plugins: [react(), tailwindcss(), firstPaint],
  // Where Cesium finds its runtime assets, copied to public/cesium/ by the package.json prepare script.
  define: { CESIUM_BASE_URL: JSON.stringify('./cesium/') },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Each candidate engine in a chunk of its own, so the build output states its size.
    rollupOptions: {
      output: {
        manualChunks: (id: string) => (id.includes('node_modules/cesium/') ? 'cesium' : id.includes('node_modules/maplibre-gl/') ? 'maplibre' : undefined),
      },
    },
    chunkSizeWarningLimit: 5000,
    modulePreload: {
      // A lazy chunk that imports from the entry chunk would preload the entry again (WebKit warns).
      resolveDependencies: (_, deps) => deps.filter((dep) => !/^assets\/index-[^/]+\.js$/.test(dep)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Vitest hands a test an empty string for a stylesheet unless told otherwise; firstPaint.test.ts reads the app's for its colour schemes.
    css: { include: [/src\/index\.css/] },
  },
})
