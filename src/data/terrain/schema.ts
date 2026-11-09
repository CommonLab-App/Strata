import { z } from 'zod'
import type { Grid } from '@/engine/topo'

export const areaSchema = z.object({
  id: z.string(),
  tile: z.object({ z: z.number(), x: z.number(), y: z.number() }),
  bounds: z.object({ west: z.number(), east: z.number(), north: z.number(), south: z.number() }),
  size: z.number().int(),
  heights: z.array(z.array(z.number())),
  url: z.string(),
})
export type Area = z.infer<typeof areaSchema>

export const AREA_IDS = ['area-1', 'area-2', 'area-3'] as const
/** The coast for week 15's sea-level task; not offered in the topo workshop. */
export const COAST_ID = 'area-4'
export type AreaId = (typeof AREA_IDS)[number] | typeof COAST_ID

const EARTH_M = 40_075_017

/** The bundled grid with its cell size worked out from the tile bounds. */
export function gridOf(area: Area): Grid {
  const midLat = ((area.bounds.north + area.bounds.south) / 2) * (Math.PI / 180)
  const widthM = ((area.bounds.east - area.bounds.west) / 360) * EARTH_M * Math.cos(midLat)
  const heightM = ((area.bounds.north - area.bounds.south) / 360) * EARTH_M
  return { size: area.size, heights: area.heights, dx: widthM / area.size, dy: heightM / area.size }
}

export async function loadArea(id: AreaId): Promise<Area> {
  const file = await import(`@data/terrain/${id}.json`)
  return areaSchema.parse(file.default)
}

export const TERRAIN_ATTRIBUTION = 'Terrain Tiles on AWS Open Data (Tilezen; USGS 3DEP, SRTM and other public sources)'
