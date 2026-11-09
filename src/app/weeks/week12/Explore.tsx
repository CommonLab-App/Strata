import { useState } from 'react'
import { Plot } from '@/app/sim/Plot'
import { TopoView } from '@/app/topo/TopoView'
import { DataFooter } from '@/app/week/DataFooter'
import { Button } from '@/components/ui/button'
import { AREA_IDS, TERRAIN_ATTRIBUTION } from '@/data/terrain/schema'
import { gradient, lengthMetres, profile, type Point } from '@/engine/topo'
import { useArea } from './useArea'

const INTERVALS = [20, 50, 100, 200]

/** Week 12: a real elevation grid with contours at a chosen interval; tap two points for the profile between them. */
export function Explore() {
  const [areaId, setAreaId] = useState<(typeof AREA_IDS)[number]>(AREA_IDS[0])
  const [interval, setInterval] = useState(50)
  const [points, setPoints] = useState<Point[]>([])
  const { area, grid, error } = useArea(areaId)
  const line = points.length === 2 ? ([points[0]!, points[1]!] as [Point, Point]) : undefined
  const prof = grid && line ? profile(grid, line[0], line[1], 64) : null

  return (
    <div className="grid max-w-prose gap-4">
      <p className="text-muted-foreground">
        Contours join points of equal elevation: close together where the ground is steep, far apart where it is
        flat, bending upstream where they cross a valley. Change the interval to see detail come and go, and tap two
        points to draw the profile between them.
      </p>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Area">
        {AREA_IDS.map((id, i) => (
          <Button key={id} size="sm" variant={id === areaId ? 'default' : 'outline'} aria-pressed={id === areaId} onClick={() => (setAreaId(id), setPoints([]))}>
            Area {i + 1}
          </Button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">Interval</span>
        {INTERVALS.map((v) => (
          <Button key={v} size="sm" variant={v === interval ? 'default' : 'outline'} aria-pressed={v === interval} onClick={() => setInterval(v)}>
            {v} m
          </Button>
        ))}
      </div>
      {grid && area ? (
        <>
          <TopoView grid={grid} interval={interval} line={line} onTap={(p) => setPoints(points.length >= 2 ? [p] : [...points, p])} title={`Elevation of area ${AREA_IDS.indexOf(areaId) + 1} with ${interval} m contours`} />
          <p className="text-xs text-muted-foreground">
            Tile {area.tile.z}/{area.tile.x}/{area.tile.y}, {area.bounds.south.toFixed(2)}° to {area.bounds.north.toFixed(2)}° N, {area.bounds.west.toFixed(2)}° to {area.bounds.east.toFixed(2)}° E; about {Math.round(grid.dx)} m per cell. Thick contours every fifth line.
            {points.length === 1 && ' Tap a second point for the profile.'}
          </p>
          {prof && line && (
            <>
              <Plot title="Elevation profile from A to B" series={[{ id: 'profile', label: 'Elevation along the line', points: prof.map((s) => [s.metres / 1000, s.elevation]) }]} x={{ label: 'Distance', unit: 'km', min: 0 }} y={{ label: 'Elevation', unit: 'm' }} />
              <p className="text-sm">
                {(lengthMetres(grid, line[0], line[1]) / 1000).toFixed(2)} km from A to B; average gradient {gradient(grid, line[0], line[1]).toFixed(0)} m per km.
              </p>
            </>
          )}
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
