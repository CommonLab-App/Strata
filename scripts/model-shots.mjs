// Screenshots every variant of a topic's Model tab from the production build, drawing only, at 2x, so each scene
// can be checked by eye. `npm run build` first. With REDUCED=1 the page is loaded as if the system asked for
// reduced motion, so each shot is the loop's end state.
// Usage: node scripts/model-shots.mjs <out dir> <slug> [slug ...]   (PORT and DIST env to run several at once)
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`
const PORT = Number(process.env.PORT ?? 4175)
const DIST = process.env.DIST ?? 'dist'
const [out = 'shots', ...slugs] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--outDir', DIST], { stdio: 'ignore', detached: true })
await new Promise((r) => setTimeout(r, 2500))
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
let failed = false
try {
  for (const slug of slugs) {
    const page = await browser.newPage()
    await page.setViewport({ width: 412, height: 900, deviceScaleFactor: 2 })
    if (process.env.REDUCED) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    const problems = []
    page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`))
    page.on('pageerror', (e) => problems.push(`exception: ${e.message}`))
    await page.goto(`http://localhost:${PORT}/#/topic/${slug}/model`, { waitUntil: 'networkidle0', timeout: 60000 })
    await page.waitForSelector('svg[role=img]', { timeout: 30000 })
    const labels = await page.$$eval('[role=group][aria-label=Model] button', (b) => b.map((x) => x.textContent ?? ''))
    for (const [i, label] of (labels.length ? labels : ['']).entries()) {
      if (label) await (await page.$$('[role=group][aria-label=Model] button'))[i].click()
      await new Promise((r) => setTimeout(r, 2500))
      const svg = await page.$('svg[role=img]')
      const file = `${out}/${slug}-${i}-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'model'}.png`
      await svg.screenshot({ path: file })
      console.log(`${slug}: ${label || '(one variant)'} -> ${file}`)
    }
    for (const p of problems) console.log(`      ${p}`)
    failed ||= problems.length > 0
    await page.close()
  }
} finally {
  await browser.close()
  // The npx wrapper spawns vite in its own process group; killing the group takes the server with it.
  process.kill(-preview.pid, 'SIGTERM')
}
process.exit(failed ? 1 : 0)
