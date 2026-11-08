import { useState } from 'react'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { grade } from './grade'
import type { Question } from './questions'

/** Ten multiple-choice questions, checked on demand. Retry as often as wanted; the best score is what the week keeps. */
export function SelfCheck({ questions, progress, update }: LabProps & { questions: Question[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [result, setResult] = useState<ReturnType<typeof grade> | null>(null)
  const answered = answers.every((a) => a !== null)

  const check = () => {
    const graded = grade(questions, answers)
    setResult(graded)
    update({ selfCheckAttempts: progress.selfCheckAttempts + 1, selfCheckBest: Math.max(progress.selfCheckBest ?? 0, graded.correct) })
  }
  const retry = () => {
    setAnswers(questions.map(() => null))
    setResult(null)
  }

  return (
    <div className="grid max-w-prose gap-6">
      <p className="text-muted-foreground">
        Ten questions on this week. Check your answers when you are done; you can try again as often as you like, and
        your best score is kept.
        {progress.selfCheckBest !== null && ` Best so far: ${progress.selfCheckBest}/${questions.length} in ${progress.selfCheckAttempts} ${progress.selfCheckAttempts === 1 ? 'attempt' : 'attempts'}.`}
      </p>
      <ol className="grid gap-5">
        {questions.map((q, i) => (
          <li key={q.id}>
            <fieldset disabled={result !== null}>
              <legend className="mb-2 font-medium">
                {i + 1}. {q.prompt}
              </legend>
              <div className="grid gap-1">
                {q.options.map((option, j) => (
                  <label key={j} className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-muted has-checked:bg-muted">
                    <input type="radio" name={q.id} className="mt-1" checked={answers[i] === j} onChange={() => setAnswers(answers.map((a, k) => (k === i ? j : a)))} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {result && (
                <p className={`mt-2 text-sm ${result.results[i] ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`} role="status">
                  {result.results[i] ? 'Correct.' : `Not quite: ${q.options[q.answer]}.`} {q.explanation}
                </p>
              )}
            </fieldset>
          </li>
        ))}
      </ol>
      {result ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-medium" role="status">
            {result.correct} of {result.total} correct.
          </p>
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : (
        <div>
          <Button onClick={check} disabled={!answered}>
            Check answers
          </Button>
          {!answered && <p className="mt-1 text-sm text-muted-foreground">Answer every question to check.</p>}
        </div>
      )}
    </div>
  )
}
