import { useId } from 'react'
import { z } from 'zod'
import { Plot } from '@/app/sim/Plot'
import { GaugePicker } from '@/app/water/GaugePicker'
import { DataFooter } from '@/app/week/DataFooter'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { hourly, HYDRO_TOLERANCE, hydrograph } from '@/engine/hydro'

const worksheetSchema = z.object({
  record: z.object({ site: z.string(), name: z.string(), unit: z.string(), fetched_at: z.string(), source_url: z.string(), values: z.array(z.tuple([z.string(), z.number()])) }).nullable(),
  peak: z.number().nullable(),
  peakTime: z.string().nullable(),
  riseStart: z.string().nullable(),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const EMPTY: Worksheet = { record: null, peak: null, peakTime: null, riseStart: null, checked: false, score: null }
const MARKS = 3

const toLocalInput = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const hoursApart = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b)) / 3.6e6

/**
 * Week 13 lab: read a hydrograph. The learner picks a gauge and keeps its record (hourly means, so the sheet stays
 * small), then reads off the peak discharge, when it came, and when the rise began. The checker reads the kept copy.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : EMPTY
  const save = (patch: Partial<Worksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })
  const stats = ws.record ? hydrograph(ws.record.values) : null
  const t0 = ws.record?.values[0] ? Date.parse(ws.record.values[0][0]) : 0
  const complete = ws.peak !== null && ws.peakTime !== null && ws.riseStart !== null
  const marks = stats && complete ? { peak: Math.abs(ws.peak! - stats.peak.value) <= HYDRO_TOLERANCE.peakRelative * stats.peak.value, peakTime: hoursApart(ws.peakTime!, stats.peak.time) <= HYDRO_TOLERANCE.timeHours, rise: hoursApart(ws.riseStart!, stats.riseStart.time) <= HYDRO_TOLERANCE.riseHours } : null
  const check = () => marks && update({ data: { ...ws, checked: true, score: Number(marks.peak) + Number(marks.peakTime) + Number(marks.rise) }, labDone: true })

  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        Find a gauge and keep its record. Then read the hydrograph: the largest discharge in the 30 days, when it
        occurred, and when the rise toward it began (the low point before the peak). Hover the plot for values.
      </p>
      {!ws.record && (
        <GaugePicker
          view={{ lat: 39, lon: -98, zoom: 2 }}
          onRecord={(s) => s && update({ data: { ...EMPTY, record: { site: s.data.site, name: s.data.name, unit: s.data.unit, fetched_at: s.fetched_at, source_url: s.source_url, values: hourly(s.data.values) } } })}
        />
      )}
      {ws.record && stats && (
        <>
          <p className="text-sm">
            Record kept: {ws.record.name}, hourly means of the 30 days before {new Date(ws.record.fetched_at).toLocaleString()}.{' '}
            <Button size="sm" variant="ghost" onClick={() => update({ data: EMPTY })}>
              Choose another gauge
            </Button>
          </p>
          <Plot title={`Hydrograph of ${ws.record.name}`} series={[{ id: 'q', label: `Discharge, ${ws.record.unit}`, points: ws.record.values.map(([t, q]) => [(Date.parse(t) - t0) / 86400000, q]) }]} x={{ label: 'Days since the start of the record', min: 0 }} y={{ label: 'Discharge', unit: ws.record.unit, min: 0 }} />
          <p className="text-xs text-muted-foreground">Day 0 is {new Date(t0).toLocaleString()}.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1 text-sm">
              <label htmlFor={`${id}-peak`}>Peak discharge ({ws.record.unit})</label>
              <input id={`${id}-peak`} type="number" step="any" className="rounded-md border bg-background p-2" value={ws.peak ?? ''} onChange={(e) => save({ peak: e.target.value === '' ? null : Number(e.target.value) })} />
            </div>
            <div className="grid gap-1 text-sm">
              <label htmlFor={`${id}-pt`}>Time of the peak</label>
              <input id={`${id}-pt`} type="datetime-local" className="rounded-md border bg-background p-2" value={toLocalInput(ws.peakTime)} onChange={(e) => save({ peakTime: e.target.value ? new Date(e.target.value).toISOString() : null })} />
            </div>
            <div className="grid gap-1 text-sm">
              <label htmlFor={`${id}-rs`}>Start of the rise</label>
              <input id={`${id}-rs`} type="datetime-local" className="rounded-md border bg-background p-2" value={toLocalInput(ws.riseStart)} onChange={(e) => save({ riseStart: e.target.value ? new Date(e.target.value).toISOString() : null })} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={check} disabled={!complete}>
              Check
            </Button>
            {!complete && <p className="text-sm text-muted-foreground">Fill in all three to check.</p>}
          </div>
          {ws.checked && marks && (
            <section aria-labelledby="result-heading" className="rounded-lg border bg-card p-4 text-sm">
              <h2 id="result-heading" className="font-medium">
                {ws.score} of {MARKS}
              </h2>
              <ul className="mt-2 grid gap-1">
                <li>{marks.peak ? 'Peak within 2 %.' : `The record's peak is ${stats.peak.value.toLocaleString()} ${ws.record.unit}.`}</li>
                <li>{marks.peakTime ? 'Peak time within an hour.' : `The peak came at ${new Date(stats.peak.time).toLocaleString()}.`}</li>
                <li>{marks.rise ? 'Start of the rise within three hours.' : `The rise began at ${new Date(stats.riseStart.time).toLocaleString()}, ${stats.riseHours.toFixed(0)} hours before the peak.`}</li>
              </ul>
            </section>
          )}
          <DataFooter snapshot={{ fetched_at: ws.record.fetched_at, source_url: ws.record.source_url, data: null }} attribution="USGS Water Services, instantaneous values" />
        </>
      )}
    </div>
  )
}
