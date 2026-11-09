import { useEffect, useState } from 'react'
import { useAppState } from '@/app/AppState'
import { getSnapshot } from '@/app/data/snapshot'
import { DataFooter } from '@/app/week/DataFooter'
import { useGlobe } from '@/app/week/useGlobe'
import { Button } from '@/components/ui/button'
import type { Snapshot } from '@/data/adapters/types'
import { QUAKE_RANGES, usgsQuakes, type Quake, type QuakeRange } from '@/data/adapters/usgs-quakes'
import { quakePoint } from '@/map/points'

const RANGE_LABEL: Record<QuakeRange, string> = { hour: 'hour', day: 'day', week: '7 days', month: '30 days' }
const FEED_PAGE = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php'

/** The globe with the USGS quake layer: a time-range toggle, a tap on a quake for its fields, and the data footer. */
export function Explore() {
  const { store } = useAppState()
  const [range, setRange] = useState<QuakeRange>('day')
  const [snapshot, setSnapshot] = useState<Snapshot<Quake[]> | null>(null)
  const [fetchError, setError] = useState<string | null>(null)
  const [pickedId, setPickedId] = useState<string | null>(null)
  const { container, engine: engineRef, ready: engineReady, error: globeError } = useGlobe((pick) => setPickedId(pick?.pointId ?? null))
  const error = fetchError ?? globeError

  useEffect(() => {
    let cancelled = false
    setSnapshot(null)
    setPickedId(null)
    getSnapshot(store, usgsQuakes, { range })
      .then((s) => !cancelled && setSnapshot(s))
      .catch((e) => !cancelled && setError(String(e)))
    return () => {
      cancelled = true
    }
  }, [range, store])

  useEffect(() => {
    if (engineReady && snapshot) engineRef.current?.addLayer({ id: 'quakes', points: snapshot.data.map(quakePoint) })
  }, [engineReady, snapshot])

  const picked = snapshot?.data.find((q) => q.id === pickedId) ?? null
  const largest = snapshot ? [...snapshot.data].sort((a, b) => (b.mag ?? -Infinity) - (a.mag ?? -Infinity)).slice(0, 5) : []

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Time range">
        <span className="text-sm text-muted-foreground">Past</span>
        {QUAKE_RANGES.map((r) => (
          <Button key={r} size="sm" variant={r === range ? 'default' : 'outline'} aria-pressed={r === range} onClick={() => setRange(r)}>
            {RANGE_LABEL[r]}
          </Button>
        ))}
      </div>

      {/* One neutral line: what is shown and where it comes from. Nothing here says what it means. The count is a
          separate element so that this paragraph, the page's largest text, is complete at first paint. */}
      <p className="max-w-prose text-sm">
        Earthquakes recorded by the USGS in the past {RANGE_LABEL[range]}. Tap one for its details, or see the{' '}
        <a href={FEED_PAGE} className="underline underline-offset-4" rel="noreferrer">
          feed at the USGS
        </a>
        .
      </p>
      <p className="text-sm text-muted-foreground" role="status">
        {snapshot ? `${snapshot.data.length.toLocaleString()} events` : 'Loading…'}
      </p>

      <div ref={container} role="img" aria-label="Globe with recent earthquakes marked" className="h-[60vh] min-h-72 w-full rounded-lg border bg-muted" />

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          The globe could not load: {error}
        </p>
      )}

      {picked && (
        <section aria-labelledby="quake-heading" className="max-w-prose rounded-lg border bg-card p-4">
          <h2 id="quake-heading" className="font-medium">
            {picked.mag !== null ? `M ${picked.mag.toFixed(1)}` : 'Magnitude not given'}
            {picked.place && ` · ${picked.place}`}
          </h2>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Time</dt>
            <dd>
              <time dateTime={picked.time}>{new Date(picked.time).toLocaleString()}</time>
            </dd>
            <dt className="text-muted-foreground">Location</dt>
            <dd>
              {picked.lat.toFixed(3)}, {picked.lon.toFixed(3)}
            </dd>
            <dt className="text-muted-foreground">Depth</dt>
            <dd>{picked.depth_km !== null ? `${picked.depth_km.toFixed(1)} km` : 'not given'}</dd>
          </dl>
          <a href={picked.url} className="mt-2 inline-block text-sm underline underline-offset-4" rel="noreferrer">
            Event page at the USGS
          </a>
        </section>
      )}

      {largest.length > 0 && (
        <section aria-labelledby="largest-heading" className="max-w-prose">
          <h2 id="largest-heading" className="text-sm font-medium">
            Largest in this range
          </h2>
          <ul className="mt-1 grid gap-1 text-sm">
            {largest.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  className="rounded-sm text-left underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  aria-pressed={q.id === pickedId}
                  onClick={() => {
                    setPickedId(q.id)
                    void engineRef.current?.flyTo({ lat: q.lat, lon: q.lon, zoom: 3 })
                  }}
                >
                  {q.mag !== null ? `M ${q.mag.toFixed(1)}` : 'M ?'}
                  {q.place && ` · ${q.place}`}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {snapshot && <DataFooter snapshot={snapshot} attribution={usgsQuakes.attribution} />}
    </div>
  )
}
