import { useEffect, useState } from 'react'
import { QuakeGlobe } from '@/app/quakes/QuakeGlobe'
import { Seismograms, stationKey } from '@/app/quakes/Seismograms'
import { Button } from '@/components/ui/button'
import { EVENT_IDS, loadEvent, type EventId, type TeachingEvent } from '@/data/seismograms/schema'

/** Week 9: the quake globe coloured by depth, and the teaching earthquakes' records with the model's arrival times. */
export function Explore() {
  const [eventId, setEventId] = useState<EventId>(EVENT_IDS[0])
  const [event, setEvent] = useState<TeachingEvent | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const picks = event ? Object.fromEntries(event.stations.map((s) => [stationKey(s), { p: s.refP, s: s.refS }])) : {}

  return (
    <QuakeGlobe colourByDepth>
      <section aria-labelledby="records-heading" className="grid gap-3">
        <h2 id="records-heading" className="text-sm font-medium">
          Seismograms of a teaching earthquake
        </h2>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Teaching earthquake">
          {EVENT_IDS.map((id) => (
            <Button key={id} size="sm" variant={id === eventId ? 'default' : 'outline'} aria-pressed={id === eventId} onClick={() => setEventId(id)}>
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
            . Red and blue lines are the P and S arrival times a two-layer Earth model predicts at each station&rsquo;s distance; in the Lab you mark them yourself.
          </p>
        )}
        {event ? <Seismograms event={event} picks={picks} readOnly /> : !error && <p className="text-sm text-muted-foreground">Loading records…</p>}
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            The records could not load: {error}
          </p>
        )}
      </section>
    </QuakeGlobe>
  )
}
