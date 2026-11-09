import { describe, expect, it } from 'vitest'
import { erupt, landed, logViscosity, PROMPTS } from './index'

const basalt = { silica: 50, water: 0.5, temperature: 1200 }
const andesite = { silica: 60, water: 2, temperature: 1000 }
const rhyolite = { silica: 73, water: 0, temperature: 800 }

describe('volcano model', () => {
  it('orders the end members as the textbooks do', () => {
    expect(logViscosity(basalt)).toBeGreaterThan(1)
    expect(logViscosity(basalt)).toBeLessThan(3)
    expect(logViscosity(andesite)).toBeGreaterThan(3)
    expect(logViscosity(andesite)).toBeLessThan(5)
    expect(logViscosity(rhyolite)).toBeGreaterThan(7)
    expect(logViscosity(rhyolite)).toBeLessThan(9)
  })
  it('gives the textbook styles', () => {
    expect(erupt(basalt).style).toBe('effusive')
    expect(erupt({ ...basalt, water: 1.5 }).style).toBe('strombolian')
    expect(erupt(andesite).style).toBe('vulcanian')
    expect(erupt({ ...rhyolite, water: 4 }).style).toBe('plinian')
    expect(erupt(rhyolite).style).toBe('effusive')
  })
  it('lands each prompt with its own end member and no other', () => {
    const answers = { shield: basalt, strato: andesite, caldera: { ...rhyolite, water: 4 } }
    for (const prompt of PROMPTS) {
      expect(landed(prompt, answers[prompt.id])).toBe(true)
      for (const [id, magma] of Object.entries(answers)) if (id !== prompt.id) expect(landed(prompt, magma)).toBe(false)
    }
  })
})
