import { useState } from 'react'
import { Plot } from '@/app/sim/Plot'
import { Sliders } from '@/app/sim/Sliders'
import { Button } from '@/components/ui/button'
import { factorOfSafety, failureAngle, SOILS } from '@/engine/slope'

/** Week 16: the slope-stability sandbox: angle, water and roots against the factor of safety. */
export function Explore() {
  const [soilIndex, setSoilIndex] = useState(1)
  const [v, setV] = useState({ angle: 25, saturation: 0.3, rootCohesion: 2 })
  const soil = SOILS[soilIndex]!
  const fs = factorOfSafety(soil, v)
  const curve: [number, number][] = []
  for (let a = 5; a <= 60; a += 1) curve.push([a, Math.min(5, factorOfSafety(soil, { ...v, angle: a }))])
  const fail = failureAngle(soil, v.saturation, v.rootCohesion)
  return (
    <div className="grid max-w-prose gap-5">
      <p className="text-muted-foreground">
        A slope stands while the strength holding its soil together exceeds the pull of gravity along it; the ratio
        is the factor of safety, and failure is a factor of 1. Water adds weight and lifts grains apart, roots bind
        the soil, steepness sets the pull. The curve is the factor of safety against slope angle for the settings
        chosen; the marker is the slope you set.
      </p>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Soil">
        {SOILS.map((s, i) => (
          <Button key={s.name} size="sm" variant={i === soilIndex ? 'default' : 'outline'} aria-pressed={i === soilIndex} onClick={() => setSoilIndex(i)}>
            {s.name}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {soil.name}: cohesion {soil.cohesion} kPa, friction angle {soil.friction}°, unit weight {soil.unitWeight} kN/m³, {soil.thickness} m thick.
      </p>
      <Sliders
        specs={[
          { key: 'angle', label: 'Slope angle', min: 5, max: 60, step: 1, unit: '°' },
          { key: 'saturation', label: 'Saturation (water table height over soil thickness)', min: 0, max: 1, step: 0.1 },
          { key: 'rootCohesion', label: 'Root cohesion', min: 0, max: 10, step: 0.5, unit: 'kPa' },
        ]}
        values={v}
        onChange={(key, value) => setV({ ...v, [key]: value })}
      />
      <Plot title="Factor of safety against slope angle" series={[{ id: 'fs', label: 'Factor of safety (capped at 5)', points: curve }, { id: 'one', label: 'Failure at 1', points: [[5, 1], [60, 1]], colour: '#dc2626' }]} x={{ label: 'Slope angle', unit: '°', min: 5, max: 60 }} y={{ label: 'Factor of safety', min: 0, max: 5 }} marker={[v.angle, Math.min(5, fs)]} />
      <p className="text-sm">
        Factor of safety <strong>{fs === Infinity ? '∞' : fs.toFixed(2)}</strong> at {v.angle}°; this soil, this wet and this rooted, fails at <strong>{fail >= 90 ? 'no angle' : `${fail.toFixed(0)}°`}</strong>.
      </p>
    </div>
  )
}
