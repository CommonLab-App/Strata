import { useId } from 'react'
import { z } from 'zod'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { angleDifference, axisDifference, intersection, STRUCTURE_TOLERANCE_DEG, task } from '@/engine/structure'
import { Stereonet } from './Stereonet'

const worksheetSchema = z.object({
  seed: z.number().int(),
  planes: z.array(z.object({ strike: z.number().nullable(), dip: z.number().nullable() })).length(2),
  axis: z.object({ trend: z.number().nullable(), plunge: z.number().nullable() }),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const fresh = (seed: number): Worksheet => ({ seed, planes: [{ strike: null, dip: null }, { strike: null, dip: null }], axis: { trend: null, plunge: null }, checked: false, score: null })
const MARKS = 3
const COLOURS = ['#2563eb', '#dc2626']

/**
 * Week 17 lab: two fold limbs are drawn on the stereonet as great circles with their poles. Read each plane's
 * strike and dip from the net, and the trend and plunge of the fold axis where they meet.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : null
  if (!ws) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">Two planes will be plotted for you to read.</p>
        <div>
          <Button onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>Plot the planes</Button>
        </div>
      </div>
    )
  }
  const t = task(ws.seed)
  const axis = intersection(t.planes[0], t.planes[1])
  const save = (patch: Partial<Worksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })
  const complete = ws.planes.every((p) => p.strike !== null && p.dip !== null) && ws.axis.trend !== null && ws.axis.plunge !== null
  const planeOk = (i: number) => ws.planes[i]!.strike !== null && ws.planes[i]!.dip !== null && axisDifference(ws.planes[i]!.strike!, t.planes[i]!.strike) <= STRUCTURE_TOLERANCE_DEG && Math.abs(ws.planes[i]!.dip! - t.planes[i]!.dip) <= STRUCTURE_TOLERANCE_DEG
  const axisOk = ws.axis.trend !== null && ws.axis.plunge !== null && axisDifference(ws.axis.trend, axis.trend) <= STRUCTURE_TOLERANCE_DEG && Math.abs(ws.axis.plunge - axis.plunge) <= STRUCTURE_TOLERANCE_DEG
  const check = () => update({ data: { ...ws, checked: true, score: Number(planeOk(0)) + Number(planeOk(1)) + Number(axisOk) }, labDone: true })

  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        The two limbs of a fold are plotted as great circles with their poles. The strike of a plane is where its great
        circle meets the rim; its dip is read inward from the rim to the circle along the diameter at right angles to
        strike (the rim is 0°, the centre 90°). The fold axis is the point where the two circles cross. Quote strikes by the
        right-hand rule (either end of the strike line is accepted). Tolerance {STRUCTURE_TOLERANCE_DEG}°.
      </p>
      <Stereonet planes={t.planes.map((plane, i) => ({ plane, colour: COLOURS[i]!, label: ['A', 'B'][i] }))} lines={ws.checked ? [{ line: axis, colour: '#111', label: 'axis' }] : []} />
      <div className="grid gap-3 sm:grid-cols-2">
        {ws.planes.map((p, i) => (
          <fieldset key={i} className="grid gap-2 rounded-lg border bg-card p-3 text-sm">
            <legend className="px-1 font-medium" style={{ color: COLOURS[i] }}>
              Plane {['A', 'B'][i]}
            </legend>
            <label htmlFor={`${id}-s${i}`}>Strike (°)</label>
            <input id={`${id}-s${i}`} type="number" min={0} max={360} className="rounded-md border bg-background p-2" value={p.strike ?? ''} onChange={(e) => save({ planes: ws.planes.map((q, k) => (k === i ? { ...q, strike: e.target.value === '' ? null : Number(e.target.value) } : q)) })} />
            <label htmlFor={`${id}-d${i}`}>Dip (°)</label>
            <input id={`${id}-d${i}`} type="number" min={0} max={90} className="rounded-md border bg-background p-2" value={p.dip ?? ''} onChange={(e) => save({ planes: ws.planes.map((q, k) => (k === i ? { ...q, dip: e.target.value === '' ? null : Number(e.target.value) } : q)) })} />
          </fieldset>
        ))}
      </div>
      <fieldset className="grid gap-2 rounded-lg border bg-card p-3 text-sm sm:grid-cols-2">
        <legend className="px-1 font-medium">Fold axis (the line where the planes meet)</legend>
        <div className="grid gap-1">
          <label htmlFor={`${id}-tr`}>Trend (°)</label>
          <input id={`${id}-tr`} type="number" min={0} max={360} className="rounded-md border bg-background p-2" value={ws.axis.trend ?? ''} onChange={(e) => save({ axis: { ...ws.axis, trend: e.target.value === '' ? null : Number(e.target.value) } })} />
        </div>
        <div className="grid gap-1">
          <label htmlFor={`${id}-pl`}>Plunge (°)</label>
          <input id={`${id}-pl`} type="number" min={0} max={90} className="rounded-md border bg-background p-2" value={ws.axis.plunge ?? ''} onChange={(e) => save({ axis: { ...ws.axis, plunge: e.target.value === '' ? null : Number(e.target.value) } })} />
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!complete}>
          Check
        </Button>
        <Button variant="outline" onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>
          New planes
        </Button>
        {!complete && <p className="text-sm text-muted-foreground">Fill in every value to check.</p>}
      </div>
      {ws.checked && (
        <section aria-labelledby="result-heading" className="rounded-lg border bg-card p-4 text-sm">
          <h2 id="result-heading" className="font-medium">
            {ws.score} of {MARKS}
          </h2>
          <ul className="mt-2 grid gap-1">
            {t.planes.map((p, i) => (
              <li key={i}>{planeOk(i) ? `Plane ${['A', 'B'][i]} read correctly.` : `Plane ${['A', 'B'][i]} is strike ${p.strike}°, dip ${p.dip}°.`}</li>
            ))}
            <li>{axisOk ? 'Fold axis read correctly.' : `The axis trends ${axis.trend.toFixed(0)}° and plunges ${axis.plunge.toFixed(0)}° (now drawn on the net).`}</li>
          </ul>
          {!axisOk && ws.axis.trend !== null && angleDifference(ws.axis.trend, axis.trend) > 90 && <p className="mt-2 text-muted-foreground">Your trend points the other way along the line; on a lower-hemisphere net the plunge direction is the one that dips below the horizon.</p>}
        </section>
      )}
    </div>
  )
}
