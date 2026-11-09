import { useState } from 'react'
import { Plot } from '@/app/sim/Plot'
import { Sliders } from '@/app/sim/Sliders'
import { GaugePicker } from '@/app/water/GaugePicker'
import type { Snapshot } from '@/data/adapters/types'
import type { Discharge } from '@/data/adapters/usgs-water'
import { darcy } from '@/engine/groundwater'

/** Week 14: a live well's water level from the globe, and Darcy's law as a slider sandbox. */
export function Explore() {
  const [record, setRecord] = useState<Snapshot<Discharge> | null>(null)
  const [v, setV] = useState({ k: 1, area: 1000, gradient: 0.005 })
  const q = darcy(v.k, v.area, v.gradient)
  const t0 = record?.data.values[0] ? Date.parse(record.data.values[0][0]) : 0
  const curve: [number, number][] = []
  for (let g = 0; g <= 0.02; g += 0.0005) curve.push([g, darcy(v.k, v.area, g)])

  return (
    <div className="grid max-w-prose gap-5">
      <h2 className="text-sm font-medium">Wells with live water levels</h2>
      <GaugePicker kind="well" onRecord={setRecord} view={{ lat: 39, lon: -98, zoom: 2 }} />
      {record && (
        <>
          <Plot title={`Depth to water at ${record.data.name} over the past 30 days`} series={[{ id: 'd', label: `Depth to water below land surface, ${record.data.unit}`, points: record.data.values.map(([t, d]) => [(Date.parse(t) - t0) / 86400000, -d]) }]} x={{ label: 'Days since the start of the record', min: 0 }} y={{ label: 'Depth, negative down', unit: record.data.unit }} />
          <p className="text-sm text-muted-foreground">Depth is plotted downward, so a rising line is a rising water table.</p>
        </>
      )}
      <h2 className="text-sm font-medium">Darcy&rsquo;s law</h2>
      <p className="text-muted-foreground">
        Groundwater flows from high head to low, faster through permeable material and down steeper gradients.
        Darcy found the discharge through a sand column is the hydraulic conductivity times the cross-section times
        the head gradient: Q = K · A · i.
      </p>
      <Sliders
        specs={[
          { key: 'k', label: 'Hydraulic conductivity K', min: 0.01, max: 100, step: 0.01, unit: 'm/day' },
          { key: 'area', label: 'Cross-section area A', min: 100, max: 10000, step: 100, unit: 'm²' },
          { key: 'gradient', label: 'Head gradient i', min: 0.0005, max: 0.02, step: 0.0005 },
        ]}
        values={v}
        onChange={(key, value) => setV({ ...v, [key]: value })}
      />
      <Plot title="Discharge against gradient at the chosen K and A" series={[{ id: 'q', label: 'Q = K · A · i', points: curve }]} x={{ label: 'Head gradient', min: 0, max: 0.02 }} y={{ label: 'Discharge', unit: 'm³/day', min: 0 }} marker={[v.gradient, q]} />
      <p className="text-sm">
        Q = {v.k} × {v.area} × {v.gradient} = <strong>{q.toFixed(1)} m³/day</strong>. Clean gravel has K near 100 m/day, silt near 0.01: a gap of ten thousand that the slider spans.
      </p>
    </div>
  )
}
