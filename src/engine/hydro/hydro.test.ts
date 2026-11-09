import { describe, expect, it } from 'vitest'
import { braidedSlope, hourly, hydrograph, pattern, type Series } from './index'

const t0 = Date.parse('2026-11-01T00:00:00Z')
const at = (h: number) => new Date(t0 + h * 3.6e6).toISOString()
// Flat at 100, rising from hour 10 to a peak of 500 at hour 16, then receding.
const series: Series = Array.from({ length: 48 }, (_, h) => [at(h), h < 10 ? 100 : h <= 16 ? 100 + ((h - 10) / 6) * 400 : 500 - (h - 16) * 20])

describe('hydrograph', () => {
  it('finds the peak and the start of the rise', () => {
    const s = hydrograph(series)!
    expect(s.peak).toEqual({ time: at(16), value: 500 })
    expect(s.riseStart.time).toBe(at(10))
    expect(s.riseHours).toBe(6)
  })
  it('averages to hourly', () => {
    const fine: Series = [['2026-11-01T00:00:00.000Z', 10], ['2026-11-01T00:15:00.000Z', 20], ['2026-11-01T01:00:00.000Z', 30]]
    expect(hourly(fine)).toEqual([['2026-11-01T00:00:00.000Z', 15], ['2026-11-01T01:00:00.000Z', 30]])
  })
  it('classes channels by the Leopold and Wolman line', () => {
    expect(pattern(braidedSlope(1000) * 2, 1000)).toBe('braided')
    expect(pattern(braidedSlope(1000) / 2, 1000)).toBe('meandering')
    expect(pattern(braidedSlope(1000) / 100, 1000)).toBe('straight')
  })
})
