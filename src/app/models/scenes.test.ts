import { readdirSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Variant } from './ModelTab'
import { VARIANTS as plates } from '@/app/weeks/week08/Model'

/** Every topic with a Model tab, by folder. Grows as models land. */
const MODELS: [string, Variant[]][] = [['week08', plates]]

const FORBIDDEN = /\b(risk\w*|danger\w*|hazard\w*|threat\w*|warning\w*|unsafe|safe|deadly|disaster\w*|catastroph\w*)\b/i
const SENTENCE = /^[A-Z].*\.$/

describe.each(MODELS)('%s model', (_folder, variants) => {
  it('has unique variant ids', () => {
    expect(new Set(variants.map((v) => v.id)).size).toBe(variants.length)
  })
  it.each(variants.map((v) => [v.id, v] as const))('%s: labelled svg, parts match the drawing, plain captions', (_id, v) => {
    const html = renderToStaticMarkup(createElement(v.Scene, { selected: null }))
    expect(html).toContain('viewBox="0 0 400 260"')
    expect(html).toContain('role="img"')
    expect(html).toContain(`aria-label="${v.caption.replaceAll('"', '&quot;').replaceAll("'", '&#x27;')}"`)
    const drawn = new Set([...html.matchAll(/data-part="([^"]+)"/g)].map((m) => m[1]))
    expect([...drawn].sort()).toEqual(v.parts.map((p) => p.id).sort())
    expect(new Set(v.parts.map((p) => p.id)).size).toBe(v.parts.length)
    for (const text of [v.caption, ...v.parts.map((p) => p.text)]) {
      expect(text).toMatch(SENTENCE)
      expect(text.match(FORBIDDEN)).toBeNull()
    }
  })
})

it('every topic folder with a Model.tsx exports it lazily from index.ts and is listed here', () => {
  const folders = readdirSync(new URL('../weeks', import.meta.url)).filter((f) => {
    try {
      return readdirSync(new URL(`../weeks/${f}`, import.meta.url)).includes('Model.tsx')
    } catch {
      return false
    }
  })
  expect(folders.sort()).toEqual(MODELS.map(([f]) => f).sort())
})
