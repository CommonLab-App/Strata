// Phase-1 engine bench. Serves dist/ with vite preview, then for each engine: frame rate with 10,000 synthetic
// points in headless Chromium (software GL: numbers compare the two engines, they are not phone numbers), and a
// Lighthouse mobile run of the page with the day's quakes alone. Prints JSON. `npm run build` first.
import { spawn, execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { chromium } from 'playwright-core'

const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`
const PORT = 4173
const ENGINES = ['maplibre', 'cesium']

const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 2500))

const out = { bundle_kb: {}, fps: {}, lighthouse: {} }
for (const file of readdirSync('dist/assets')) {
  for (const engine of ENGINES) if (file.startsWith(`${engine}-`) && file.endsWith('.js')) out.bundle_kb[engine] = (out.bundle_kb[engine] ?? 0) + Math.round(statSync(`dist/assets/${file}`).size / 1024)
}

const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] })
try {
  for (const engine of ENGINES) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    page.on('pageerror', (e) => console.error(`[${engine}]`, e.message))
    await page.goto(`http://localhost:${PORT}/#/bench/${engine}?points=10000`)
    await page.waitForFunction(() => /^\{/.test(document.querySelector('#bench-result')?.textContent ?? ''), null, { timeout: 120_000 })
    out.fps[engine] = JSON.parse(await page.textContent('#bench-result'))
    await page.close()
  }
} finally {
  await browser.close()
}

for (const engine of ENGINES) {
  const json = execFileSync('npx', ['lighthouse', `http://localhost:${PORT}/#/bench/${engine}`, '--only-categories=performance', '--output=json', '--quiet', `--chrome-flags=--headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader`], {
    env: { ...process.env, CHROME_PATH: CHROME },
    maxBuffer: 64 * 1024 * 1024,
  })
  const { categories, audits } = JSON.parse(json)
  const ms = (id) => Math.round(audits[id].numericValue)
  out.lighthouse[engine] = { score: Math.round(categories.performance.score * 100), fcp_ms: ms('first-contentful-paint'), lcp_ms: ms('largest-contentful-paint'), tbt_ms: ms('total-blocking-time'), transfer_kb: Math.round(audits['total-byte-weight'].numericValue / 1024) }
}

preview.kill()
console.log(JSON.stringify(out, null, 2))
