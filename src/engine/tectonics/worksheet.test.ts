import { describe, expect, it } from 'vitest'
import pb2002 from '@data/tectonics/pb2002-boundaries.json'
import type { BoundaryLine } from './boundaries'
import { relativeMotion } from './motion'
import { EMPTY_RELATIVE_MOTION, scoreRelativeMotion } from './worksheet'

const lines = pb2002.features.map((f) => ({ kind: f.properties.kind, coordinates: f.geometry.coordinates })) as BoundaryLine[]
// Two made-up stations either side of the San Andreas system: the western one carries the Pacific plate's motion.
const west = { lat: 36.0, lon: -121.5, ve: -22, vn: 28 }
const east = { lat: 36.5, lon: -120.0, ve: 0.5, vn: -0.3 }

describe('scoreRelativeMotion', () => {
  it('gives full marks to the recomputed answer and a transform boundary', () => {
    const r = relativeMotion(west, east)
    const result = scoreRelativeMotion({ ...EMPTY_RELATIVE_MOTION, a: 'WEST', b: 'EAST', speed: r.speed, azimuth: r.azimuth, boundary: 'transform' }, west, east, lines)
    expect(result.score).toBe(3)
  })
  it('loses the marks that are wrong and none for an empty sheet', () => {
    const r = relativeMotion(west, east)
    expect(scoreRelativeMotion({ ...EMPTY_RELATIVE_MOTION, speed: r.speed * 2, azimuth: r.azimuth, boundary: 'divergent' }, west, east, lines).score).toBe(1)
    expect(scoreRelativeMotion(EMPTY_RELATIVE_MOTION, west, east, lines).score).toBe(0)
  })
})
