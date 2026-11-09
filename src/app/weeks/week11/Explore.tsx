import { useState } from 'react'
import { Plot } from '@/app/sim/Plot'
import { Sliders } from '@/app/sim/Sliders'
import { ageFromRatio, remaining } from '@/engine/dating'
import { TimeScale } from './TimeScale'

/** Week 11: a half-life slider with the decay curve, and the time scale it calibrates. */
export function Explore() {
  const [v, setV] = useState({ halfLives: 1.0 })
  const points: [number, number][] = []
  const daughter: [number, number][] = []
  for (let t = 0; t <= 6; t += 0.1) {
    points.push([t, remaining(t, 1)])
    daughter.push([t, 1 - remaining(t, 1)])
  }
  const parent = remaining(v.halfLives, 1)
  const ratio = parent > 0 ? (1 - parent) / parent : Infinity
  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        A radioactive parent decays into its daughter at a fixed rate: whatever the amount, half of it is gone after
        one half-life. Slide the time and watch the parent fall and the daughter rise; the ratio between them is the
        clock. The same curve serves every system, with the time axis in half-lives.
      </p>
      <Sliders specs={[{ key: 'halfLives', label: 'Time elapsed', min: 0, max: 6, step: 0.1, unit: 'half-lives' }]} values={v} onChange={(key, value) => setV({ ...v, [key]: value })} />
      <Plot
        title="Parent and daughter fractions against time in half-lives"
        series={[
          { id: 'parent', label: 'Parent remaining', points },
          { id: 'daughter', label: 'Daughter formed', points: daughter, colour: '#2563eb' },
        ]}
        x={{ label: 'Time', unit: 'half-lives', min: 0, max: 6 }}
        y={{ label: 'Fraction', min: 0, max: 1 }}
        marker={[v.halfLives, parent]}
      />
      <p className="text-sm">
        After {v.halfLives.toFixed(1)} half-lives, {Math.round(parent * 1000) / 10} % of the parent remains; daughter to parent is {ratio === Infinity ? 'unbounded' : ratio.toFixed(2)}
        {ratio !== Infinity && `, which inverts to ${ageFromRatio(ratio, 1).toFixed(2)} half-lives`}.
      </p>
      <h2 className="text-sm font-medium">The time scale those clocks calibrate</h2>
      <TimeScale />
    </div>
  )
}
