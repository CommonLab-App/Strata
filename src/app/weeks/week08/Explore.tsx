import { useEffect, useState } from 'react'
import { useAppState } from '@/app/AppState'
import { getSnapshot } from '@/app/data/snapshot'
import { DataFooter } from '@/app/week/DataFooter'
import { useGlobe } from '@/app/week/useGlobe'
import { Button } from '@/components/ui/button'
import { GPLATES_MAX_MA, GPLATES_MODEL, gplatesPlates, gplatesPoints } from '@/data/adapters/gplates'
import type { Snapshot } from '@/data/adapters/types'
import type { StationVelocity } from '@/data/gnss/schema'
import { midpoint, nearestBoundary } from '@/engine/tectonics/boundaries'
import { relativeMotion } from '@/engine/tectonics/motion'
import { KM_PER_MM_YR, velocityArrow } from '@/map/arrows'
import { BOUNDARY_COLOUR, BOUNDARY_LABEL, boundaryLayer } from '@/map/boundaries'
import { GNSS_ATTRIBUTION, loadBundle, PB2002_ATTRIBUTION, type Bundle } from './bundle'

const STATION_COLOUR = 'rgba(30, 41, 59, 0.9)'
const ARROW_COLOUR = '#ea580c'
const RELATIVE_COLOUR = '#9333ea'
const SOURCE_PAGE = 'https://www.earthscope.org/'
const PLATE_COLOUR = '#6b7280'
const PALEO_COLOUR = '#0891b2'
/** Ages the slider offers; each is one cached snapshot of about 150 kB, so the step is coarse. */
const AGE_STEP_MA = 25

const pm = (value: number, sigma: number) => `${value.toFixed(1)} ± ${sigma.toFixed(1)} mm/yr`

/** The Plate Motion Explorer: GNSS velocity arrows and plate boundaries on the globe; tap two stations for the motion between them. */
export function Explore() {
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showArrows, setShowArrows] = useState(true)
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [picked, setPicked] = useState<string[]>([])
  const { store } = useAppState()
  const [ageMa, setAgeMa] = useState(0)
  const [plates, setPlates] = useState<Snapshot<[number, number][][]> | null>(null)
  const [paleo, setPaleo] = useState<{ ageMa: number; station: string; lon: number; lat: number } | null>(null)
  const [gplatesError, setGplatesError] = useState<string | null>(null)
  // The network is North American, so the globe opens there.
  const { container, engine, ready, error: globeError } = useGlobe(
    (pick) => {
      if (pick === null || pick.layerId !== 'stations') return setPicked([])
      setPicked((prev) => {
        const [first] = prev
        return prev.length === 1 && first !== undefined && first !== pick.pointId ? [first, pick.pointId] : [pick.pointId]
      })
    },
    { lat: 40, lon: -100, zoom: 1.2 },
  )

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

  // Reconstructed plate outlines at the chosen age, debounced so a slider drag asks the service once.
  useEffect(() => {
    if (ageMa === 0) return setPlates(null)
    let cancelled = false
    setGplatesError(null)
    const timer = setTimeout(() => {
      getSnapshot(store, gplatesPlates, { ageMa })
        .then((s) => !cancelled && setPlates(s))
        .catch((e) => !cancelled && setGplatesError(String(e)))
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [ageMa, store])

  useEffect(() => {
    const map = engine.current
    if (!ready || !map) return
    if (plates) map.addLines({ id: 'plates', lines: plates.data.map((ring, i) => ({ id: `plate-${i}`, coordinates: ring, colour: PLATE_COLOUR, width: 1 })) })
    else map.removeLayer('plates')
  }, [ready, plates, engine])

  // Where the first picked station's site lay at that age.
  useEffect(() => {
    if (ageMa === 0 || !a) return setPaleo(null)
    let cancelled = false
    const timer = setTimeout(() => {
      getSnapshot(store, gplatesPoints, { points: [[a.lon, a.lat]], ageMa })
        .then((s) => {
          const [point] = s.data
          if (!cancelled && point) setPaleo({ ageMa, station: a.station, lon: point[0], lat: point[1] })
        })
        .catch((e) => !cancelled && setGplatesError(String(e)))
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [ageMa, a, store])

  useEffect(() => {
    const map = engine.current
    if (!ready || !map) return
    if (paleo) map.addLayer({ id: 'paleo', colour: PALEO_COLOUR, points: [{ id: 'paleo', lat: paleo.lat, lon: paleo.lon, time: 0, size: 10 }] })
    else map.removeLayer('paleo')
  }, [ready, paleo, engine])

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
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block h-0.5 w-5" style={{ background: PLATE_COLOUR }} />
          Plate outlines at the chosen age
        </li>
      </ul>

      <div className="grid max-w-prose gap-1">
        <label htmlFor="age-slider" className="text-sm font-medium">
          Reconstruction age: {ageMa === 0 ? 'today' : `${ageMa} million years ago`}
        </label>
        <input id="age-slider" type="range" min={0} max={GPLATES_MAX_MA} step={AGE_STEP_MA} value={ageMa} onChange={(e) => setAgeMa(Number(e.target.value))} className="w-full" />
        <p className="text-xs text-muted-foreground">
          Past today the grey outlines are the plates reconstructed by the GPlates Web Service (model {GPLATES_MODEL}, to {GPLATES_MAX_MA} Ma); pick a station first and a blue dot marks where its site lay.
          {paleo && ` ${paleo.station} at ${paleo.ageMa} Ma: ${paleo.lat.toFixed(1)}, ${paleo.lon.toFixed(1)}.`}
        </p>
        {gplatesError && (
          <p role="alert" className="text-xs text-red-700 dark:text-red-400">
            The reconstruction could not load: {gplatesError}
          </p>
        )}
      </div>

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
          <DataFooter snapshot={{ fetched_at: bundle.gnss.fetched, source_url: bundle.gnss.url, data: null }} attribution={GNSS_ATTRIBUTION} />
          <DataFooter snapshot={{ fetched_at: bundle.pb2002.fetched, source_url: bundle.pb2002.url, data: null }} attribution={PB2002_ATTRIBUTION} />
          {plates && <DataFooter snapshot={plates} attribution={gplatesPlates.attribution} />}
        </>
      )}
    </div>
  )
}
