import { describe, expect, it } from 'vitest'
import { gplatesPlates, gplatesPoints } from './gplates'

describe('gplates adapters', () => {
  it('normalizes reconstructed points from the service shape', () => {
    // As returned 2026-11-08 for points=-118.4,37.2,-74,40.7 at 100 Ma.
    const raw = { type: 'MultiPoint', coordinates: [[-79.4158, 39.4071], [-39.7855, 28.4649]] }
    const out = gplatesPoints.normalize(raw)
    expect(out).toEqual([[-79.42, 39.41], [-39.79, 28.46]])
    expect(gplatesPoints.normalized.parse(out)).toEqual(out)
    expect(gplatesPoints.sourceUrl({ points: [[-118.4, 37.2]], ageMa: 100 })).toContain('points=-118.4,37.2&time=100')
  })
  it('flattens plate polygons to rings', () => {
    const raw = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 0]]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: [[[[20, 20], [30, 20], [20, 30], [20, 20]]]] }, properties: {} },
      ],
    }
    const out = gplatesPlates.normalize(raw)
    expect(out).toHaveLength(2)
    expect(out[1]![0]).toEqual([20, 20])
    expect(gplatesPlates.normalized.parse(out)).toEqual(out)
  })
  it('rejects a response without features', () => {
    expect(() => gplatesPlates.normalize({ nope: true })).toThrow()
  })
})
