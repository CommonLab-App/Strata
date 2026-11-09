import { describe, expect, it } from 'vitest'
import { splitAtAntimeridian } from './maplibre/index'

describe('splitAtAntimeridian', () => {
  it('leaves an ordinary line whole and cuts one that crosses the date line', () => {
    expect(splitAtAntimeridian([[-120, 40], [-110, 42], [-100, 45]])).toEqual([[[-120, 40], [-110, 42], [-100, 45]]])
    expect(splitAtAntimeridian([[170, 50], [178, 51], [-179, 52], [-170, 53]])).toEqual([[[170, 50], [178, 51]], [[-179, 52], [-170, 53]]])
  })
  it('drops a stranded single vertex', () => {
    expect(splitAtAntimeridian([[179, 0], [-179, 0]])).toEqual([])
  })
})
