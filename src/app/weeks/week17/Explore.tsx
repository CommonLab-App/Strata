import { useState } from 'react'
import { Sliders } from '@/app/sim/Sliders'
import { intersection, pole } from '@/engine/structure'
import { Stereonet } from './Stereonet'

/** Week 17: planes on a stereonet: set strike and dip, see the great circle and pole, and the line where two planes meet. */
export function Explore() {
  const [a, setA] = useState({ strike: 30, dip: 40 })
  const [b, setB] = useState({ strike: 300, dip: 50 })
  const axis = intersection(a, b)
  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        A stereonet is a map of directions. Every plane through the centre of a sphere cuts its lower half in a
        semicircle, which projects onto the disc as a curved line, a great circle; the plane&rsquo;s pole, the
        direction at right angles to it, is a single point. Horizontal planes plot as the rim, vertical ones as a
        diameter, and a line plots as a point. Two planes meet in a line: where their great circles cross. For the
        two limbs of a fold, that line is the fold axis.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-4">
          <h2 className="text-sm font-medium" style={{ color: '#2563eb' }}>
            Plane A
          </h2>
          <Sliders specs={[{ key: 'strike', label: 'Strike', min: 0, max: 359, step: 1, unit: '°' }, { key: 'dip', label: 'Dip', min: 0, max: 90, step: 1, unit: '°' }]} values={a} onChange={(k, v) => setA({ ...a, [k]: v })} />
          <h2 className="text-sm font-medium" style={{ color: '#dc2626' }}>
            Plane B
          </h2>
          <Sliders specs={[{ key: 'strike', label: 'Strike', min: 0, max: 359, step: 1, unit: '°' }, { key: 'dip', label: 'Dip', min: 0, max: 90, step: 1, unit: '°' }]} values={b} onChange={(k, v) => setB({ ...b, [k]: v })} />
        </div>
        <Stereonet planes={[{ plane: a, colour: '#2563eb', label: 'A' }, { plane: b, colour: '#dc2626', label: 'B' }]} lines={[{ line: axis, colour: '#111', label: 'axis' }]} />
      </div>
      <p className="text-sm">
        Pole to A: trend {pole(a).trend.toFixed(0)}°, plunge {pole(a).plunge.toFixed(0)}°. Pole to B: trend {pole(b).trend.toFixed(0)}°, plunge {pole(b).plunge.toFixed(0)}°. The planes meet along a line trending {axis.trend.toFixed(0)}° and plunging {axis.plunge.toFixed(0)}°.
      </p>
    </div>
  )
}
