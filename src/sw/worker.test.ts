import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import { serviceWorker } from '../../vite.config'
import worker from './worker.js?raw'

describe('service worker build', () => {
  it('precaches the shell, every bundle asset and the fonts under a cache named by their hash', () => {
    const emitted: { fileName: string; source: string }[] = []
    serviceWorker.generateBundle.call({ emitFile: (f) => emitted.push(f) }, undefined, { 'index.html': {}, 'assets/index-abc.js': {}, 'assets/index-abc.css': {}, 'assets/quartz-def.js': {} })
    const sw = emitted[0]
    expect(sw?.fileName).toBe('sw.js')
    const list = JSON.parse(/const PRECACHE = (\[.*?\])/.exec(sw?.source ?? '')?.[1] ?? '[]') as string[]
    expect(list).toContain('./')
    expect(list).toContain('assets/quartz-def.js')
    expect(list.some((f) => f.startsWith('fonts/') && f.endsWith('.woff2'))).toBe(true)
    expect(list).not.toContain('index.html')
    expect(sw?.source).toMatch(/const VERSION = '[0-9a-f]{12}'/)
  })

  it('is a classic script with no module syntax, and the page links the manifest', () => {
    expect(worker).not.toMatch(/^\s*(import|export)\b/m)
    expect(indexHtml).toContain('manifest.webmanifest')
  })
})
