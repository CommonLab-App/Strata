import { useId } from 'react'
import { WORKSHEET_FIELDS, worksheetComplete, type WorksheetField } from '@/app/week/weekProgress'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'

const PROMPTS: Record<WorksheetField, { label: string; prompt: string }> = {
  hypothesis: {
    label: 'Hypothesis',
    prompt: 'You have a tray of damp sand, propped up at one end, and a cup of water. Write one statement about what the water will do to the sand that a pour could show to be wrong.',
  },
  variable: {
    label: 'Variable',
    prompt: 'Name the one thing you will change between pours (how much water, how steep the tray, how wet the sand), and what you will keep the same.',
  },
  prediction: {
    label: 'Prediction',
    prompt: 'If your hypothesis is right, what exactly will you see after the pour? Say also what you would see if it is wrong.',
  },
  observation: {
    label: 'Observation',
    prompt: 'Pour, watch, and write down what happened: shapes, where the sand went, how long it took. What you saw, not what you expected.',
  },
  conclusion: {
    label: 'Conclusion',
    prompt: 'Did the observation match the prediction? What does that say about the hypothesis, and what would you try on the next pour?',
  },
}

/**
 * Week 1 lab: the scientific method on a sand-and-water model, as a guided observation form. Every keystroke is
 * saved to the week's worksheet; "Finish lab" marks it done once every field has something in it.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const complete = worksheetComplete(progress.worksheet)
  return (
    <form
      className="grid max-w-prose gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (complete) update({ labDone: true })
      }}
    >
      <p className="text-muted-foreground">
        A baking tray, a few cups of sand or soil, something to prop one end up, and a cup of water are enough. If you
        have none of them to hand, think the experiment through and write what you would do and expect; come back and
        fill in the observation when you can pour.
      </p>
      {WORKSHEET_FIELDS.map((field) => (
        <div key={field} className="grid gap-1">
          <label htmlFor={`${id}-${field}`} className="font-medium">
            {PROMPTS[field].label}
          </label>
          <p id={`${id}-${field}-hint`} className="text-sm text-muted-foreground">
            {PROMPTS[field].prompt}
          </p>
          <textarea
            id={`${id}-${field}`}
            aria-describedby={`${id}-${field}-hint`}
            rows={3}
            className="rounded-md border bg-background p-2 text-sm"
            value={progress.worksheet[field]}
            onChange={(e) => update({ worksheet: { ...progress.worksheet, [field]: e.target.value } })}
          />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!complete || progress.labDone}>
          {progress.labDone ? 'Lab finished' : 'Finish lab'}
        </Button>
        {!complete && <p className="text-sm text-muted-foreground">Fill in every field to finish.</p>}
        {progress.labDone && (
          <p className="text-sm text-muted-foreground" role="status">
            Saved. You can keep editing; the week stays finished.
          </p>
        )}
      </div>
    </form>
  )
}
