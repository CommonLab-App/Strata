import { layers, namedFlavor } from '@protomaps/basemaps'
import { addProtocol, config, Map as MapLibreMap, type FilterSpecification, type MapMouseEvent, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { Protocol } from 'pmtiles'
import type { CreateEngine, LineLayer, MapEngine, Pick, PointLayer, TimeRange } from '../types'

// MapLibre looks for its worker beside its own module, which the bundle does not provide: Vite serves the file as an asset instead.
config.WORKER_URL = workerUrl
addProtocol('pmtiles', new Protocol().tile)

/** Folder with world.pmtiles, fonts/ and sprites/ from scripts/build-basemap.sh (docs/DECISIONS.md). Unset: OSM raster tiles, development only. */
const BASEMAP = (import.meta.env.VITE_BASEMAP_URL as string | undefined)?.replace(/\/$/, '')

// ponytail: the flavour follows the theme at map start only; a theme change mid-session keeps the old basemap until reload.
const style = (): StyleSpecification => {
  if (!BASEMAP) {
    return {
      version: 8,
      sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' } },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
    }
  }
  const flavour = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  return {
    version: 8,
    glyphs: `${BASEMAP}/fonts/{fontstack}/{range}.pbf`,
    sprite: `${BASEMAP}/sprites/v4/${flavour}`,
    sources: {
      protomaps: {
        type: 'vector',
        url: `pmtiles://${BASEMAP}/world.pmtiles`,
        attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: layers('protomaps', namedFlavor(flavour), { lang: 'en' }),
  }
}

const filterFor = (range: TimeRange | null): FilterSpecification | null => (range === null ? null : ['all', ['>=', ['get', 't'], range.start], ['<=', ['get', 't'], range.end]])

export const createEngine: CreateEngine = async (container) => {
  const map = new MapLibreMap({
    container,
    style: style(),
    center: [0, 20],
    zoom: 1.2,
    // At most two device pixels per CSS pixel: a 3x phone draws under half the fragments for a globe that looks the same.
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    // No cross-fade as tiles arrive: it costs a frame every 16 ms for 300 ms per tile on a phone, for little.
    fadeDuration: 0,
  })
  await new Promise<void>((resolve) => map.once('style.load', () => resolve()))
  map.setProjection({ type: 'globe' })

  const layers = new Map<string, PointLayer>()
  const lineLayers = new Set<string>()
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
        paint: { 'circle-radius': ['/', ['get', 'size'], 2], 'circle-color': layer.colour ?? 'rgba(255, 69, 0, 0.85)', 'circle-stroke-color': 'rgba(255, 255, 255, 0.6)', 'circle-stroke-width': 1 },
        filter: filterFor(range) ?? true,
      })
      layers.set(layer.id, layer)
    },
    addLines(layer: LineLayer) {
      engine.removeLayer(layer.id)
      map.addSource(layer.id, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: layer.lines.map((l) => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: l.coordinates }, properties: { id: l.id, colour: l.colour, width: l.width ?? 1.5 } })),
        },
      })
      map.addLayer({ id: layer.id, type: 'line', source: layer.id, paint: { 'line-color': ['get', 'colour'], 'line-width': ['get', 'width'] }, layout: { 'line-cap': 'round', 'line-join': 'round' } })
      lineLayers.add(layer.id)
    },
    removeLayer(id) {
      if (!layers.has(id) && !lineLayers.has(id)) return
      map.removeLayer(id)
      map.removeSource(id)
      layers.delete(id)
      lineLayers.delete(id)
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
