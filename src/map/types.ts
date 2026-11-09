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
  /** Any CSS colour for every dot; default the quake orange. */
  colour?: string
}

/** A polyline on the globe, e.g. a plate boundary or a velocity arrow. Coordinates are [lon, lat]. */
export interface MapLine {
  id: string
  coordinates: [number, number][]
  /** Any CSS colour. */
  colour: string
  /** Stroke width in CSS pixels; default 1.5. */
  width?: number
}

export interface LineLayer {
  id: string
  lines: MapLine[]
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
 * The whole of what the app asks of the globe engine (maplibre/), so that the rest of the app never imports it directly.
 * The engine owns its DOM inside the container it was given and frees everything on destroy.
 */
export interface MapEngine {
  addLayer(layer: PointLayer): void
  /** Lines are not filtered by setTime. */
  addLines(layer: LineLayer): void
  removeLayer(id: string): void
  /** Shows only the points whose time falls in the range; null shows all. */
  setTime(range: TimeRange | null): void
  /** Moves the camera. `zoom` is a web-map zoom level (0 shows the whole globe). */
  flyTo(view: { lat: number; lon: number; zoom: number; durationMs?: number }): Promise<void>
  /** Called with the picked point on a click, or null for a click on nothing. Returns a function that stops the calls. */
  onPick(callback: (pick: Pick | null) => void): () => void
  destroy(): void
}

/** Where the globe opens; default the whole globe. */
export interface MapView {
  lat: number
  lon: number
  zoom: number
}

export type CreateEngine = (container: HTMLElement, view?: MapView) => Promise<MapEngine>

export const inRange = (point: MapPoint, range: TimeRange | null) => range === null || (point.time >= range.start && point.time <= range.end)
