import { useEffect, useState } from 'react'
import { Seismograms, stationKey } from '@/app/quakes/Seismograms'
import { DataFooter } from '@/app/week/DataFooter'
import { useGlobe } from '@/app/week/useGlobe'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { EVENT_IDS, loadEvent, type EventId, type TeachingEvent } from '@/data/seismograms/schema'
import { TRAVEL_TIME_TABLE } from '@/engine/seismic/travelTime'
import { EMPTY_EPICENTRE, EPICENTRE_MARKS, epicentreWorksheetSchema, scoreEpicentre, stationDistances, type EpicentreWorksheet, type StationForLab } from '@/engine/seismic/worksheet'
import { circleLine } from '@/map/circles'

const STATION_COLOUR = 'rgba(30, 41, 59, 0.9)'
const CIRCLE_COLOUR = '#2563eb'
const LEARNER_COLOUR = '#9333ea'
const CATALOGUE_COLOUR = '#dc2626'

const isEventId = (s: string): s is EventId => (EVENT_IDS as readonly string[]).includes(s)

/**
 * Week 9 lab: locate an epicentre. Pick P and S on three records, the table turns each S minus P into a distance,
 * the globe draws the three circles, and a tap places the epicentre. The checker recomputes from the same picks.
 */
export function Lab({ progress, update }: LabProps) {
  const parsed = epicentreWorksheetSchema.safeParse(progress.data)
  const ws: EpicentreWorksheet = parsed.success && isEventId(parsed.data.event) ? parsed.data : EMPTY_EPICENTRE(EVENT_IDS[0])
  const eventId = isEventId(ws.event) ? ws.event : EVENT_IDS[0]
  const [event, setEvent] = useState<TeachingEvent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const save = (patch: Partial<EpicentreWorksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })

  useEffect(() => {
    let cancelled = false
    setEvent(null)
    loadEvent(eventId)
      .then((e) => !cancelled && setEvent(e))
      .catch((e) => !cancelled && setError(String(e)))
    return () => {
      cancelled = true
    }
  }, [eventId])

  const { container, engine, ready, error: globeError } = useGlobe((pick, at) => {
    if (pick === null) save({ epicentre: { lat: Math.round(at.lat * 100) / 100, lon: Math.round(at.lon * 100) / 100 } })
  })

  const stations: StationForLab[] = event ? event.stations.map((s) => ({ key: stationKey(s), lat: s.lat, lon: s.lon, refP: s.refP, refS: s.refS })) : []
  const distances = event ? stationDistances(ws, stations, TRAVEL_TIME_TABLE) : []
  const catalogue = event ? { lat: event.event.lat, lon: event.event.lon } : null
  const result = event && catalogue ? scoreEpicentre(ws, stations, catalogue, TRAVEL_TIME_TABLE) : null

  // The stations go on once per event, and the view moves to it once; the learner can then pan and zoom freely.
  useEffect(() => {
    const map = engine.current
    if (!ready || !map || !event) return
    map.removeLayer('circles')
    map.removeLayer('epicentres')
    map.addLayer({ id: 'stations', colour: STATION_COLOUR, points: event.stations.map((s) => ({ id: stationKey(s), lat: s.lat, lon: s.lon, time: 0, size: 8 })) })
    void map.flyTo({ lat: event.event.lat, lon: event.event.lon, zoom: 2.4, durationMs: 0 })
  }, [ready, event, engine])

  // Circles, the learner's point and (after a check) the catalogue epicentre follow the worksheet.
  useEffect(() => {
    const map = engine.current
    if (!ready || !map || !event) return
    const labStations: StationForLab[] = event.stations.map((s) => ({ key: stationKey(s), lat: s.lat, lon: s.lon, refP: s.refP, refS: s.refS }))
    const circles = stationDistances(ws, labStations, TRAVEL_TIME_TABLE).flatMap((d, i) => (d ? [circleLine(d.key, labStations[i]!, d.km, CIRCLE_COLOUR)] : []))
    if (circles.length > 0) map.addLines({ id: 'circles', lines: circles })
    else map.removeLayer('circles')
    const points = []
    if (ws.epicentre) points.push({ id: 'learner', lat: ws.epicentre.lat, lon: ws.epicentre.lon, time: 0, size: 12, colour: LEARNER_COLOUR })
    if (ws.checked) points.push({ id: 'catalogue', lat: event.event.lat, lon: event.event.lon, time: 0, size: 12, colour: CATALOGUE_COLOUR })
    if (points.length > 0) map.addLayer({ id: 'epicentres', points })
    else map.removeLayer('epicentres')
  }, [ready, event, ws, engine])

  const setPick = (station: string, which: 'p' | 's', seconds: number) => {
    const current = ws.picks[station] ?? { p: null, s: null }
    save({ picks: { ...ws.picks, [station]: { ...current, [which]: seconds } } })
  }
  const check = () => {
    if (!result) return
    update({ data: { ...ws, checked: true, score: result.score }, labDone: true })
  }

  return (
    <div className="grid gap-5">
      <p className="max-w-prose text-muted-foreground">
        Choose a teaching earthquake. On each record mark where the P wave arrives and where the S wave arrives; the
        gap between them, read against the travel-time table, is the distance to the source. Each distance draws a
        circle around its station. Tap the globe where the three circles meet to place your epicentre, then check.
      </p>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Teaching earthquake">
        {EVENT_IDS.map((id) => (
          <Button key={id} size="sm" variant={id === eventId ? 'default' : 'outline'} aria-pressed={id === eventId} onClick={() => update({ data: EMPTY_EPICENTRE(id) })}>
            {id}
          </Button>
        ))}
      </div>

      {event && (
        <p className="max-w-prose text-sm">
          M {event.event.mag.toFixed(1)}, <time dateTime={event.event.time}>{new Date(event.event.time).toLocaleString()}</time>, depth {event.event.depthKm.toFixed(0)} km
          {event.event.place && `, ${event.event.place}`}.{' '}
          <a href={event.event.url} className="underline underline-offset-4" rel="noreferrer">
            Event page at the USGS
          </a>
          .
        </p>
      )}

      {event ? <Seismograms event={event} picks={ws.picks} onPick={setPick} /> : !error && <p className="text-sm text-muted-foreground">Loading records…</p>}

      {event && (
        <table className="max-w-prose text-sm">
          <caption className="sr-only">S minus P and distance for each station</caption>
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pr-4 font-normal">Station</th>
              <th className="pr-4 font-normal">S − P (s)</th>
              <th className="font-normal">Distance from the table (km)</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((s, i) => (
              <tr key={s.key}>
                <td className="pr-4">{s.key}</td>
                <td className="pr-4 tabular-nums">{distances[i]?.sp.toFixed(1) ?? '—'}</td>
                <td className="tabular-nums">{distances[i] ? distances[i].km.toFixed(0) : 'mark both arrivals'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div ref={container} role="img" aria-label="Globe with the three stations, their distance circles and the placed epicentre" className="h-[50vh] min-h-64 w-full rounded-lg border bg-muted" />
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block size-2.5 rounded-full" style={{ background: STATION_COLOUR }} />
          Station
        </li>
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block h-0.5 w-5" style={{ background: CIRCLE_COLOUR }} />
          Distance circle
        </li>
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block size-2.5 rounded-full" style={{ background: LEARNER_COLOUR }} />
          Your epicentre{ws.epicentre && `: ${ws.epicentre.lat.toFixed(2)}, ${ws.epicentre.lon.toFixed(2)}`}
        </li>
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block size-2.5 rounded-full" style={{ background: CATALOGUE_COLOUR }} />
          Catalogue epicentre, shown after you check
        </li>
      </ul>

      {(error ?? globeError) && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          Something could not load: {error ?? globeError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!result}>
          Check
        </Button>
        {!result && event && <p className="text-sm text-muted-foreground">Mark P and S on all three records and tap the globe to place your epicentre.</p>}
      </div>

      {ws.checked && result && (
        <section aria-labelledby="result-heading" className="max-w-prose rounded-lg border bg-card p-4 text-sm">
          <h2 id="result-heading" className="font-medium">
            {result.score} of {EPICENTRE_MARKS}
          </h2>
          <ul className="mt-2 grid gap-1">
            <li>{result.pointOk ? 'Your point sits where your three circles meet.' : `Your point is more than 50 km from where your circles meet (${result.expected.lat.toFixed(2)}, ${result.expected.lon.toFixed(2)}).`}</li>
            <li>{result.picksOk ? 'Every pick is within 2 s of the reference arrival.' : 'At least one pick is more than 2 s from the reference arrival; look for the first sharp rise for P and the larger, slower swings for S.'}</li>
            <li>Your point is {result.missKm.toFixed(0)} km from the catalogue epicentre.</li>
          </ul>
        </section>
      )}

      {event && <DataFooter snapshot={{ fetched_at: event.event.time, source_url: event.event.url, data: null }} attribution="USGS catalogue; waveforms from the EarthScope Consortium FDSN services" />}
    </div>
  )
}
