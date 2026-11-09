import { z } from 'zod'

/** One bundled teaching earthquake: the USGS catalogue entry and three stations' 1 Hz vertical records. */
export const stationRecordSchema = z.object({
  net: z.string(),
  sta: z.string(),
  loc: z.string(),
  lat: z.number(),
  lon: z.number(),
  /** Catalogue epicentre to station, km. */
  km: z.number(),
  azimuth: z.number(),
  /** ISO time of the first sample. */
  start: z.string(),
  hz: z.literal(1),
  /** Scaled to the largest value in the window, so each trace fills its strip. */
  samples: z.array(z.number()),
  /** Reference picks, seconds from the first sample. */
  refP: z.number(),
  refS: z.number(),
  request: z.string(),
})
export const teachingEventSchema = z.object({
  event: z.object({ id: z.string(), time: z.string(), lat: z.number(), lon: z.number(), depthKm: z.number(), mag: z.number(), place: z.string().nullable(), url: z.string() }),
  stations: z.array(stationRecordSchema).length(3),
})
export type StationRecord = z.infer<typeof stationRecordSchema>
export type TeachingEvent = z.infer<typeof teachingEventSchema>

export const EVENT_IDS = ['us7000pcdl', 'us6000m0xl', 'us6000jlqa', 'us7000m9g4'] as const
export type EventId = (typeof EVENT_IDS)[number]

/** Loaded with the pane, one small file per event. */
export async function loadEvent(id: EventId): Promise<TeachingEvent> {
  const file = await import(`@data/seismograms/${id}.json`)
  return teachingEventSchema.parse(file.default)
}
