import { useId, useState } from 'react'
import { z } from 'zod'
import { Plot } from '@/app/sim/Plot'
import { Sliders } from '@/app/sim/Sliders'
import { TopoView } from '@/app/topo/TopoView'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { useArea } from '@/app/weeks/week12/useArea'
import { COAST_ID } from '@/data/terrain/schema'
import { seeded } from '@/engine/random'
import { floodedFraction, glaciate, PROFILE_HALF_WIDTH, PROFILE_POINTS, shapeExponent, SURFACE_TOLERANCE, vValley } from '@/engine/surface'

const worksheetSchema = z.object({
  seed: z.number().int(),
  glacier: z.object({ ice: z.number(), years: z.number() }).nullable(),
  flooded: z.array(z.number().nullable()).length(2),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const fresh = (seed: number): Worksheet => ({ seed, glacier: null, flooded: [null, null], checked: false, score: null })
const MARKS = 3
const TARGET_SHAPE = 1.8
/** Two sea levels to read, from the seed: a small and a large rise. */
const levelsFor = (seed: number): [number, number] => {
  const random = seeded(seed)
  return [Math.round(random() * 4) / 2 + 1, Math.round(random() * 10) / 2 + 5]
}

/**
 * Week 15 lab: shape a U-valley with the glacier sliders and save it, then read the flooded fraction of the coast at
 * two sea levels. The checker recomputes both from the same model and grid.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : null
  const [g, setG] = useState({ ice: 300, years: 2000 })
  const [shown, setShown] = useState(0)
  const { grid, error } = useArea(COAST_ID)
  if (!ws) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">Two tasks: carve a U-shaped valley, and read how much of a coast a rising sea covers.</p>
        <div>
          <Button onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>Set the tasks</Button>
        </div>
      </div>
    )
  }
  const levels = levelsFor(ws.seed)
  const v = vValley(500)
  const u = glaciate(v, g.ice, g.years)
  const x = (i: number) => (i / (PROFILE_POINTS - 1)) * 2 * PROFILE_HALF_WIDTH - PROFILE_HALF_WIDTH
  const save = (patch: Partial<Worksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })
  const complete = ws.glacier !== null && ws.flooded.every((f) => f !== null)
  const marks =
    grid && complete
      ? {
          glacier: shapeExponent(glaciate(v, ws.glacier!.ice, ws.glacier!.years)) >= TARGET_SHAPE,
          flooded: levels.map((level, i) => Math.abs(ws.flooded[i]! / 100 - floodedFraction(grid, level)) <= SURFACE_TOLERANCE.floodedFraction),
        }
      : null
  const check = () => marks && update({ data: { ...ws, checked: true, score: Number(marks.glacier) + marks.flooded.filter(Boolean).length }, labDone: true })

  return (
    <div className="grid max-w-prose gap-5">
      <section className="grid gap-3">
        <h2 className="font-medium">1. Carve a U-shaped valley</h2>
        <p className="text-sm text-muted-foreground">Set the ice and the time so that the valley&rsquo;s shape number reaches at least {TARGET_SHAPE}, then save the settings.</p>
        <Sliders
          specs={[
            { key: 'ice', label: 'Ice surface above the original floor', min: 0, max: 500, step: 10, unit: 'm' },
            { key: 'years', label: 'Time under ice', min: 0, max: 10000, step: 100, unit: 'years' },
          ]}
          values={g}
          onChange={(key, value) => setG({ ...g, [key]: value })}
        />
        <Plot title="Valley cross-profile" series={[{ id: 'v', label: 'River valley', points: v.map((z, i) => [x(i) / 1000, z]), colour: '#9a3412' }, { id: 'u', label: 'Under your glacier', points: u.map((z, i) => [x(i) / 1000, z]), colour: '#2563eb' }]} x={{ label: 'Distance', unit: 'km' }} y={{ label: 'Elevation', unit: 'm' }} />
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Shape number now {shapeExponent(u).toFixed(2)}.</span>
          <Button size="sm" variant="outline" onClick={() => save({ glacier: g })}>
            Save these settings
          </Button>
          {ws.glacier && <span className="text-muted-foreground">Saved: {ws.glacier.ice} m of ice for {ws.glacier.years} years.</span>}
        </div>
      </section>
      <section className="grid gap-3">
        <h2 className="font-medium">2. Read the flooded coast</h2>
        <p className="text-sm text-muted-foreground">
          The map shows the coast with the sea raised to one of two levels; land at or below the level is blue. Estimate the percentage of the whole square that is under water at each level.
        </p>
        <div className="flex flex-wrap gap-2">
          {levels.map((level, i) => (
            <Button key={i} size="sm" variant={shown === i ? 'default' : 'outline'} aria-pressed={shown === i} onClick={() => setShown(i)}>
              Sea at +{level} m
            </Button>
          ))}
        </div>
        {grid ? <TopoView grid={grid} interval={5} floodLevel={levels[shown]} title={`Coast with the sea at ${levels[shown]} m`} /> : error ? <p role="alert">{error}</p> : <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {levels.map((level, i) => (
            <div key={i} className="grid gap-1 text-sm">
              <label htmlFor={`${id}-f${i}`}>Flooded at +{level} m (% of the area)</label>
              <input id={`${id}-f${i}`} type="number" min={0} max={100} className="rounded-md border bg-background p-2" value={ws.flooded[i] ?? ''} onChange={(e) => save({ flooded: ws.flooded.map((f, k) => (k === i ? (e.target.value === '' ? null : Number(e.target.value)) : f)) })} />
            </div>
          ))}
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!complete || !grid}>
          Check
        </Button>
        <Button variant="outline" onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>
          New tasks
        </Button>
        {!complete && <p className="text-sm text-muted-foreground">Save glacier settings and give both percentages to check.</p>}
      </div>
      {ws.checked && marks && grid && (
        <section aria-labelledby="result-heading" className="rounded-lg border bg-card p-4 text-sm">
          <h2 id="result-heading" className="font-medium">
            {ws.score} of {MARKS}
          </h2>
          <ul className="mt-2 grid gap-1">
            <li>{marks.glacier ? `Your valley reaches a shape number of ${shapeExponent(glaciate(v, ws.glacier!.ice, ws.glacier!.years)).toFixed(2)}.` : `Your settings give a shape number of ${shapeExponent(glaciate(v, ws.glacier!.ice, ws.glacier!.years)).toFixed(2)}; thicker ice or more time rounds the floor further.`}</li>
            {levels.map((level, i) => (
              <li key={i}>{marks.flooded[i] ? `At +${level} m: within 5 percentage points.` : `At +${level} m the grid gives ${Math.round(floodedFraction(grid, level) * 100)} %.`}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
