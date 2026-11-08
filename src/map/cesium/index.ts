import {
  Cartesian3,
  Color,
  ImageryLayer,
  OpenStreetMapImageryProvider,
  PointPrimitiveCollection,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
  type PointPrimitive,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { inRange, zoomToHeight, type CreateEngine, type MapEngine, type Pick, type PointLayer, type TimeRange } from '../types'

// The static assets Cesium loads at runtime (workers, glyphs, widget images) are copied to public/cesium/ on
// install (package.json "prepare"); vite.config.ts defines CESIUM_BASE_URL to point there.

export const createEngine: CreateEngine = async (container) => {
  const viewer = new Viewer(container, {
    baseLayer: new ImageryLayer(new OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' })),
    baseLayerPicker: false,
    geocoder: false,
    timeline: false,
    animation: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    homeButton: false,
    infoBox: false,
    selectionIndicator: false,
    fullscreenButton: false,
  })
  const scene = viewer.scene
  const layers = new Map<string, { collection: PointPrimitiveCollection; layer: PointLayer }>()
  let range: TimeRange | null = null
  const picks = new Set<(pick: Pick | null) => void>()

  const handler = new ScreenSpaceEventHandler(scene.canvas)
  handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
    const picked = scene.pick(event.position) as { id?: Pick } | undefined
    const pick = picked?.id && typeof picked.id === 'object' && 'layerId' in picked.id ? picked.id : null
    for (const callback of picks) callback(pick)
  }, ScreenSpaceEventType.LEFT_CLICK)

  const engine: MapEngine = {
    addLayer(layer) {
      engine.removeLayer(layer.id)
      const collection = scene.primitives.add(new PointPrimitiveCollection()) as PointPrimitiveCollection
      for (const point of layer.points) {
        collection.add({
          position: Cartesian3.fromDegrees(point.lon, point.lat),
          pixelSize: point.size,
          color: Color.ORANGERED.withAlpha(0.85),
          outlineColor: Color.WHITE.withAlpha(0.6),
          outlineWidth: 1,
          show: inRange(point, range),
          id: { layerId: layer.id, pointId: point.id } satisfies Pick,
        })
      }
      layers.set(layer.id, { collection, layer })
    },
    removeLayer(id) {
      const entry = layers.get(id)
      if (!entry) return
      scene.primitives.remove(entry.collection)
      layers.delete(id)
    },
    setTime(next) {
      range = next
      for (const { collection, layer } of layers.values()) {
        for (let i = 0; i < collection.length; i++) {
          const point = layer.points[i]
          if (point) (collection.get(i) as PointPrimitive).show = inRange(point, range)
        }
      }
    },
    flyTo({ lat, lon, zoom, durationMs = 1500 }) {
      return new Promise((resolve) => {
        scene.camera.flyTo({ destination: Cartesian3.fromDegrees(lon, lat, zoomToHeight(zoom)), duration: durationMs / 1000, complete: resolve, cancel: resolve })
      })
    },
    onPick(callback) {
      picks.add(callback)
      return () => picks.delete(callback)
    },
    destroy() {
      handler.destroy()
      viewer.destroy()
    },
  }
  return engine
}
