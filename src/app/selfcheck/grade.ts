import type { Question } from './questions'

/** Each question right or wrong (an unanswered one is wrong), and the count. Pure, so the stored best score is reproducible. */
export function grade(questions: Question[], answers: (number | null)[]): { results: boolean[]; correct: number; total: number } {
  const results = questions.map((q, i) => answers[i] === q.answer)
  return { results, correct: results.filter(Boolean).length, total: questions.length }
}
