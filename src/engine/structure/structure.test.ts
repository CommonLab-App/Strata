import { describe, expect, it } from 'vitest'
import { angleDifference, axisDifference, greatCircle, intersection, planeOfPole, pole, project, task } from './index'

describe('stereonet maths', () => {
  it('poles and planes invert', () => {
    const p = { strike: 30, dip: 40 }
    expect(pole(p)).toEqual({ trend: 300, plunge: 50 })
    expect(planeOfPole(pole(p))).toEqual(p)
  })
  it('a great circle starts along strike and passes through the dip direction', () => {
    const gc = greatCircle({ strike: 0, dip: 45 }, 4)
    expect(gc[0]!.plunge).toBeCloseTo(0)
    expect(axisDifference(gc[0]!.trend, 0)).toBeLessThan(0.01)
    expect(gc[2]!.trend).toBeCloseTo(90)
    expect(gc[2]!.plunge).toBeCloseTo(45)
  })
  it('projects a vertical line to the centre and a horizontal one to the rim', () => {
    expect(project({ trend: 0, plunge: 90 })).toEqual([0, 0])
    expect(Math.hypot(...project({ trend: 45, plunge: 0 }))).toBeCloseTo(1)
  })
  it('intersects two dipping planes in a line in both of them', () => {
    const a = { strike: 0, dip: 40 }
    const b = { strike: 90, dip: 40 }
    const line = intersection(a, b)
    // Both planes contain the line, so it is perpendicular to both poles.
    for (const plane of [a, b]) {
      const gc = greatCircle(plane, 360)
      const nearest = Math.min(...gc.map((l) => angleDifference(l.trend, line.trend) + Math.abs(l.plunge - line.plunge)))
      expect(nearest).toBeLessThan(2)
    }
  })
  it('makes reproducible tasks', () => {
    expect(task(9)).toEqual(task(9))
  })
})
