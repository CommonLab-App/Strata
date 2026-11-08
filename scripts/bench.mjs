// Lighthouse mobile on the week-1 Explore pane, against the production build (`npm run build` first). Prints JSON.
// Headless Chromium here renders with SwiftShader (software GL), so blocking time includes shader work a phone's GPU
// driver would do instead.
import { spawn, execFileSync } from 'node:child_process'

const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`
const PORT = 4173
const URL = process.argv[2] ?? `http://localhost:${PORT}/#/week/1/explore`

const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 2500))
try {
  const json = execFileSync('npx', ['lighthouse', URL, '--only-categories=performance', '--output=json', '--quiet', '--chrome-flags=--headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader'], {
    env: { ...process.env, CHROME_PATH: CHROME },
    maxBuffer: 64 * 1024 * 1024,
  })
  const { categories, audits } = JSON.parse(json)
  const ms = (id) => Math.round(audits[id].numericValue)
  console.log(JSON.stringify({ url: URL, score: Math.round(categories.performance.score * 100), fcp_ms: ms('first-contentful-paint'), lcp_ms: ms('largest-contentful-paint'), tbt_ms: ms('total-blocking-time'), cls: audits['cumulative-layout-shift'].numericValue, transfer_kb: Math.round(audits['total-byte-weight'].numericValue / 1024) }, null, 2))
} finally {
  preview.kill()
}
