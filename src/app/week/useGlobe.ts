import { useEffect, useRef, useState } from 'react'
import { settled } from '@/app/settled'
import type { MapEngine, MapView, Pick } from '@/map/types'

/**
 * The globe in a pane: started only once the pane has painted in its web font and the browser is idle (its first
 * second of work would otherwise block the main thread while the text is still being laid out), destroyed with the
 * pane. `onPick` is called with each tap; the latest function is always the one called.
 */
export function useGlobe(onPick: (pick: Pick | null, at: { lat: number; lon: number }) => void, view?: MapView) {
  const container = useRef<HTMLDivElement>(null)
  const engine = useRef<MapEngine | null>(null)
  const pick = useRef(onPick)
  pick.current = onPick
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const element = container.current
    if (!element) return
    let created: MapEngine | undefined
    let cancelled = false
    settled()
      .then(() => (cancelled ? Promise.reject(new Error('cancelled')) : import('@/map/maplibre')))
      .then(({ createEngine }) => createEngine(element, view))
      .then((started) => {
        if (cancelled) return started.destroy()
        created = started
        engine.current = started
        started.onPick((p, at) => pick.current(p, at))
        setReady(true)
      })
      .catch((e) => !cancelled && setError(String(e)))
    return () => {
      cancelled = true
      created?.destroy()
      engine.current = null
      setReady(false)
    }
  }, [])

  return { container, engine, ready, error }
}
