import { describe, expect, it } from 'vitest'
import { usgsQuakes } from './usgs-quakes'

// The shape of the feed as documented at https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php, with made-up values.
const feed = {
  type: 'FeatureCollection',
  metadata: { generated: 1_700_000_000_000, title: 'USGS All Earthquakes, Past Hour' },
  features: [
    {
      type: 'Feature',
      id: 'test00000001',
      properties: { mag: 2.5, place: 'Test place', time: 1_700_000_000_000, url: 'https://earthquake.usgs.gov/earthquakes/eventpage/test00000001', extra: 'ignored' },
      geometry: { type: 'Point', coordinates: [-120.5, 36.25, 7.3] },
    },
    {
      type: 'Feature',
      id: 'test00000002',
      properties: { mag: null, place: null, time: 1_700_000_060_000, url: 'https://earthquake.usgs.gov/earthquakes/eventpage/test00000002' },
      geometry: { type: 'Point', coordinates: [150, -5, null] },
    },
  ],
}

describe('usgs-quakes', () => {
  it('normalizes a feed to the spec fields, keeping place as given', () => {
    expect(usgsQuakes.normalize(feed)).toEqual([
      { id: 'test00000001', time: '2023-11-14T22:13:20.000Z', lat: 36.25, lon: -120.5, depth_km: 7.3, mag: 2.5, place: 'Test place', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/test00000001' },
      { id: 'test00000002', time: '2023-11-14T22:14:20.000Z', lat: -5, lon: 150, depth_km: null, mag: null, place: null, url: 'https://earthquake.usgs.gov/earthquakes/eventpage/test00000002' },
    ])
    expect(usgsQuakes.normalized.safeParse(usgsQuakes.normalize(feed)).success).toBe(true)
  })

  it('refuses a feed that is not the documented shape', () => {
    expect(() => usgsQuakes.normalize({ features: [{ id: 1 }] })).toThrow()
    expect(() => usgsQuakes.normalize(null)).toThrow()
  })

  it('names the four summary feeds and caches each separately', () => {
    expect(usgsQuakes.sourceUrl({ range: 'day' })).toBe('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
    expect(usgsQuakes.cacheKey({ range: 'month' })).toBe('month')
    expect(usgsQuakes.ttlSeconds).toBe(300)
  })
})
