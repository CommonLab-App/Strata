import { describe, expect, it } from 'vitest'
import { ticks } from './Plot'

describe('ticks', () => {
  it('picks round steps that cover the range', () => {
    expect(ticks(0, 100)).toEqual([0, 20, 40, 60, 80, 100])
    expect(ticks(45, 80)).toEqual([50, 60, 70, 80])
    expect(ticks(0, 1)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    expect(ticks(3, 3)).toEqual([3])
  })
})
