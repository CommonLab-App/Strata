import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import pb2002 from '@data/tectonics/pb2002-boundaries.json'
import { BOUNDARY_COLOUR, boundaryLayer, type BoundaryFeature } from '@/map/boundaries'

/** The plan forbids any word of risk in a view of real events: the Explore panes' source must not carry one. */
const FORBIDDEN = /\b(risk\w*|danger\w*|hazard\w*|threat\w*|warning\w*|unsafe|safe|deadly|disaster\w*|catastroph\w*)\b/i

describe('Explore captions', () => {
  it.each(['week01', 'week05', 'week08', 'week09'])('%s says nothing about risk', (week) => {
    const source = readFileSync(new URL(`./${week}/Explore.tsx`, import.meta.url), 'utf8')
    expect(source.match(FORBIDDEN)).toBeNull()
  })
})

describe('boundaryLayer', () => {
  it('colours every bundled segment by a known kind', () => {
    const layer = boundaryLayer(pb2002.features as BoundaryFeature[])
    expect(layer.lines).toHaveLength(pb2002.features.length)
    const colours = new Set(Object.values(BOUNDARY_COLOUR))
    for (const line of layer.lines) expect(colours.has(line.colour)).toBe(true)
  })
})
