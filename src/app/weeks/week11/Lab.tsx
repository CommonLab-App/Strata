import { useId } from 'react'
import { z } from 'zod'
import periods from '@data/timescale/periods.json'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { ageOk, intervalAt, ISOTOPES, samples } from '@/engine/dating'
import { TimeScale } from './TimeScale'

const worksheetSchema = z.object({
  seed: z.number().int(),
  ages: z.record(z.string(), z.number().nullable()),
  periods: z.record(z.string(), z.string().nullable()),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const fresh = (seed: number): Worksheet => ({ seed, ages: {}, periods: {}, checked: false, score: null })
const periodOf = (years: number) => intervalAt(periods, years / 1e6)?.name ?? 'Precambrian, before the Ediacaran'
const PERIOD_OPTIONS = [...periods.filter((p) => p.startMa <= 540).map((p) => p.name), 'Precambrian, before the Ediacaran']

/**
 * Week 11 lab: three samples, each with a measured daughter-to-parent ratio for a named system. The learner works
 * out the age in years (t = half-life × log2(1 + D/P)) and places it on the time scale. Two marks per sample.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : null
  if (!ws) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">Three samples will be reported to you with their measured isotope ratios. Date each one and place it on the time scale.</p>
        <div>
          <Button onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>Get the samples</Button>
        </div>
      </div>
    )
  }
  const set = samples(ws.seed)
  const save = (patch: Partial<Worksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })
  const complete = set.every((s) => ws.ages[s.id] !== null && ws.ages[s.id] !== undefined && ws.periods[s.id])
  const marks = set.map((s) => ({ age: ws.ages[s.id] !== null && ws.ages[s.id] !== undefined && ageOk(s, ws.ages[s.id]!), period: ws.periods[s.id] === periodOf(s.years) }))
  const check = () => update({ data: { ...ws, checked: true, score: marks.reduce((n, m) => n + Number(m.age) + Number(m.period), 0) }, labDone: true })

  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        For each sample the lab reports the system measured and the daughter-to-parent ratio, assuming no daughter
        was present when the sample formed. Age in years is the half-life times log₂(1 + D/P). Enter the age, then
        pick the period it falls in.
      </p>
      <table className="text-sm">
        <caption className="sr-only">Half-lives of the systems</caption>
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="pr-3 font-normal">System</th>
            <th className="pr-3 font-normal">Half-life</th>
            <th className="font-normal">Dates well</th>
          </tr>
        </thead>
        <tbody>
          {ISOTOPES.map((iso) => (
            <tr key={iso.id}>
              <td className="pr-3">
                {iso.parent} → {iso.daughter}
              </td>
              <td className="pr-3 tabular-nums">{iso.halfLife.toLocaleString()} years</td>
              <td className="tabular-nums">
                {iso.range[0].toLocaleString()} to {iso.range[1].toLocaleString()} years
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ol className="grid gap-3">
        {set.map((s, i) => {
          const iso = ISOTOPES.find((x) => x.id === s.isotope)!
          return (
            <li key={s.id} className="grid gap-2 rounded-lg border bg-card p-4 text-sm">
              <h2 className="font-medium">
                Sample {i + 1}: {iso.parent} → {iso.daughter}, daughter to parent {s.ratio}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label htmlFor={`${id}-${s.id}-age`}>Age (years)</label>
                  <input id={`${id}-${s.id}-age`} type="number" min={0} step="any" className="rounded-md border bg-background p-2" value={ws.ages[s.id] ?? ''} onChange={(e) => save({ ages: { ...ws.ages, [s.id]: e.target.value === '' ? null : Number(e.target.value) } })} />
                </div>
                <div className="grid gap-1">
                  <label htmlFor={`${id}-${s.id}-period`}>Period</label>
                  <select id={`${id}-${s.id}-period`} className="rounded-md border bg-background p-2" value={ws.periods[s.id] ?? ''} onChange={(e) => save({ periods: { ...ws.periods, [s.id]: e.target.value || null } })}>
                    <option value="">Choose</option>
                    {PERIOD_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {ws.checked && (
                <p role="status" className={marks[i]!.age && marks[i]!.period ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                  {marks[i]!.age ? 'Age within 5 %.' : `Age: the ratio gives about ${Math.round(iso.halfLife * Math.log2(1 + s.ratio)).toLocaleString()} years.`} {marks[i]!.period ? 'Period right.' : `Period: ${periodOf(s.years)}.`}
                </p>
              )}
            </li>
          )
        })}
      </ol>
      <TimeScale markers={set.flatMap((s, i) => (ws.ages[s.id] ? [{ ma: ws.ages[s.id]! / 1e6, label: `S${i + 1}` }] : []))} />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!complete}>
          Check
        </Button>
        <Button variant="outline" onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>
          New samples
        </Button>
        {!complete && <p className="text-sm text-muted-foreground">Enter an age and a period for every sample to check.</p>}
        {ws.checked && (
          <p className="font-medium" role="status">
            {ws.score} of {set.length * 2}.
          </p>
        )}
      </div>
    </div>
  )
}
