// Opens routes of the production build in headless Chromium, waits for each pane's status line to settle, saves a
// screenshot per route and fails on any console error or uncaught exception. `npm run build` first.
// Usage: node scripts/smoke.mjs <out dir> [route ...]   (routes default to the Explore panes that draw the globe)
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`
const PORT = 4174
const [out = 'smoke', ...routes] = process.argv.slice(2)
const ROUTES = routes.length > 0 ? routes : ['/#/week/1/explore', '/#/week/5/explore', '/#/week/8/explore']
mkdirSync(out, { recursive: true })

const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 2500))
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
let failed = false
try {
  for (const route of ROUTES) {
    const page = await browser.newPage()
    await page.setViewport({ width: 412, height: 900, deviceScaleFactor: 1 })
    const problems = []
    page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`))
    page.on('pageerror', (e) => problems.push(`exception: ${e.message}`))
    await page.goto(`http://localhost:${PORT}/${route}`, { waitUntil: 'networkidle0', timeout: 60000 })
    // The pane's status line stops saying Loading once its data is in; the globe gets a few seconds more to draw.
    await page.waitForFunction(() => ![...document.querySelectorAll('[role=status]')].some((n) => /Loading/.test(n.textContent ?? '')), { timeout: 30000 })
    await new Promise((r) => setTimeout(r, 5000))
    const status = await page.$$eval('[role=status]', (nodes) => nodes.map((n) => n.textContent?.trim()).join(' | '))
    const file = `${out}/${route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.png`
    await page.screenshot({ path: file, fullPage: true })
    const ok = problems.length === 0
    failed ||= !ok
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${route}  status: ${status}  -> ${file}`)
    for (const p of problems) console.log(`      ${p}`)
    await page.close()
  }
} finally {
  await browser.close()
  preview.kill()
}
process.exit(failed ? 1 : 0)
