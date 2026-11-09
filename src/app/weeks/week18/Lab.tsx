import { useEffect, useId, useState } from 'react'
import { z } from 'zod'
import { DataFooter } from '@/app/week/DataFooter'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { loadMoonCraters, type Catalogue } from '@/data/craters/schema'
import { boxAreaKm2, COUNT_TOLERANCE, countCraters, density, task, type Crater } from '@/engine/craters'
import { PLANETS } from '@/map/planets'
import { PlanetGlobe } from './PlanetGlobe'

const MIN_DIAMETER = 50
const worksheetSchema = z.object({
  seed: z.number().int(),
  counts: z.array(z.number().nullable()).length(2),
  older: z.enum(['A', 'B', 'same']).nullable(),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const fresh = (seed: number): Worksheet => ({ seed, counts: [null, null], older: null, checked: false, score: null })
const MARKS = 3

/**
 * Week 18 lab: count the craters at least 50 km across inside two boxes on the Moon, then say which surface is
 * older. The checker counts the bundled catalogue in the same boxes; after the check the catalogued craters are drawn.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : null
  const [moon, setMoon] = useState<{ catalogue: Catalogue; craters: Crater[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    loadMoonCraters()
      .then(setMoon)
      .catch((e) => setError(String(e)))
  }, [])
  if (!ws) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">Two boxes will be drawn on the Moon. Count the larger craters in each and decide which surface is older.</p>
        <div>
          <Button onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>Draw the boxes</Button>
        </div>
      </div>
    )
  }
  const boxes = task(ws.seed)
  const truth = moon ? boxes.map((b) => countCraters(moon.craters, b, MIN_DIAMETER)) : null
  const densities = truth ? boxes.map((b, i) => density(truth[i]!, boxAreaKm2(b, PLANETS.moon.radiusKm))) : null
  const olderTruth = densities ? (Math.abs(densities[0]! - densities[1]!) / Math.max(densities[0]!, densities[1]!, 1e-9) < 0.1 ? 'same' : densities[0]! > densities[1]! ? 'A' : 'B') : null
  const save = (patch: Partial<Worksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })
  const complete = ws.counts.every((c) => c !== null) && ws.older !== null
  const marks = truth && complete ? [...ws.counts.map((c, i) => Math.abs(c! - truth[i]!) <= Math.max(2, COUNT_TOLERANCE * truth[i]!)), ws.older === olderTruth] : null
  const check = () => marks && update({ data: { ...ws, checked: true, score: marks.filter(Boolean).length }, labDone: true })

  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        Zoom into each box and count the craters at least about {MIN_DIAMETER} km across (a box is 20° on a side, roughly 600 km). More craters
        per unit area means an older surface: it has been collecting impacts for longer. The catalogued craters are drawn after you check.
      </p>
      <PlanetGlobe key={ws.seed} planet="moon" boxes={boxes} craters={ws.checked && moon ? moon.craters : []} minDiameter={MIN_DIAMETER}>
        <ul className="flex flex-wrap gap-x-4 text-xs text-muted-foreground" aria-label="Legend">
          <li>
            <span aria-hidden className="mr-1 inline-block h-0.5 w-5 bg-[#2563eb] align-middle" />
            Box A: {boxes[0].south}° to {boxes[0].north}°, {boxes[0].west}° to {boxes[0].east}°
          </li>
          <li>
            <span aria-hidden className="mr-1 inline-block h-0.5 w-5 bg-[#dc2626] align-middle" />
            Box B: {boxes[1].south}° to {boxes[1].north}°, {boxes[1].west}° to {boxes[1].east}°
          </li>
        </ul>
      </PlanetGlobe>
      <div className="grid gap-3 sm:grid-cols-3">
        {['A', 'B'].map((label, i) => (
          <div key={label} className="grid gap-1 text-sm">
            <label htmlFor={`${id}-c${i}`}>Craters ≥ {MIN_DIAMETER} km in box {label}</label>
            <input id={`${id}-c${i}`} type="number" min={0} className="rounded-md border bg-background p-2" value={ws.counts[i] ?? ''} onChange={(e) => save({ counts: ws.counts.map((c, k) => (k === i ? (e.target.value === '' ? null : Number(e.target.value)) : c)) })} />
          </div>
        ))}
        <div className="grid gap-1 text-sm">
          <label htmlFor={`${id}-older`}>Which surface is older?</label>
          <select id={`${id}-older`} className="rounded-md border bg-background p-2" value={ws.older ?? ''} onChange={(e) => save({ older: (e.target.value || null) as Worksheet['older'] })}>
            <option value="">Choose</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="same">About the same</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!complete || !moon}>
          Check
        </Button>
        <Button variant="outline" onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>
          New boxes
        </Button>
        {!complete && <p className="text-sm text-muted-foreground">Give both counts and a choice to check.</p>}
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            The catalogue could not load: {error}
          </p>
        )}
      </div>
      {ws.checked && marks && truth && densities && (
        <section aria-labelledby="result-heading" className="rounded-lg border bg-card p-4 text-sm">
          <h2 id="result-heading" className="font-medium">
            {ws.score} of {MARKS}
          </h2>
          <ul className="mt-2 grid gap-1">
            {['A', 'B'].map((label, i) => (
              <li key={label}>
                Box {label}: the catalogue has {truth[i]} craters at least {MIN_DIAMETER} km across, {densities[i]!.toFixed(1)} per million km².{marks[i] ? ' Your count is within tolerance.' : ''}
              </li>
            ))}
            <li>{marks[2] ? 'Right about which is older.' : olderTruth === 'same' ? 'The densities are within 10 % of each other: about the same age.' : `Box ${olderTruth} is denser, so older.`}</li>
          </ul>
        </section>
      )}
      {moon && <DataFooter snapshot={{ fetched_at: moon.catalogue.fetched, source_url: moon.catalogue.url, data: null }} attribution={moon.catalogue.source} />}
    </div>
  )
}
