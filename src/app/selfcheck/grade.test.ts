import { describe, expect, it } from 'vitest'
import week01 from '@data/self-checks/week-01.json'
import { grade } from './grade'
import { questionsSchema } from './questions'

const questions = questionsSchema.parse(week01)

describe('self-check grading', () => {
  it('counts right answers, treating blanks and wrong indexes as wrong', () => {
    const all = grade(questions, questions.map((q) => q.answer))
    expect(all).toMatchObject({ correct: 10, total: 10 })
    const none = grade(questions, questions.map(() => null))
    expect(none.correct).toBe(0)
    const mixed = grade(questions, questions.map((q, i) => (i % 2 === 0 ? q.answer : (q.answer + 1) % 4)))
    expect(mixed.correct).toBe(5)
    expect(mixed.results).toEqual([true, false, true, false, true, false, true, false, true, false])
  })
})

describe('week-01 self-check data', () => {
  it('is ten four-option questions with unique ids and an answer that is one of the options', () => {
    expect(questions).toHaveLength(10)
    expect(new Set(questions.map((q) => q.id)).size).toBe(10)
    for (const q of questions) {
      expect(q.options[q.answer]).toBeTypeOf('string')
      expect(new Set(q.options).size).toBe(4)
    }
  })
})
