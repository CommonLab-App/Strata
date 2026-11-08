import { describe, expect, it } from 'vitest'
import { createMemoryStore, peekStatus, weekEntry } from '@/app/progress/storage'
import { WEEKS } from '@/app/weeks'
import { EMPTY_PROGRESS, loadWeek, saveWeek, withStatus, worksheetComplete } from './weekProgress'

const week1 = WEEKS[0]

describe('week progress', () => {
  it('derives the status Home reads', () => {
    expect(withStatus(EMPTY_PROGRESS).status).toBe('not-started')
    expect(withStatus({ ...EMPTY_PROGRESS, worksheet: { ...EMPTY_PROGRESS.worksheet, hypothesis: 'x' } }).status).toBe('in-progress')
    expect(withStatus({ ...EMPTY_PROGRESS, selfCheckAttempts: 1, selfCheckBest: 7 }).status).toBe('in-progress')
    expect(withStatus({ ...EMPTY_PROGRESS, labDone: true }).status).toBe('in-progress')
    expect(withStatus({ ...EMPTY_PROGRESS, labDone: true, selfCheckAttempts: 1, selfCheckBest: 0 }).status).toBe('completed')
  })

  it('round-trips through the store under the week entry, where Home peeks at it', () => {
    const store = createMemoryStore()
    expect(loadWeek(store, week1)).toEqual(EMPTY_PROGRESS)
    const done = withStatus({ ...EMPTY_PROGRESS, labDone: true, selfCheckAttempts: 2, selfCheckBest: 9 })
    expect(saveWeek(store, week1, done)).toBe(true)
    expect(loadWeek(store, week1)).toEqual(done)
    expect(peekStatus(store, weekEntry(1), week1.version)).toBe('completed')
    expect(store.getItem('strata:week:01')).not.toBeNull()
  })

  it('counts a worksheet complete only when every field has text', () => {
    expect(worksheetComplete(EMPTY_PROGRESS.worksheet)).toBe(false)
    const full = { hypothesis: 'a', variable: 'b', prediction: 'c', observation: 'd', conclusion: ' ' }
    expect(worksheetComplete(full)).toBe(false)
    expect(worksheetComplete({ ...full, conclusion: 'e' })).toBe(true)
  })
})
