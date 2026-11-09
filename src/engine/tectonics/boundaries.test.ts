import { describe, expect, it } from 'vitest'
import pb2002 from '@data/tectonics/pb2002-boundaries.json'
import { boundaryAnswerOk, midpoint, nearestBoundary, type BoundaryLine } from './boundaries'

const lines = pb2002.features.map((f) => ({ kind: f.properties.kind, coordinates: f.geometry.coordinates })) as BoundaryLine[]

describe('nearestBoundary', () => {
  it('finds a transform near the San Andreas system and nothing in the continental interior', () => {
    expect(nearestBoundary({ lat: 36.5, lon: -121.0 }, lines)?.kind).toBe('transform')
    expect(nearestBoundary({ lat: 39.0, lon: -98.0 }, lines)).toBeNull()
  })
  it('finds divergent on the Mid-Atlantic Ridge and convergent off the Pacific Northwest', () => {
    expect(nearestBoundary({ lat: 0.0, lon: -25.0 }, lines)?.kind).toBe('divergent')
    expect(nearestBoundary({ lat: 46.0, lon: -125.5 }, lines)?.kind).toBe('convergent')
  })
  it('scores the learner answer against the midpoint', () => {
    const a = { lat: 34.0, lon: -118.0 }
    const b = { lat: 38.0, lon: -122.0 }
    expect(boundaryAnswerOk(midpoint(a, b), lines, 'transform')).toBe(true)
    expect(boundaryAnswerOk(midpoint(a, b), lines, 'none')).toBe(false)
    expect(boundaryAnswerOk({ lat: 39, lon: -98 }, lines, 'none')).toBe(true)
  })
  it('midpoint crosses the antimeridian', () => {
    expect(Math.abs(midpoint({ lat: 0, lon: 179 }, { lat: 0, lon: -179 }).lon)).toBeCloseTo(180, 6)
  })
})
