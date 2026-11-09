import { z } from 'zod'
import { SectionView } from '@/app/strata/SectionView'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { generate, scoreOrder, shuffled } from '@/engine/strata'

const worksheetSchema = z.object({
  seed: z.number().int(),
  order: z.array(z.string()),
  unconformities: z.record(z.string(), z.enum(['angular', 'disconformity']).nullable()),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const fresh = (seed: number): Worksheet => ({ seed, order: shuffled(generate(seed)).map((e) => e.id), unconformities: {}, checked: false, score: null })
const MARKS = 2

/**
 * Week 10 lab: put a generated section's events in order, oldest first, and name each unconformity. The section
 * comes from a stored seed, so the checker knows the true order and the saved sheet reproduces after a reload.
 */
export function Lab({ progress, update }: LabProps) {
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : null
  if (!ws) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">A cross-section will be drawn for you. Put its events in order from oldest to youngest, and say what kind each unconformity is.</p>
        <div>
          <Button onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>Draw a section</Button>
        </div>
      </div>
    )
  }
  const section = generate(ws.seed)
  const events = ws.order.map((id) => section.events.find((e) => e.id === id)).filter((e) => e !== undefined)
  const erosions = section.events.filter((e) => e.kind === 'erosion')
  const save = (patch: Partial<Worksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= ws.order.length) return
    const order = [...ws.order]
    ;[order[i], order[j]] = [order[j]!, order[i]!]
    save({ order })
  }
  const result = scoreOrder(section, ws.order)
  const typesRight = erosions.every((e) => ws.unconformities[e.id] === section.surfaces.find((u) => u.id === e.id)?.type)
  const typesAnswered = erosions.every((e) => ws.unconformities[e.id])
  const check = () => update({ data: { ...ws, checked: true, score: Number(result.pairs === 1) + Number(typesRight) }, labDone: true })

  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        Read the section and arrange the events from oldest at the top to youngest at the bottom. Use the rules:
        beds lie on older beds, a feature that cuts another is younger, an erosion surface is younger than what it
        truncates and older than what covers it, and tilting comes after the beds it tilted.
      </p>
      <SectionView section={section} title="The section to interpret" />
      <ol className="grid gap-1" aria-label="Events, oldest first">
        {events.map((e, i) => (
          <li key={e.id} className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm">
            <span className="w-5 text-muted-foreground">{i + 1}.</span>
            <span className="flex-1">{e.label}</span>
            <Button size="sm" variant="ghost" aria-label={`Move ${e.label} up`} onClick={() => move(i, -1)} disabled={i === 0}>
              ↑
            </Button>
            <Button size="sm" variant="ghost" aria-label={`Move ${e.label} down`} onClick={() => move(i, 1)} disabled={i === events.length - 1}>
              ↓
            </Button>
          </li>
        ))}
      </ol>
      {erosions.length > 0 && (
        <fieldset className="grid gap-2 text-sm">
          <legend className="font-medium">What kind of unconformity is each erosion surface?</legend>
          {erosions.map((e, k) => (
            <div key={e.id} className="flex flex-wrap items-center gap-3">
              <span>
                U{k + 1}, {e.label.toLowerCase()}:
              </span>
              {(['angular', 'disconformity'] as const).map((t) => (
                <label key={t} className="flex items-center gap-1">
                  <input type="radio" name={e.id} checked={ws.unconformities[e.id] === t} onChange={() => save({ unconformities: { ...ws.unconformities, [e.id]: t } })} />
                  {t === 'angular' ? 'Angular unconformity' : 'Disconformity'}
                </label>
              ))}
            </div>
          ))}
        </fieldset>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!typesAnswered}>
          Check
        </Button>
        <Button variant="outline" onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>
          Another section
        </Button>
        {!typesAnswered && <p className="text-sm text-muted-foreground">Name every unconformity to check.</p>}
      </div>
      {ws.checked && (
        <section aria-labelledby="result-heading" className="rounded-lg border bg-card p-4 text-sm">
          <h2 id="result-heading" className="font-medium">
            {ws.score} of {MARKS}
          </h2>
          <ul className="mt-2 grid gap-1">
            <li>
              {Math.round(result.pairs * 100)} % of event pairs are in the right order.
              {result.broken && ` First slip: ${result.broken.first.label} is placed before ${result.broken.second.label}. ${result.broken.rule}`}
            </li>
            <li>{typesRight ? 'Every unconformity is named correctly.' : 'At least one unconformity is named wrongly: a surface is angular only when the beds beneath it were tilted before it was cut.'}</li>
          </ul>
        </section>
      )}
    </div>
  )
}
