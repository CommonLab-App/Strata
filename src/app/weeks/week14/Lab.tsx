import { useId } from 'react'
import { z } from 'zod'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { azimuthDifference, flowAzimuth, GROUNDWATER_TOLERANCE, task, thiemDrawdown, waterTable } from '@/engine/groundwater'
import { sample } from '@/engine/topo'
import { WaterTableView } from './WaterTableView'

const INTERVAL = 2
const worksheetSchema = z.object({
  seed: z.number().int(),
  head: z.number().nullable(),
  azimuth: z.number().nullable(),
  drawdown: z.number().nullable(),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const fresh = (seed: number): Worksheet => ({ seed, head: null, azimuth: null, drawdown: null, checked: false, score: null })
const MARKS = 3

/**
 * Week 14 lab: from eight well heads (a generated set, so the sheet reproduces), read the water table: the head at
 * a marked point, the direction of flow there, and the drawdown a pumping well would cause by the Thiem equation.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : null
  if (!ws) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">Eight wells with measured heads will be set out for you, with a point to read and a pumping problem.</p>
        <div>
          <Button onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>Set the task</Button>
        </div>
      </div>
    )
  }
  const t = task(ws.seed)
  const grid = waterTable(t.wells, t.extent)
  const trueHead = sample(grid, t.point.x / grid.dx - 0.5, grid.size - t.point.y / grid.dy - 0.5)
  const trueAz = flowAzimuth(grid, t.point.x, t.point.y)
  const trueDrawdown = thiemDrawdown(t.pumping.q, t.pumping.t, t.pumping.radiusOfInfluence, t.pumping.r)
  const save = (patch: Partial<Worksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })
  const complete = ws.head !== null && ws.azimuth !== null && ws.drawdown !== null
  const marks = complete ? { head: Math.abs(ws.head! - trueHead) <= GROUNDWATER_TOLERANCE.headM, az: azimuthDifference(ws.azimuth!, trueAz) <= GROUNDWATER_TOLERANCE.azimuthDeg, dd: Math.abs(ws.drawdown! - trueDrawdown) <= GROUNDWATER_TOLERANCE.drawdownRelative * trueDrawdown } : null
  const check = () => marks && update({ data: { ...ws, checked: true, score: Number(marks.head) + Number(marks.az) + Number(marks.dd) }, labDone: true })

  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        The map shows eight wells with the water-table elevation measured in each, and contours drawn every {INTERVAL} m through them.
        Groundwater flows downhill on this surface, at right angles to the contours. Read the head at point P and give the
        direction of flow there as an azimuth from north. Then solve the pumping problem.
      </p>
      <WaterTableView grid={grid} extent={t.extent} wells={t.wells} interval={INTERVAL} point={t.point} flowAzimuth={ws.checked ? trueAz : undefined} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1 text-sm">
          <label htmlFor={`${id}-head`}>Head at P (m)</label>
          <input id={`${id}-head`} type="number" step="any" className="rounded-md border bg-background p-2" value={ws.head ?? ''} onChange={(e) => save({ head: e.target.value === '' ? null : Number(e.target.value) })} />
        </div>
        <div className="grid gap-1 text-sm">
          <label htmlFor={`${id}-az`}>Flow direction at P (° from north)</label>
          <input id={`${id}-az`} type="number" min={0} max={360} className="rounded-md border bg-background p-2" value={ws.azimuth ?? ''} onChange={(e) => save({ azimuth: e.target.value === '' ? null : Number(e.target.value) })} />
        </div>
      </div>
      <section aria-labelledby="pump" className="grid gap-2 rounded-lg border bg-card p-4 text-sm">
        <h2 id="pump" className="font-medium">
          Cone of depression
        </h2>
        <p>
          A well in a confined aquifer of transmissivity {t.pumping.t} m²/day pumps steadily at {t.pumping.q} m³/day. Taking the radius of
          influence as {t.pumping.radiusOfInfluence} m, how much is the head drawn down {t.pumping.r} m from the well? Thiem: s = Q ln(R/r) / (2πT).
        </p>
        <div className="grid gap-1 sm:max-w-xs">
          <label htmlFor={`${id}-dd`}>Drawdown (m)</label>
          <input id={`${id}-dd`} type="number" step="any" className="rounded-md border bg-background p-2" value={ws.drawdown ?? ''} onChange={(e) => save({ drawdown: e.target.value === '' ? null : Number(e.target.value) })} />
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!complete}>
          Check
        </Button>
        <Button variant="outline" onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>
          New task
        </Button>
        {!complete && <p className="text-sm text-muted-foreground">Fill in all three to check.</p>}
      </div>
      {ws.checked && marks && (
        <section aria-labelledby="result-heading" className="rounded-lg border bg-card p-4 text-sm">
          <h2 id="result-heading" className="font-medium">
            {ws.score} of {MARKS}
          </h2>
          <ul className="mt-2 grid gap-1">
            <li>{marks.head ? 'Head within 1 m.' : `The interpolated head at P is ${trueHead.toFixed(1)} m.`}</li>
            <li>{marks.az ? 'Flow direction within 20°.' : `Flow at P is toward ${trueAz.toFixed(0)}°, down the steepest slope of the table (drawn on the map).`}</li>
            <li>{marks.dd ? 'Drawdown within 10 %.' : `Thiem gives ${trueDrawdown.toFixed(2)} m.`}</li>
          </ul>
        </section>
      )}
    </div>
  )
}
