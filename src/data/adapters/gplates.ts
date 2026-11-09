import { z } from 'zod'
import type { Adapter } from './types.ts'

/** The GPlates Web Service, open HTTP GET with CORS. Model and age in Ma are the whole query. */
const GWS = 'https://gws.gplates.org'
export const GPLATES_MODEL = 'MULLER2019'
/** Oldest age the default model reconstructs. */
export const GPLATES_MAX_MA = 250

const round2 = (v: number) => Math.round(v * 100) / 100

export interface ReconstructPointsParams {
  /** [lon, lat] pairs, present-day positions. */
  points: [number, number][]
  ageMa: number
}
const multiPointSchema = z.object({ type: z.literal('MultiPoint'), coordinates: z.array(z.tuple([z.number(), z.number()])) })
export const reconstructedPointsSchema = z.array(z.tuple([z.number(), z.number()]))

export const gplatesPoints: Adapter<ReconstructPointsParams, unknown, [number, number][]> = {
  id: 'gplates-points',
  ttlSeconds: 30 * 86400,
  attribution: 'GPlates Web Service (EarthByte), model MULLER2019',
  sourceUrl: ({ points, ageMa }) => `${GWS}/reconstruct/reconstruct_points/?points=${points.map((p) => p.join(',')).join(',')}&time=${ageMa}&model=${GPLATES_MODEL}`,
  cacheKey: ({ points, ageMa }) => `${ageMa}:${points.map((p) => p.map(round2).join(',')).join(';')}`,
  async fetch(params) {
    const response = await fetch(gplatesPoints.sourceUrl(params))
    if (!response.ok) throw new Error(`GPlates ${response.status} ${response.statusText}`)
    return response.json()
  },
  normalize(raw) {
    return multiPointSchema.parse(raw).coordinates.map(([lon, lat]) => [round2(lon), round2(lat)])
  },
  normalized: reconstructedPointsSchema,
}

export interface PlatePolygonsParams {
  ageMa: number
}
const polygonSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.union([
    z.object({ type: z.literal('Polygon'), coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))) }),
    z.object({ type: z.literal('MultiPolygon'), coordinates: z.array(z.array(z.array(z.tuple([z.number(), z.number()])))) }),
  ]),
})
const collectionSchema = z.object({ features: z.array(polygonSchema) })
/** Plate outlines at an age: one ring per entry, [lon, lat] pairs to 0.01°. */
export const plateOutlinesSchema = z.array(z.array(z.tuple([z.number(), z.number()])))

export const gplatesPlates: Adapter<PlatePolygonsParams, unknown, [number, number][][]> = {
  id: 'gplates-plates',
  ttlSeconds: 30 * 86400,
  attribution: 'GPlates Web Service (EarthByte), model MULLER2019',
  sourceUrl: ({ ageMa }) => `${GWS}/topology/plate_polygons/?time=${ageMa}&model=${GPLATES_MODEL}`,
  cacheKey: ({ ageMa }) => String(ageMa),
  async fetch(params) {
    const response = await fetch(gplatesPlates.sourceUrl(params))
    if (!response.ok) throw new Error(`GPlates ${response.status} ${response.statusText}`)
    return response.json()
  },
  normalize(raw) {
    const rings: [number, number][][] = []
    for (const f of collectionSchema.parse(raw).features) {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
      for (const poly of polys) for (const ring of poly) rings.push(ring.map(([lon, lat]) => [round2(lon), round2(lat)]))
    }
    return rings
  },
  normalized: plateOutlinesSchema,
}
