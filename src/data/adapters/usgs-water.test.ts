import { describe, expect, it } from 'vitest'
import { parseRdb, usgsDischarge, usgsGauges, usgsWells } from './usgs-water'

const rdb = `# comment\nagency_cd\tsite_no\tstation_nm\tdec_lat_va\tdec_long_va\n5s\t15s\t50s\t16s\t16s\nUSGS\t01234567\tSOME RIVER\t39.1\t-77.0\nUSGS\t07654321\tOTHER CREEK\t39.2\t-77.1\n`

describe('usgs-water adapters', () => {
  it('parses RDB and normalizes gauges', () => {
    expect(parseRdb(rdb)).toHaveLength(2)
    expect(usgsGauges.normalize(rdb)).toEqual([
      { site: '01234567', name: 'SOME RIVER', lat: 39.1, lon: -77.0 },
      { site: '07654321', name: 'OTHER CREEK', lat: 39.2, lon: -77.1 },
    ])
    expect(usgsGauges.cacheKey({ lat: 39.13, lon: -77.08 })).toBe('39,-77')
    expect(usgsWells.sourceUrl({ lat: 39, lon: -77 })).toContain('siteType=GW&parameterCd=72019')
  })
  it('normalizes an instantaneous-values response', () => {
    const raw = {
      value: {
        timeSeries: [
          {
            sourceInfo: { siteName: 'SOME RIVER', siteCode: [{ value: '01234567' }], geoLocation: { geogLocation: { latitude: 39.1, longitude: -77 } } },
            variable: { unit: { unitCode: 'ft3/s' } },
            values: [{ value: [{ value: '100', dateTime: '2026-11-01T00:00:00.000-05:00' }, { value: '-999999', dateTime: '2026-11-01T00:15:00.000-05:00' }, { value: '120', dateTime: '2026-11-01T00:30:00.000-05:00' }] }],
          },
        ],
      },
    }
    const d = usgsDischarge.normalize(raw)
    expect(d.site).toBe('01234567')
    expect(d.values).toEqual([['2026-11-01T05:00:00.000Z', 100], ['2026-11-01T05:30:00.000Z', 120]])
  })
})
