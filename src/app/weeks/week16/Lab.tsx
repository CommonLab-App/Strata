import { useId } from 'react'
import { z } from 'zod'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { failureAngle, SLOPE_TOLERANCE_DEG, SOILS, task } from '@/engine/slope'

const worksheetSchema = z.object({
  seed: z.number().int(),
  angles: z.array(z.number().nullable()).length(3),
  notes: z.array(z.string()).length(3),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const fresh = (seed: number): Worksheet => ({ seed, angles: [null, null, null], notes: ['', '', ''], checked: false, score: null })
const LABELS = ['Dry and bare', 'Wet and bare', 'Wet with roots']
const MARKS = 3

/**
 * Week 16 lab: for one soil under three conditions, find the slope angle at which the factor of safety reaches 1
 * (use the Explore sandbox), and say in a line what each change did. Angles are scored; the lines are kept.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : null
  if (!ws) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">A soil and three conditions will be set; find the failure angle for each with the sandbox.</p>
        <div>
          <Button onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>Set the task</Button>
        </div>
      </div>
    )
  }
  const t = task(ws.seed)
  const soil = SOILS[t.soil]!
  const truth = t.settings.map((s) => failureAngle(soil, s.saturation, s.rootCohesion))
  const save = (patch: Partial<Worksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })
  const complete = ws.angles.every((a) => a !== null)
  const marks = ws.angles.map((a, i) => a !== null && Math.abs(a - truth[i]!) <= SLOPE_TOLERANCE_DEG)
  const check = () => update({ data: { ...ws, checked: true, score: marks.filter(Boolean).length }, labDone: true })

  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        The soil is <strong>{soil.name}</strong> (cohesion {soil.cohesion} kPa, friction angle {soil.friction}°, unit weight {soil.unitWeight} kN/m³, {soil.thickness} m thick).
        For each condition, use the Explore sandbox with the same soil and settings to find the angle at which the factor of safety
        falls to 1, to the nearest degree, and write one line on what the change did and why.
      </p>
      <ol className="grid gap-3">
        {t.settings.map((s, i) => (
          <li key={i} className="grid gap-2 rounded-lg border bg-card p-4 text-sm">
            <h2 className="font-medium">
              {i + 1}. {LABELS[i]}: saturation {s.saturation.toFixed(1)}, root cohesion {s.rootCohesion} kPa
            </h2>
            <div className="grid gap-2 sm:grid-cols-[10rem_1fr]">
              <div className="grid gap-1">
                <label htmlFor={`${id}-a${i}`}>Failure angle (°)</label>
                <input id={`${id}-a${i}`} type="number" min={0} max={90} className="rounded-md border bg-background p-2" value={ws.angles[i] ?? ''} onChange={(e) => save({ angles: ws.angles.map((a, k) => (k === i ? (e.target.value === '' ? null : Number(e.target.value)) : a)) })} />
              </div>
              <div className="grid gap-1">
                <label htmlFor={`${id}-n${i}`}>What changed and why</label>
                <input id={`${id}-n${i}`} className="rounded-md border bg-background p-2" value={ws.notes[i]} onChange={(e) => save({ notes: ws.notes.map((n, k) => (k === i ? e.target.value : n)) })} />
              </div>
            </div>
            {ws.checked && (
              <p role="status" className={marks[i] ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {marks[i] ? 'Within 2°.' : `The model fails this slope at ${truth[i]! >= 90 ? 'no angle' : `${truth[i]!.toFixed(0)}°`}.`}
              </p>
            )}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!complete}>
          Check
        </Button>
        <Button variant="outline" onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>
          New task
        </Button>
        {!complete && <p className="text-sm text-muted-foreground">Give all three angles to check.</p>}
        {ws.checked && (
          <p className="font-medium" role="status">
            {ws.score} of {MARKS}.
          </p>
        )}
      </div>
    </div>
  )
}
