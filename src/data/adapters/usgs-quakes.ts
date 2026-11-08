import { z } from 'zod'
import type { Adapter } from './types.ts'

export const QUAKE_RANGES = ['hour', 'day', 'week', 'month'] as const
export type QuakeRange = (typeof QUAKE_RANGES)[number]
export interface QuakeParams {
  range: QuakeRange
}

const FEED = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary'

/** The fields of the USGS GeoJSON summary feed that the app reads. Anything else in a feature is ignored. */
const featureSchema = z.object({
  id: z.string(),
  properties: z.object({
    time: z.number(),
    mag: z.number().nullable(),
    place: z.string().nullable(),
    url: z.string(),
  }),
  geometry: z.object({ coordinates: z.tuple([z.number(), z.number(), z.number().nullable()]).rest(z.unknown()) }),
})
const feedSchema = z.object({ features: z.array(featureSchema) })
export type QuakeFeed = z.infer<typeof feedSchema>

export const quakeSchema = z.object({
  id: z.string(),
  /** ISO 8601, UTC. */
  time: z.string(),
  lat: z.number(),
  lon: z.number(),
  depth_km: z.number().nullable(),
  mag: z.number().nullable(),
  /** As the source gives it; never rewritten. */
  place: z.string().nullable(),
  url: z.string(),
})
export type Quake = z.infer<typeof quakeSchema>

export const usgsQuakes: Adapter<QuakeParams, unknown, Quake[]> = {
  id: 'usgs-quakes',
  ttlSeconds: 300,
  attribution: 'USGS Earthquake Hazards Program',
  sourceUrl: ({ range }) => `${FEED}/all_${range}.geojson`,
  cacheKey: ({ range }) => range,
  async fetch(params) {
    const response = await fetch(usgsQuakes.sourceUrl(params))
    if (!response.ok) throw new Error(`USGS feed ${response.status} ${response.statusText}`)
    return response.json()
  },
  normalize(raw) {
    return feedSchema.parse(raw).features.map(({ id, properties, geometry }) => {
      const [lon, lat, depth_km] = geometry.coordinates
      return { id, time: new Date(properties.time).toISOString(), lat, lon, depth_km, mag: properties.mag, place: properties.place, url: properties.url }
    })
  },
  normalized: z.array(quakeSchema),
}
