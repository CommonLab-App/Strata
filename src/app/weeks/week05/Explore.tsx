import { useEffect, useState } from 'react'
import { DataFooter } from '@/app/week/DataFooter'
import { useGlobe } from '@/app/week/useGlobe'
import { Button } from '@/components/ui/button'
import { gvpUrl, largestVei, volcanoesSchema, type Volcano } from '@/data/volcanoes/schema'
import { BOUNDARY_COLOUR, BOUNDARY_LABEL, boundaryLayer, type BoundaryFeature } from '@/map/boundaries'

const VOLCANO_COLOUR = 'rgba(220, 38, 38, 0.85)'
const GVP_HOME = 'https://volcano.si.edu/'

interface Bundle {
  volcanoes: Volcano[]
  gvp: { fetched: string; urls: string[]; citation: string }
  boundaries: BoundaryFeature[]
  pb2002: { fetched: string; url: string }
}

async function loadBundle(): Promise<Bundle> {
  const [holocene, gvpIndex, pb, pbIndex] = await Promise.all([
    import('@data/volcanoes/holocene.json'),
    import('@data/volcanoes/index.json'),
    import('@data/tectonics/pb2002-boundaries.json'),
    import('@data/tectonics/index.json'),
  ])
  return { volcanoes: volcanoesSchema.parse(holocene.default), gvp: gvpIndex.default.holocene, boundaries: pb.default.features as BoundaryFeature[], pb2002: pbIndex.default['pb2002-boundaries'] }
}

/** A GVP year as text: negative years are BCE. */
const year = (y: number) => (y < 0 ? `${-y} BCE` : `${y} CE`)

/** Holocene volcanoes beside the plate boundaries; a tap opens a volcano's GVP record. */
export function Explore() {
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [pickedId, setPickedId] = useState<string | null>(null)
  const { container, engine, ready, error: globeError } = useGlobe((pick) => setPickedId(pick?.layerId === 'volcanoes' ? pick.pointId : null))

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
    else map.removeLayer('plate-boundaries')
    map.addLayer({ id: 'volcanoes', colour: VOLCANO_COLOUR, points: bundle.volcanoes.map((v) => ({ id: String(v.number), lat: v.lat, lon: v.lon, time: 0, size: 5 })) })
  }, [ready, bundle, showBoundaries, engine])

  const picked = bundle?.volcanoes.find((v) => String(v.number) === pickedId) ?? null
  const vei = picked ? largestVei(picked) : null
  const error = loadError ?? globeError

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Layers">
        <Button size="sm" variant={showBoundaries ? 'default' : 'outline'} aria-pressed={showBoundaries} onClick={() => setShowBoundaries((v) => !v)}>
          Plate boundaries
        </Button>
      </div>

      {/* One neutral line: what is drawn and where it comes from. */}
      <p className="max-w-prose text-sm">
        Volcanoes with Holocene activity in the Smithsonian{' '}
        <a href={GVP_HOME} className="underline underline-offset-4" rel="noreferrer">
          Global Volcanism Program
        </a>
        &rsquo;s Volcanoes of the World database, drawn with the PB2002 plate boundaries. Tap one for its record.
      </p>
      <p className="text-sm text-muted-foreground" role="status">
        {bundle ? `${bundle.volcanoes.length.toLocaleString()} volcanoes` : 'Loading…'}
      </p>

      <div ref={container} role="img" aria-label="Globe with Holocene volcanoes and plate boundaries" className="h-[60vh] min-h-72 w-full rounded-lg border bg-muted" />

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
        {(Object.keys(BOUNDARY_LABEL) as (keyof typeof BOUNDARY_LABEL)[]).map((kind) => (
          <li key={kind} className="flex items-center gap-1">
            <span aria-hidden className="inline-block h-0.5 w-5" style={{ background: BOUNDARY_COLOUR[kind] }} />
            {BOUNDARY_LABEL[kind]}
          </li>
        ))}
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block size-2.5 rounded-full" style={{ background: VOLCANO_COLOUR }} />
          Volcano
        </li>
      </ul>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          The globe could not load: {error}
        </p>
      )}

      {picked && (
        <section aria-labelledby="volcano-heading" className="max-w-prose rounded-lg border bg-card p-4">
          <h2 id="volcano-heading" className="font-medium">
            {picked.name}
          </h2>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{picked.type ?? 'not given'}</dd>
            <dt className="text-muted-foreground">Major rock type</dt>
            <dd>{picked.rock ?? 'not given'}</dd>
            <dt className="text-muted-foreground">Tectonic setting</dt>
            <dd>{picked.setting ?? 'not given'}</dd>
            <dt className="text-muted-foreground">Location</dt>
            <dd>
              {picked.lat.toFixed(3)}, {picked.lon.toFixed(3)}
              {picked.elevation !== null && `, ${picked.elevation} m`}
            </dd>
            <dt className="text-muted-foreground">Dated eruptions</dt>
            <dd>
              {picked.eruptions.length}
              {vei !== null && `, largest VEI ${vei}`}
            </dd>
            <dt className="text-muted-foreground">Last known eruption</dt>
            <dd>{picked.lastEruption !== null ? year(picked.lastEruption) : 'not given'}</dd>
          </dl>
          {picked.eruptions.length > 0 && <EruptionHistory eruptions={picked.eruptions} />}
          <a href={gvpUrl(picked.number)} className="mt-2 inline-block text-sm underline underline-offset-4" rel="noreferrer">
            Record at the Global Volcanism Program
          </a>
        </section>
      )}

      {bundle && (
        <>
          <DataFooter snapshot={{ fetched_at: bundle.gvp.fetched, source_url: bundle.gvp.urls[0] ?? GVP_HOME, data: null }} attribution="Global Volcanism Program, Smithsonian Institution (Volcanoes of the World v. 5.4.0)" />
          <DataFooter snapshot={{ fetched_at: bundle.pb2002.fetched, source_url: bundle.pb2002.url, data: null }} attribution="Bird (2003) PB2002 boundaries via tectonicplates (ODC-BY 1.0)" />
        </>
      )}
    </div>
  )
}

/** Dated eruptions as bars of VEI by year; an eruption without a VEI is a short tick. */
function EruptionHistory({ eruptions }: { eruptions: Volcano['eruptions'] }) {
  const years = eruptions.map(([y]) => y)
  const lo = Math.min(...years)
  const hi = Math.max(...years, lo + 1)
  const W = 320
  const H = 90
  const x = (y: number) => 8 + ((y - lo) / (hi - lo)) * (W - 16)
  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Dated eruptions from ${year(lo)} to ${year(hi)}, bar height the VEI`} className="w-full text-xs">
        <line x1={8} x2={W - 8} y1={H - 16} y2={H - 16} stroke="currentColor" strokeOpacity={0.3} />
        {eruptions.map(([y, vei, confirmed], i) => (
          <line key={i} x1={x(y)} x2={x(y)} y1={H - 16} y2={H - 16 - (vei === null ? 4 : 6 + vei * 8)} stroke={confirmed ? VOLCANO_COLOUR : 'currentColor'} strokeOpacity={confirmed ? 1 : 0.4} strokeWidth={1.5} />
        ))}
        <text x={8} y={H - 3} fill="currentColor">
          {year(lo)}
        </text>
        <text x={W - 8} y={H - 3} textAnchor="end" fill="currentColor">
          {year(hi)}
        </text>
      </svg>
      <figcaption className="text-xs text-muted-foreground">Bar height is the eruption's VEI; short ticks have none recorded; faint bars are uncertain eruptions.</figcaption>
    </figure>
  )
}
