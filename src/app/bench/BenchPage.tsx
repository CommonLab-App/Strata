import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useAppState } from '@/app/AppState'
import { getSnapshot } from '@/app/data/snapshot'
import { PageHeader } from '@/app/PageHeader'
import { usgsQuakes } from '@/data/adapters/usgs-quakes'
import { quakePoint, syntheticPoints } from '@/map/points'
import type { MapEngine, Pick } from '@/map/types'

/** The two phase-1 candidates, each in its own lazy chunk so the build reports their sizes apart (vite.config.ts manualChunks). */
const ENGINES = {
  cesium: () => import('@/map/cesium'),
  maplibre: () => import('@/map/maplibre'),
} as const
type EngineName = keyof typeof ENGINES

interface Result {
  engine: EngineName
  ready_ms: number
  points: number
  fps_mean: number
  fps_worst_500ms: number
}

/** Frames per second over one long flight around the globe: the mean, and the worst half-second window. */
async function measureFps(engine: MapEngine, durationMs: number): Promise<{ fps_mean: number; fps_worst_500ms: number }> {
  const stamps: number[] = []
  let running = true
  const tick = (t: number) => {
    stamps.push(t)
    if (running) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  await engine.flyTo({ lat: -20, lon: 150, zoom: 2.5, durationMs })
  running = false
  const first = stamps[0] ?? 0
  const last = stamps[stamps.length - 1] ?? first
  const seconds = (last - first) / 1000
  let worst = Infinity
  for (let start = first; start + 500 <= last; start += 250) {
    const n = stamps.filter((s) => s >= start && s < start + 500).length
    worst = Math.min(worst, n * 2)
  }
  return { fps_mean: seconds > 0 ? Math.round((stamps.length - 1) / seconds) : 0, fps_worst_500ms: Number.isFinite(worst) ? worst : 0 }
}

/**
 * The phase-1 engine bench and the seed of the Explore pane: /bench/cesium or /bench/maplibre draws the past day's
 * quakes; ?points=10000 adds that many synthetic points and flies the camera to measure the frame rate. The result
 * is written to #bench-result as JSON for scripts/bench.mjs to read.
 */
export function BenchPage() {
  const { engine: name } = useParams()
  const [search] = useSearchParams()
  const extra = Number(search.get('points') ?? 0)
  const ref = useRef<HTMLDivElement>(null)
  const { store } = useAppState()
  const [result, setResult] = useState<Result | null>(null)
  const [pick, setPick] = useState<Pick | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const container = ref.current
    if (!container || !(name && name in ENGINES)) return
    const engineName = name as EngineName
    let engine: MapEngine | undefined
    let cancelled = false
    const t0 = performance.now()
    ;(async () => {
      try {
        const { createEngine } = await ENGINES[engineName]()
        engine = await createEngine(container)
        if (cancelled) return
        const ready_ms = Math.round(performance.now() - t0)
        engine.onPick(setPick)
        const quakes = await getSnapshot(store, usgsQuakes, { range: 'day' })
        if (cancelled) return
        engine.addLayer({ id: 'quakes', points: quakes.data.map(quakePoint) })
        if (extra > 0) engine.addLayer({ id: 'synthetic', points: syntheticPoints(extra, 1) })
        const fps = extra > 0 ? await measureFps(engine, 6000) : { fps_mean: 0, fps_worst_500ms: 0 }
        if (!cancelled) setResult({ engine: engineName, ready_ms, points: quakes.data.length + extra, ...fps })
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    })()
    return () => {
      cancelled = true
      engine?.destroy()
    }
  }, [name, extra, store])

  if (!(name && name in ENGINES)) return <PageHeader title="Unknown engine" />
  return (
    <>
      <PageHeader title={`Bench: ${name}`} />
      <div ref={ref} className="h-[70vh] w-full rounded-lg border" />
      <pre id="bench-result" className="mt-3 text-xs">
        {error ?? (result ? JSON.stringify(result) : 'measuring…')}
      </pre>
      {pick && <p className="text-sm">Picked {pick.pointId} in {pick.layerId}</p>}
    </>
  )
}
