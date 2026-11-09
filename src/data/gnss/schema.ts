import { z } from 'zod'

/** One GNSS station's velocity as bundled from a GAGE .vel release: mm/yr, uncertainties as one standard deviation. */
export const stationVelocitySchema = z.object({
  station: z.string().length(4),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  vn: z.number(),
  ve: z.number(),
  vu: z.number(),
  sn: z.number().min(0),
  se: z.number().min(0),
  su: z.number().min(0),
  /** First and last observation years of the segment the velocity came from. */
  from: z.string().length(4),
  to: z.string().length(4),
})

export const velocityFieldSchema = z.object({
  frame: z.string(),
  /** Reference epoch, YYYYMMDD. */
  epoch: z.string().length(8),
  stations: z.array(stationVelocitySchema),
})

export type StationVelocity = z.infer<typeof stationVelocitySchema>
export type VelocityField = z.infer<typeof velocityFieldSchema>
