import { useEffect, useState } from 'react'
import { DataFooter } from '@/app/week/DataFooter'
import { useGlobe } from '@/app/week/useGlobe'
import { Button } from '@/components/ui/button'
import { velocityFieldSchema, type StationVelocity, type VelocityField } from '@/data/gnss/schema'
import { midpoint, nearestBoundary, type BoundaryLine } from '@/engine/tectonics/boundaries'
import { relativeMotion } from '@/engine/tectonics/motion'
import { KM_PER_MM_YR, velocityArrow } from '@/map/arrows'
import { BOUNDARY_COLOUR, BOUNDARY_LABEL, boundaryLayer, boundaryLines, type BoundaryFeature } from '@/map/boundaries'

const STATION_COLOUR = 'rgba(30, 41, 59, 0.9)'
const ARROW_COLOUR = '#ea580c'
const RELATIVE_COLOUR = '#9333ea'
const SOURCE_PAGE = 'https://www.earthscope.org/'

interface Bundle {
  field: VelocityField
  gnss: { fetched: string; url: string }
  boundaries: BoundaryFeature[]
  lines: BoundaryLine[]
  pb2002: { fetched: string; url: string }
}

// The bundles are a few hundred kilobytes each, so they load with the pane, not with the app.
async function loadBundle(): Promise<Bundle> {
  const [field, gnssIndex, pb, pbIndex] = await Promise.all([
    import('@data/gnss/cwu.final_nam14.20231230.json'),
    import('@data/gnss/index.json'),
    import('@data/tectonics/pb2002-boundaries.json'),
    import('@data/tectonics/index.json'),
  ])
  const boundaries = pb.default.features as BoundaryFeature[]
  return {
    field: velocityFieldSchema.parse(field.default),
    gnss: gnssIndex.default['cwu.final_nam14.20231230'],
    boundaries,
    lines: boundaryLines(boundaries),
    pb2002: pbIndex.default['pb2002-boundaries'],
  }
}

const pm = (value: number, sigma: number) => `${value.toFixed(1)} ± ${sigma.toFixed(1)} mm/yr`

/** The Plate Motion Explorer: GNSS velocity arrows and plate boundaries on the globe; tap two stations for the motion between them. */
export function Explore() {
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showArrows, setShowArrows] = useState(true)
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [picked, setPicked] = useState<string[]>([])
  const { container, engine, ready, error: globeError } = useGlobe((pick) => {
    if (pick === null || pick.layerId !== 'stations') return setPicked([])
    setPicked((prev) => {
      const [first] = prev
      return prev.length === 1 && first !== undefined && first !== pick.pointId ? [first, pick.pointId] : [pick.pointId]
    })
  })

  useEffect(() => {
    let cancelled = false
    loadBundle()
      .then((b) => !cancelled && setBundle(b))
      .catch((e) => !cancelled && setLoadError(String(e)))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const map = engine.current
    if (!ready || !bundle || !map) return
    if (showBoundaries) map.addLines(boundaryLayer(bundle.boundaries))
    else map.removeLayer('boundaries')
  }, [ready, bundle, showBoundaries, engine])

  useEffect(() => {
    const map = engine.current
    if (!ready || !bundle || !map) return
    if (showArrows) map.addLines({ id: 'arrows', lines: bundle.field.stations.map((s) => velocityArrow(s.station, s, s, ARROW_COLOUR)) })
    else map.removeLayer('arrows')
    // Points go on after the lines so that a tap lands on the station, not its arrow.
    map.addLayer({ id: 'stations', colour: STATION_COLOUR, points: bundle.field.stations.map((s) => ({ id: s.station, lat: s.lat, lon: s.lon, time: 0, size: 6 })) })
  }, [ready, bundle, showArrows, engine])

  const stations = picked.map((code) => bundle?.field.stations.find((s) => s.station === code)).filter((s): s is StationVelocity => s !== undefined)
  const [a, b] = stations
  const relative = a && b ? relativeMotion(a, b) : null
  const nearest = a && b && bundle ? nearestBoundary(midpoint(a, b), bundle.lines) : null

  useEffect(() => {
    const map = engine.current
    if (!ready || !map) return
    if (relative && b) map.addLines({ id: 'relative', lines: [{ ...velocityArrow('relative', b, { ve: relative.east, vn: relative.north }, RELATIVE_COLOUR), width: 3 }] })
    else map.removeLayer('relative')
  }, [ready, relative, b, engine])

  const error = loadError ?? globeError

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Layers">
        <Button size="sm" variant={showArrows ? 'default' : 'outline'} aria-pressed={showArrows} onClick={() => setShowArrows((v) => !v)}>
          Velocity arrows
        </Button>
        <Button size="sm" variant={showBoundaries ? 'default' : 'outline'} aria-pressed={showBoundaries} onClick={() => setShowBoundaries((v) => !v)}>
          Plate boundaries
        </Button>
        {picked.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setPicked([])}>
            Clear selection
          </Button>
        )}
      </div>

      {/* One neutral line: what is drawn and where it comes from. */}
      <p className="max-w-prose text-sm">
        Present-day velocities of GNSS stations in the NAM14 reference frame, from the{' '}
        <a href={SOURCE_PAGE} className="underline underline-offset-4" rel="noreferrer">
          EarthScope Consortium archive
        </a>
        , drawn as arrows over the PB2002 plate boundaries. Tap a station for its velocity, then a second for the motion between them.
      </p>
      <p className="text-sm text-muted-foreground" role="status">
        {bundle ? `${bundle.field.stations.length.toLocaleString()} stations · ${bundle.boundaries.length.toLocaleString()} boundary segments` : 'Loading…'}
      </p>

      <div ref={container} role="img" aria-label="Globe with GNSS velocity arrows and plate boundaries" className="h-[60vh] min-h-72 w-full rounded-lg border bg-muted" />

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
        {(Object.keys(BOUNDARY_LABEL) as (keyof typeof BOUNDARY_LABEL)[]).map((kind) => (
          <li key={kind} className="flex items-center gap-1">
            <span aria-hidden className="inline-block h-0.5 w-5" style={{ background: BOUNDARY_COLOUR[kind] }} />
            {BOUNDARY_LABEL[kind]}
          </li>
        ))}
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block h-0.5 w-5" style={{ background: ARROW_COLOUR }} />
          Station velocity, {KM_PER_MM_YR} km of arrow per mm/yr (20 mm/yr draws as {20 * KM_PER_MM_YR} km)
        </li>
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block h-0.5 w-5" style={{ background: RELATIVE_COLOUR }} />
          Motion of the second station relative to the first
        </li>
      </ul>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          The globe could not load: {error}
        </p>
      )}

      {stations.length > 0 && bundle && (
        <div className="grid max-w-prose gap-3 md:grid-cols-2">
          {stations.map((s, i) => (
            <section key={s.station} aria-labelledby={`station-${s.station}`} className="rounded-lg border bg-card p-4">
              <h2 id={`station-${s.station}`} className="font-medium">
                {i === 0 ? 'First' : 'Second'} station: {s.station}
              </h2>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Location</dt>
                <dd>
                  {s.lat.toFixed(3)}, {s.lon.toFixed(3)}
                </dd>
                <dt className="text-muted-foreground">East</dt>
                <dd>{pm(s.ve, s.se)}</dd>
                <dt className="text-muted-foreground">North</dt>
                <dd>{pm(s.vn, s.sn)}</dd>
                <dt className="text-muted-foreground">Up</dt>
                <dd>{pm(s.vu, s.su)}</dd>
                <dt className="text-muted-foreground">Observed</dt>
                <dd>
                  {s.from} to {s.to}
                </dd>
                <dt className="text-muted-foreground">Frame</dt>
                <dd>
                  {bundle.field.frame}, epoch {bundle.field.epoch}
                </dd>
              </dl>
            </section>
          ))}
          {relative && a && b && (
            <section aria-labelledby="relative-heading" className="rounded-lg border bg-card p-4 md:col-span-2">
              <h2 id="relative-heading" className="font-medium">
                {b.station} relative to {a.station}
              </h2>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Speed</dt>
                <dd>{relative.speed.toFixed(1)} mm/yr</dd>
                <dt className="text-muted-foreground">Direction</dt>
                <dd>{relative.azimuth.toFixed(0)}° from north</dd>
                <dt className="text-muted-foreground">Components</dt>
                <dd>
                  east {relative.east.toFixed(1)}, north {relative.north.toFixed(1)} mm/yr
                </dd>
                <dt className="text-muted-foreground">Nearest boundary to the midpoint</dt>
                <dd>{nearest ? `${BOUNDARY_LABEL[nearest.kind]}, ${nearest.km.toFixed(0)} km away` : 'none within 200 km'}</dd>
              </dl>
            </section>
          )}
        </div>
      )}

      {bundle && (
        <>
          <DataFooter snapshot={{ fetched_at: `${bundle.gnss.fetched}T00:00:00Z`, source_url: bundle.gnss.url, data: null }} attribution="EarthScope Consortium, NSF NGF data archive (CC BY 4.0)" />
          <DataFooter snapshot={{ fetched_at: `${bundle.pb2002.fetched}T00:00:00Z`, source_url: bundle.pb2002.url, data: null }} attribution="Bird (2003) PB2002 boundaries via tectonicplates (ODC-BY 1.0)" />
        </>
      )}
    </div>
  )
}
