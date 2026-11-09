import { useId } from 'react'
import { z } from 'zod'
import { TopoView } from '@/app/topo/TopoView'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { AREA_IDS } from '@/data/terrain/schema'
import { gradient, profile, strikeDifference, task, threePoint, TOPO_TOLERANCE } from '@/engine/topo'
import { useArea } from './useArea'

const INTERVAL = 50
const worksheetSchema = z.object({
  seed: z.number().int(),
  elevations: z.array(z.number().nullable()).length(5),
  gradient: z.number().nullable(),
  strike: z.number().nullable(),
  dip: z.number().nullable(),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const fresh = (seed: number): Worksheet => ({ seed, elevations: [null, null, null, null, null], gradient: null, strike: null, dip: null, checked: false, score: null })
const MARKS = 3

/**
 * Week 12 lab: read five station elevations off the contours along a line, give the average gradient from A to B,
 * and solve a three-point problem for a bed's strike and dip. The checker samples the same grid at the same stations.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : null
  const t = ws ? task(ws.seed, AREA_IDS.length) : null
  const { grid, error } = useArea(AREA_IDS[t?.area ?? 0]!)
  if (!ws || !t) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">A contour map with a profile line and a three-point problem will be set for you.</p>
        <div>
          <Button onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>Set the task</Button>
        </div>
      </div>
    )
  }
  const save = (patch: Partial<Worksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })
  const stations = grid ? profile(grid, t.line[0], t.line[1], t.stations) : []
  const stationPoints = Array.from({ length: t.stations }, (_, i) => {
    const f = i / (t.stations - 1)
    return [t.line[0][0] + (t.line[1][0] - t.line[0][0]) * f, t.line[0][1] + (t.line[1][1] - t.line[0][1]) * f] as [number, number]
  })
  const complete = ws.elevations.every((e) => e !== null) && ws.gradient !== null && ws.strike !== null && ws.dip !== null
  const marks = grid
    ? {
        elevations: ws.elevations.every((e, i) => e !== null && Math.abs(e - stations[i]!.elevation) <= INTERVAL),
        gradient: ws.gradient !== null && Math.abs(ws.gradient - gradient(grid, t.line[0], t.line[1])) <= Math.max(5, TOPO_TOLERANCE.gradientRelative * Math.abs(gradient(grid, t.line[0], t.line[1]))),
        plane: ws.strike !== null && ws.dip !== null && strikeDifference(ws.strike, t.truth.strike) <= TOPO_TOLERANCE.strikeDeg && Math.abs(ws.dip - t.truth.dip) <= TOPO_TOLERANCE.dipDeg,
      }
    : null
  const check = () => marks && update({ data: { ...ws, checked: true, score: Number(marks.elevations) + Number(marks.gradient) + Number(marks.plane) }, labDone: true })
  const solved = threePoint(t.outcrops)

  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        Contours are every {INTERVAL} m, thick lines every {INTERVAL * 5} m. Read the elevation at each numbered station on the line from A to B
        to the nearest contour, work out the average gradient from A to B in metres of rise per kilometre (negative if B is lower), then
        solve the three-point problem below.
      </p>
      {grid ? <TopoView grid={grid} interval={INTERVAL} line={t.line} stations={stationPoints} title="Contour map with the profile line and five stations" /> : error ? <p role="alert">{error}</p> : <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="grid gap-2 sm:grid-cols-5">
        {ws.elevations.map((e, i) => (
          <div key={i} className="grid gap-1 text-sm">
            <label htmlFor={`${id}-e${i}`}>Station {i + 1} (m)</label>
            <input id={`${id}-e${i}`} type="number" step="any" className="rounded-md border bg-background p-2" value={e ?? ''} onChange={(ev) => save({ elevations: ws.elevations.map((v, k) => (k === i ? (ev.target.value === '' ? null : Number(ev.target.value)) : v)) })} />
          </div>
        ))}
      </div>
      <div className="grid gap-1 text-sm sm:max-w-xs">
        <label htmlFor={`${id}-g`}>Average gradient A to B (m per km)</label>
        <input id={`${id}-g`} type="number" step="any" className="rounded-md border bg-background p-2" value={ws.gradient ?? ''} onChange={(e) => save({ gradient: e.target.value === '' ? null : Number(e.target.value) })} />
      </div>
      <section aria-labelledby="three-point" className="grid gap-2 rounded-lg border bg-card p-4 text-sm">
        <h2 id="three-point" className="font-medium">
          Three-point problem
        </h2>
        <p>
          The top of one bed is exposed at three outcrops. Positions are metres east and north of the first outcrop; elevations are of
          the bed top. Find the bed&rsquo;s strike (right-hand rule, degrees from north) and dip (degrees).
        </p>
        <table>
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pr-4 font-normal">Outcrop</th>
              <th className="pr-4 font-normal">East (m)</th>
              <th className="pr-4 font-normal">North (m)</th>
              <th className="font-normal">Elevation (m)</th>
            </tr>
          </thead>
          <tbody>
            {t.outcrops.map((o, i) => (
              <tr key={i} className="tabular-nums">
                <td className="pr-4">{i + 1}</td>
                <td className="pr-4">{o[0]}</td>
                <td className="pr-4">{o[1]}</td>
                <td>{o[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-1">
            <label htmlFor={`${id}-strike`}>Strike (°)</label>
            <input id={`${id}-strike`} type="number" min={0} max={360} className="rounded-md border bg-background p-2" value={ws.strike ?? ''} onChange={(e) => save({ strike: e.target.value === '' ? null : Number(e.target.value) })} />
          </div>
          <div className="grid gap-1">
            <label htmlFor={`${id}-dip`}>Dip (°)</label>
            <input id={`${id}-dip`} type="number" min={0} max={90} className="rounded-md border bg-background p-2" value={ws.dip ?? ''} onChange={(e) => save({ dip: e.target.value === '' ? null : Number(e.target.value) })} />
          </div>
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!complete || !grid}>
          Check
        </Button>
        <Button variant="outline" onClick={() => update({ data: fresh(Math.floor(Math.random() * 1e6) + 1) })}>
          New task
        </Button>
        {!complete && <p className="text-sm text-muted-foreground">Fill in every field to check.</p>}
      </div>
      {ws.checked && marks && grid && (
        <section aria-labelledby="result-heading" className="rounded-lg border bg-card p-4 text-sm">
          <h2 id="result-heading" className="font-medium">
            {ws.score} of {MARKS}
          </h2>
          <ul className="mt-2 grid gap-1">
            <li>{marks.elevations ? 'Every station is within one contour interval.' : `Stations from the grid: ${stations.map((s) => Math.round(s.elevation)).join(', ')} m.`}</li>
            <li>{marks.gradient ? 'Gradient within 10 %.' : `Gradient from the grid: ${gradient(grid, t.line[0], t.line[1]).toFixed(0)} m per km.`}</li>
            <li>{marks.plane ? 'Strike within 10° and dip within 5°.' : `The three points give strike ${solved.strike.toFixed(0)}°, dip ${solved.dip.toFixed(0)}°.`}</li>
          </ul>
        </section>
      )}
    </div>
  )
}
