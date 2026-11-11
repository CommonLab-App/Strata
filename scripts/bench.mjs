// Lighthouse mobile on the first topic's Explore pane, against the production build (`npm run build` first). Prints JSON.
//
// Two runs in one browser. The first pays the browser's cold start (GPU process, compositor shaders), which on this
// headless server takes close to a second and on a phone a fraction of that; the second measures the page alone.
// Headless Chromium here renders with SwiftShader (software GL), so blocking time includes shader work a phone's GPU
// driver would do instead. Run it on a machine with a GPU for the number that counts: CHROME_PATH=... npm run bench.
// BENCH_NO_WEBGL=1 disables WebGL altogether, which shows what the page scores apart from the globe's GL work.
import { spawn, execFileSync } from 'node:child_process'
import { launch } from 'chrome-launcher'

const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`
const PORT = Number(process.env.PORT ?? 4173)
const URL = process.argv[2] ?? `http://localhost:${PORT}/#/topic/earth-system/explore`

const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', detached: true })
await new Promise((r) => setTimeout(r, 2500))
const gl = process.env.BENCH_NO_WEBGL ? ['--disable-3d-apis'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
const chrome = await launch({ chromePath: CHROME, chromeFlags: ['--headless=new', '--no-sandbox', ...gl] })
try {
  const out = {}
  for (const run of ['cold', 'warm']) {
    const json = execFileSync('npx', ['lighthouse', URL, `--port=${chrome.port}`, '--only-categories=performance', '--output=json', '--quiet'], { maxBuffer: 64 * 1024 * 1024 })
    const { categories, audits } = JSON.parse(json)
    const ms = (id) => Math.round(audits[id].numericValue)
    out[run] = { score: Math.round(categories.performance.score * 100), fcp_ms: ms('first-contentful-paint'), lcp_ms: ms('largest-contentful-paint'), tbt_ms: ms('total-blocking-time'), speed_index_ms: ms('speed-index'), cls: Number(audits['cumulative-layout-shift'].numericValue.toFixed(3)), transfer_kb: Math.round(audits['total-byte-weight'].numericValue / 1024) }
  }
  console.log(JSON.stringify({ url: URL, webgl: process.env.BENCH_NO_WEBGL ? 'disabled' : 'swiftshader', ...out }, null, 2))
} finally {
  chrome.kill()
  // The npx wrapper spawns vite in its own process group; killing the group takes the server with it.
  process.kill(-preview.pid, 'SIGTERM')
}
