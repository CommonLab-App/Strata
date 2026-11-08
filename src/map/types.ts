/** One dot on the globe. `time` is epoch milliseconds, so a layer can be filtered by setTime. */
export interface MapPoint {
  id: string
  lat: number
  lon: number
  time: number
  /** Diameter in CSS pixels. */
  size: number
}

export interface PointLayer {
  id: string
  points: MapPoint[]
}

export interface TimeRange {
  start: number
  end: number
}

export interface Pick {
  layerId: string
  pointId: string
}

/**
 * The whole of what the app asks of a globe engine. Phase 1 builds this twice (cesium/, maplibre/) and keeps one.
 * The engine owns its DOM inside the container it was given and frees everything on destroy.
 */
export interface MapEngine {
  addLayer(layer: PointLayer): void
  removeLayer(id: string): void
  /** Shows only the points whose time falls in the range; null shows all. */
  setTime(range: TimeRange | null): void
  /** Moves the camera. `zoom` is a web-map zoom level (0 shows the whole globe); the Cesium engine converts it to a height. */
  flyTo(view: { lat: number; lon: number; zoom: number; durationMs?: number }): Promise<void>
  /** Called with the picked point on a click, or null for a click on nothing. Returns a function that stops the calls. */
  onPick(callback: (pick: Pick | null) => void): () => void
  destroy(): void
}

export type CreateEngine = (container: HTMLElement) => Promise<MapEngine>

/** A web-map zoom level as a camera height above the ellipsoid in metres, close enough for flyTo. */
export const zoomToHeight = (zoom: number) => 40_000_000 / 2 ** zoom

export const inRange = (point: MapPoint, range: TimeRange | null) => range === null || (point.time >= range.start && point.time <= range.end)
