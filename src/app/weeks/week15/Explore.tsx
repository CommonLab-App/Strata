import { useState } from 'react'
import { Plot } from '@/app/sim/Plot'
import { Sliders } from '@/app/sim/Sliders'
import { TopoView } from '@/app/topo/TopoView'
import { DataFooter } from '@/app/week/DataFooter'
import { useArea } from '@/app/weeks/week12/useArea'
import { COAST_ID, TERRAIN_ATTRIBUTION } from '@/data/terrain/schema'
import { floodedFraction, glaciate, PROFILE_HALF_WIDTH, PROFILE_POINTS, shapeExponent, vValley } from '@/engine/surface'

/** Week 15: a valley under ice, and a coast under a rising sea. */
export function Explore() {
  const [g, setG] = useState({ ice: 400, years: 6000 })
  const [sea, setSea] = useState({ level: 0 })
  const v = vValley(500)
  const u = glaciate(v, g.ice, g.years)
  const x = (i: number) => (i / (PROFILE_POINTS - 1)) * 2 * PROFILE_HALF_WIDTH - PROFILE_HALF_WIDTH
  const { area, grid, error } = useArea(COAST_ID)
  return (
    <div className="grid max-w-prose gap-5">
      <h2 className="text-sm font-medium">A valley under ice</h2>
      <p className="text-muted-foreground">
        A river cuts a V. Fill the valley with ice and the glacier scours hardest where the ice is thickest, at the
        bottom, until the V becomes a U. The shape number is the exponent of the profile: 1 for a V, 2 for a parabola,
        higher for a flat-floored trough.
      </p>
      <Sliders
        specs={[
          { key: 'ice', label: 'Ice surface above the original floor', min: 0, max: 500, step: 10, unit: 'm' },
          { key: 'years', label: 'Time under ice', min: 0, max: 10000, step: 100, unit: 'years' },
        ]}
        values={g}
        onChange={(key, value) => setG({ ...g, [key]: value })}
      />
      <Plot
        title="Valley cross-profile before and after glaciation"
        series={[
          { id: 'v', label: 'River valley', points: v.map((z, i) => [x(i) / 1000, z]), colour: '#9a3412' },
          { id: 'u', label: 'After the glacier', points: u.map((z, i) => [x(i) / 1000, z]), colour: '#2563eb' },
        ]}
        x={{ label: 'Distance across the valley', unit: 'km' }}
        y={{ label: 'Elevation', unit: 'm' }}
      />
      <p className="text-sm">
        Shape number {shapeExponent(u).toFixed(2)}; the floor has dropped {Math.round(-Math.min(...u))} m.
      </p>
      <h2 className="text-sm font-medium">A coast under a rising sea</h2>
      <p className="text-muted-foreground">
        Sea level has swung by more than a hundred metres as ice sheets grew and melted. On a low coast a few metres
        move the shoreline a long way. Raise the sea on this real elevation grid and watch the land go under.
      </p>
      <Sliders specs={[{ key: 'level', label: 'Sea level relative to today', min: -5, max: 15, step: 0.5, unit: 'm' }]} values={sea} onChange={(key, value) => setSea({ ...sea, [key]: value })} />
      {grid && area ? (
        <>
          <TopoView grid={grid} interval={5} floodLevel={sea.level} title={`Coastal area with the sea at ${sea.level} m`} />
          <p className="text-sm">
            {Math.round(floodedFraction(grid, sea.level) * 100)} % of the area is at or below {sea.level} m; today {Math.round(floodedFraction(grid, 0) * 100)} % is.
          </p>
          <DataFooter snapshot={{ fetched_at: '2026-11-09', source_url: area.url, data: null }} attribution={TERRAIN_ATTRIBUTION} />
        </>
      ) : error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          The elevation data could not load: {error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          Loading…
        </p>
      )}
    </div>
  )
}
