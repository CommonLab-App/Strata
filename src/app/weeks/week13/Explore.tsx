import { useState } from 'react'
import { Plot } from '@/app/sim/Plot'
import { Sliders } from '@/app/sim/Sliders'
import { GaugePicker } from '@/app/water/GaugePicker'
import type { Snapshot } from '@/data/adapters/types'
import type { Discharge } from '@/data/adapters/usgs-water'
import { braidedSlope, hydrograph, pattern } from '@/engine/hydro'

/** Week 13: a live gauge's hydrograph from the globe, and the stream-table rule as a slider sandbox. */
export function Explore() {
  const [record, setRecord] = useState<Snapshot<Discharge> | null>(null)
  const [v, setV] = useState({ slope: -3, discharge: 3 })
  const slope = 10 ** v.slope
  const q = 10 ** v.discharge
  const stats = record ? hydrograph(record.data.values) : null
  const t0 = record?.data.values[0] ? Date.parse(record.data.values[0][0]) : 0
  const line: [number, number][] = []
  for (let e = 1; e <= 6; e += 0.25) line.push([10 ** e, braidedSlope(10 ** e)])

  return (
    <div className="grid max-w-prose gap-5">
      <h2 className="text-sm font-medium">A river describing itself</h2>
      <GaugePicker onRecord={setRecord} view={{ lat: 39, lon: -98, zoom: 2 }} />
      {record && stats && (
        <>
          <Plot
            title={`Discharge at ${record.data.name} over the past 30 days`}
            series={[{ id: 'q', label: `Discharge, ${record.data.unit}`, points: record.data.values.map(([t, q]) => [(Date.parse(t) - t0) / 86400000, q]) }]}
            x={{ label: 'Days since the start of the record', min: 0 }}
            y={{ label: 'Discharge', unit: record.data.unit, min: 0 }}
            marker={[(Date.parse(stats.peak.time) - t0) / 86400000, stats.peak.value]}
          />
          <p className="text-sm">
            Peak {stats.peak.value.toLocaleString()} {record.data.unit} on {new Date(stats.peak.time).toLocaleString()}; the rise before it began {stats.riseHours.toFixed(0)} hours earlier at {stats.riseStart.value.toLocaleString()}. Mean {Math.round(stats.mean).toLocaleString()}, low {stats.min.toLocaleString()}.
          </p>
        </>
      )}
      <h2 className="text-sm font-medium">Stream table: slope, discharge and channel pattern</h2>
      <p className="text-muted-foreground">
        Steep and powerful rivers split into many shifting channels; gentle ones wind in a single meandering channel.
        The dividing line drawn by Leopold and Wolman in 1957 from real rivers is plotted here; move the sliders to
        see which side a channel falls on.
      </p>
      <Sliders
        specs={[
          { key: 'slope', label: 'Channel slope, log₁₀', min: -5, max: -1, step: 0.1 },
          { key: 'discharge', label: 'Bankfull discharge, log₁₀ ft³/s', min: 1, max: 6, step: 0.1 },
        ]}
        values={v}
        onChange={(key, value) => setV({ ...v, [key]: value })}
      />
      <Plot title="Slope against discharge with the braided-meandering line" series={[{ id: 'lw', label: 'Braided above, meandering below (Leopold and Wolman 1957)', points: line }]} x={{ label: 'Discharge', unit: 'ft³/s', log: true, min: 10, max: 1e6 }} y={{ label: 'Slope', log: true, min: 1e-5, max: 0.1 }} marker={[q, slope]} />
      <p className="text-sm">
        Slope {slope.toExponential(1)} at {Math.round(q).toLocaleString()} ft³/s: <strong>{pattern(slope, q)}</strong>.
      </p>
    </div>
  )
}
