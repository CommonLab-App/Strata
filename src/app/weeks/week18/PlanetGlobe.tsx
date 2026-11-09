import { useEffect, type ReactNode } from 'react'
import { useGlobe } from '@/app/week/useGlobe'
import type { Box, Crater } from '@/engine/craters'
import { PLANETS, type PlanetId } from '@/map/planets'
import type { MapEngine } from '@/map/types'

const CRATER_COLOUR = 'rgba(234, 88, 12, 0.85)'
const BOX_COLOURS = ['#2563eb', '#dc2626']

/** The globe wearing another planet's mosaic, with optional crater dots and labelled boxes. Remount (key) to change planet. */
export function PlanetGlobe({ planet, craters = [], boxes = [], minDiameter = 0, children, onReady }: { planet: PlanetId; craters?: Crater[]; boxes?: Box[]; minDiameter?: number; children?: ReactNode; onReady?: (engine: MapEngine) => void }) {
  const { container, engine, ready, error } = useGlobe(() => undefined, { lat: 0, lon: 0, zoom: 1.4 }, PLANETS[planet].tiles)
  useEffect(() => {
    const map = engine.current
    if (!ready || !map) return
    const shown = craters.filter((c) => c.diameter >= minDiameter)
    if (shown.length > 0) map.addLayer({ id: 'craters', colour: CRATER_COLOUR, points: shown.map((c, i) => ({ id: `c${i}`, lat: c.lat, lon: c.lon, time: 0, size: Math.max(4, Math.min(14, c.diameter / 20)) })) })
    else map.removeLayer('craters')
    if (boxes.length > 0)
      map.addLines({
        id: 'boxes',
        lines: boxes.map((b, i) => ({ id: `box-${i}`, colour: BOX_COLOURS[i % 2]!, width: 2.5, coordinates: [[b.west, b.south], [b.east, b.south], [b.east, b.north], [b.west, b.north], [b.west, b.south]] })),
      })
    else map.removeLayer('boxes')
    onReady?.(map)
  }, [ready, craters, boxes, minDiameter, engine, onReady])
  return (
    <div className="grid gap-2">
      <div ref={container} role="img" aria-label={`${PLANETS[planet].name} with the chosen layers`} className="h-[55vh] min-h-72 w-full rounded-lg border bg-muted" />
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          The globe could not load: {error}
        </p>
      )}
      {children}
    </div>
  )
}
