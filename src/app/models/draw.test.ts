import { describe, expect, it } from 'vitest'
import { arrow, block, MATERIAL, mix } from './draw'

describe('draw helpers', () => {
  it('mixes toward chalk and basement', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(mix('#DDA247', '#DDA247', 1)).toBe('#dda247')
    expect(mix('#DDA247', '#1B1816', 0)).toBe('#dda247')
  })
  it('projects depth up-right', () => {
    const b = block(0, 100, 100, 50, 50)
    expect(b.top).toBe('0,100 100,100 131,82 31,82')
    expect(b.side).toBe('100,100 131,82 131,132 100,150')
    expect(b.front).toBe('0,100 100,100 100,150 0,150')
  })
  it('names every material once', () => {
    expect(new Set(Object.values(MATERIAL)).size).toBe(Object.keys(MATERIAL).length)
  })
  it('draws an arrow that ends at its tip', () => {
    expect(arrow(0, 0, 20, 0)).toBe('M0 0L13 0M13 -3.5L20 0L13 3.5Z')
  })
})
