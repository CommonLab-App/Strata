import { z } from 'zod'
import type { Adapter } from './types.ts'

/**
 * USGS Water Services: active stream gauges in a box, and one gauge's instantaneous discharge. Open REST with CORS.
 * The legacy NWIS endpoints are used while they answer; the Water Data OGC API is the successor and this is the one
 * module to change (docs/DATA-SOURCES.md).
 */
const SITE = 'https://waterservices.usgs.gov/nwis/site/'
const IV = 'https://waterservices.usgs.gov/nwis/iv/'
export const WATER_SOURCE_PAGE = 'https://waterservices.usgs.gov/'

export interface GaugeBox {
  /** Centre of the search; the box is one degree on a side. */
  lat: number
  lon: number
}

export const gaugeSchema = z.object({ site: z.string(), name: z.string(), lat: z.number(), lon: z.number() })
export type Gauge = z.infer<typeof gaugeSchema>

const round = (v: number) => Math.round(v * 2) / 2

/** Parses USGS RDB: comment lines, a header, a format line, then tab-separated rows. */
export function parseRdb(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter((l) => l && !l.startsWith('#'))
  const header = lines[0]?.split('\t') ?? []
  return lines.slice(2).map((l) => Object.fromEntries(l.split('\t').map((v, i) => [header[i] ?? String(i), v])))
}

export const usgsGauges: Adapter<GaugeBox, string, Gauge[]> = {
  id: 'usgs-gauges',
  ttlSeconds: 86400,
  attribution: 'USGS Water Services',
  sourceUrl: ({ lat, lon }) => `${SITE}?format=rdb&bBox=${(round(lon) - 0.5).toFixed(2)},${(round(lat) - 0.5).toFixed(2)},${(round(lon) + 0.5).toFixed(2)},${(round(lat) + 0.5).toFixed(2)}&siteType=ST&parameterCd=00060&siteStatus=active&hasDataTypeCd=iv`,
  cacheKey: ({ lat, lon }) => `${round(lat)},${round(lon)}`,
  async fetch(params) {
    const response = await fetch(usgsGauges.sourceUrl(params))
    if (response.status === 404) return ''
    if (!response.ok) throw new Error(`USGS site service ${response.status} ${response.statusText}`)
    return response.text()
  },
  normalize(raw) {
    return parseRdb(raw)
      .filter((r) => r.site_no && r.dec_lat_va && r.dec_long_va)
      .map((r) => ({ site: r.site_no!, name: r.station_nm ?? r.site_no!, lat: Number(r.dec_lat_va), lon: Number(r.dec_long_va) }))
  },
  normalized: z.array(gaugeSchema),
}

export interface DischargeParams {
  site: string
}

const ivSchema = z.object({
  value: z.object({
    timeSeries: z.array(
      z.object({
        sourceInfo: z.object({ siteName: z.string(), siteCode: z.array(z.object({ value: z.string() })), geoLocation: z.object({ geogLocation: z.object({ latitude: z.number(), longitude: z.number() }) }) }),
        variable: z.object({ unit: z.object({ unitCode: z.string() }) }),
        values: z.array(z.object({ value: z.array(z.object({ value: z.string(), dateTime: z.string() })) })),
      }),
    ),
  }),
})

export const dischargeSchema = z.object({
  site: z.string(),
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  unit: z.string(),
  /** [ISO time, discharge] in the unit given, as reported (usually every 15 minutes for 30 days). */
  values: z.array(z.tuple([z.string(), z.number()])),
})
export type Discharge = z.infer<typeof dischargeSchema>

export const usgsDischarge: Adapter<DischargeParams, unknown, Discharge> = {
  id: 'usgs-discharge',
  ttlSeconds: 900,
  attribution: 'USGS Water Services, instantaneous values',
  sourceUrl: ({ site }) => `${IV}?format=json&sites=${site}&parameterCd=00060&period=P30D`,
  cacheKey: ({ site }) => site,
  async fetch(params) {
    const response = await fetch(usgsDischarge.sourceUrl(params))
    if (!response.ok) throw new Error(`USGS IV service ${response.status} ${response.statusText}`)
    return response.json()
  },
  normalize(raw) {
    const series = ivSchema.parse(raw).value.timeSeries[0]
    if (!series) throw new Error('no discharge series for this site')
    const values = series.values.flatMap((v) => v.value).map(({ value, dateTime }) => [new Date(dateTime).toISOString(), Number(value)] as [string, number]).filter(([, v]) => Number.isFinite(v) && v >= 0)
    return { site: series.sourceInfo.siteCode[0]?.value ?? '', name: series.sourceInfo.siteName, lat: series.sourceInfo.geoLocation.geogLocation.latitude, lon: series.sourceInfo.geoLocation.geogLocation.longitude, unit: series.variable.unit.unitCode, values }
  },
  normalized: dischargeSchema,
}
