import { useEffect, useRef, useState } from 'react'
import { useAppState } from '@/app/AppState'
import { getSnapshot } from '@/app/data/snapshot'
import { DataFooter } from '@/app/week/DataFooter'
import { useGlobe } from '@/app/week/useGlobe'
import type { Snapshot } from '@/data/adapters/types'
import { usgsDischarge, usgsGauges, usgsWaterLevel, usgsWells, WATER_KINDS, WATER_SOURCE_PAGE, type Discharge, type Gauge, type WaterKind } from '@/data/adapters/usgs-water'

const GAUGE_COLOUR = 'rgba(29, 78, 216, 0.9)'
const PICKED_COLOUR = '#dc2626'

/**
 * The globe as a gauge finder: tap anywhere to list the active USGS stream gauges within half a degree, tap a gauge
 * for its last 30 days of discharge. Calls back with each record so a pane can plot it or a lab can keep it.
 */
export function GaugePicker({ onRecord, view, kind = 'stream' }: { onRecord: (record: Snapshot<Discharge> | null) => void; view?: { lat: number; lon: number; zoom: number }; kind?: WaterKind }) {
  const sites = kind === 'stream' ? usgsGauges : usgsWells
  const iv = kind === 'stream' ? usgsDischarge : usgsWaterLevel
  const noun = kind === 'stream' ? 'stream gauges' : 'instrumented wells'
  const { store } = useAppState()
  const [centre, setCentre] = useState<{ lat: number; lon: number } | null>(null)
  const [gauges, setGauges] = useState<Snapshot<Gauge[]> | null>(null)
  const [site, setSite] = useState<string | null>(null)
  const [record, setRecord] = useState<Snapshot<Discharge> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // The parent's callback, read at call time so the effect below need not depend on it.
  const onRecordRef = useRef(onRecord)
  onRecordRef.current = onRecord
  const { container, engine, ready, error: globeError } = useGlobe((pick, at) => {
    if (pick?.layerId === 'gauges') setSite(pick.pointId)
    else setCentre({ lat: at.lat, lon: at.lon })
  }, view)

  useEffect(() => {
    if (!centre) return
    let cancelled = false
    setBusy(true)
    setError(null)
    getSnapshot(store, sites, centre)
      .then((s) => !cancelled && setGauges(s))
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setBusy(false))
    return () => {
      cancelled = true
    }
  }, [centre, store, sites])

  useEffect(() => {
    if (!site) return
    let cancelled = false
    setBusy(true)
    setError(null)
    getSnapshot(store, iv, { site })
      .then((s) => {
        if (cancelled) return
        setRecord(s)
        onRecordRef.current(s)
      })
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setBusy(false))
    return () => {
      cancelled = true
    }
  }, [site, store, iv])

  useEffect(() => {
    const map = engine.current
    if (!ready || !map) return
    if (gauges) map.addLayer({ id: 'gauges', points: gauges.data.map((g) => ({ id: g.site, lat: g.lat, lon: g.lon, time: 0, size: 8, colour: g.site === site ? PICKED_COLOUR : GAUGE_COLOUR })) })
    else map.removeLayer('gauges')
  }, [ready, gauges, site, engine])

  const picked = gauges?.data.find((g) => g.site === site)
  return (
    <div className="grid gap-2">
      <p className="text-sm">
        Tap the globe to find active {noun} within half a degree of that spot, then tap one for its record ({WATER_KINDS[kind].label.toLowerCase()}, past 30 days). Sites and records come from the{' '}
        <a href={WATER_SOURCE_PAGE} className="underline underline-offset-4" rel="noreferrer">
          USGS Water Services
        </a>
        .
      </p>
      <p className="text-sm text-muted-foreground" role="status">
        {busy ? 'Loading…' : gauges ? `${gauges.data.length} ${noun} near ${centre?.lat.toFixed(1)}, ${centre?.lon.toFixed(1)}${picked ? ` · ${picked.name}` : ''}` : 'No search yet.'}
      </p>
      <div ref={container} role="img" aria-label={`Globe for finding ${noun}`} className="h-[45vh] min-h-64 w-full rounded-lg border bg-muted" />
      {(error ?? globeError) && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          Something could not load: {error ?? globeError}
        </p>
      )}
      {gauges && <DataFooter snapshot={gauges} attribution={sites.attribution} />}
      {record && <DataFooter snapshot={record} attribution={iv.attribution} />}
    </div>
  )
}
