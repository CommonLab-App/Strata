import { describe, expect, it } from 'vitest'
import { distanceKm } from '@/engine/geo'
import { velocityArrow } from './arrows'

describe('velocityArrow', () => {
  it('points along the motion with a length proportional to speed', () => {
    const a = velocityArrow('a', { lat: 40, lon: -120 }, { ve: 0, vn: 20 }, 'red')
    const [tail, head] = a.coordinates
    expect(head![0]).toBeCloseTo(-120, 6)
    expect(head![1]).toBeGreaterThan(40)
    expect(distanceKm({ lon: tail![0], lat: tail![1] }, { lon: head![0], lat: head![1] })).toBeCloseTo(200, 3)
    expect(a.coordinates).toHaveLength(5)
  })
  it('collapses to a point for a still station', () => {
    const a = velocityArrow('a', { lat: 40, lon: -120 }, { ve: 0, vn: 0 }, 'red')
    expect(a.coordinates[1]).toEqual(a.coordinates[0])
  })
})
