import { config, Map as MapLibreMap, type FilterSpecification, type MapMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'

// MapLibre looks for its worker beside its own module, which the bundle does not provide: Vite serves the file as an asset instead.
config.WORKER_URL = workerUrl
import type { CreateEngine, MapEngine, Pick, PointLayer, TimeRange } from '../types'

const filterFor = (range: TimeRange | null): FilterSpecification | null => (range === null ? null : ['all', ['>=', ['get', 't'], range.start], ['<=', ['get', 't'], range.end]])

export const createEngine: CreateEngine = async (container) => {
  const map = new MapLibreMap({
    container,
    style: {
      version: 8,
      sources: {
        osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' },
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
    },
    center: [0, 20],
    zoom: 1.2,
  })
  await new Promise<void>((resolve) => map.once('style.load', () => resolve()))
  map.setProjection({ type: 'globe' })

  const layers = new Map<string, PointLayer>()
  let range: TimeRange | null = null
  const picks = new Set<(pick: Pick | null) => void>()
  map.on('click', (event: MapMouseEvent) => {
    const hit = map.queryRenderedFeatures(event.point, { layers: [...layers.keys()] })[0]
    const pick = hit?.layer && typeof hit.properties?.id === 'string' ? { layerId: hit.layer.id, pointId: hit.properties.id } : null
    for (const callback of picks) callback(pick)
  })

  const engine: MapEngine = {
    addLayer(layer) {
      engine.removeLayer(layer.id)
      map.addSource(layer.id, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: layer.points.map((p) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lon, p.lat] }, properties: { id: p.id, t: p.time, size: p.size } })),
        },
      })
      map.addLayer({
        id: layer.id,
        type: 'circle',
        source: layer.id,
        paint: { 'circle-radius': ['/', ['get', 'size'], 2], 'circle-color': 'rgba(255, 69, 0, 0.85)', 'circle-stroke-color': 'rgba(255, 255, 255, 0.6)', 'circle-stroke-width': 1 },
        filter: filterFor(range) ?? true,
      })
      layers.set(layer.id, layer)
    },
    removeLayer(id) {
      if (!layers.has(id)) return
      map.removeLayer(id)
      map.removeSource(id)
      layers.delete(id)
    },
    setTime(next) {
      range = next
      for (const id of layers.keys()) map.setFilter(id, filterFor(range))
    },
    flyTo({ lat, lon, zoom, durationMs = 1500 }) {
      return new Promise((resolve) => {
        map.once('moveend', () => resolve())
        map.flyTo({ center: [lon, lat], zoom, duration: durationMs })
      })
    },
    onPick(callback) {
      picks.add(callback)
      return () => picks.delete(callback)
    },
    destroy() {
      map.remove()
    },
  }
  return engine
}
