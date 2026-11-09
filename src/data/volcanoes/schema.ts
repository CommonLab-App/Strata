import { z } from 'zod'

/** One dated eruption from the GVP table: [start year, VEI max or null, confirmed]. */
export const eruptionSchema = z.tuple([z.number().int(), z.number().int().min(0).max(8).nullable(), z.boolean()])

export const volcanoSchema = z.object({
  number: z.number().int(),
  name: z.string(),
  type: z.string().nullable(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  elevation: z.number().nullable(),
  setting: z.string().nullable(),
  /** GVP's major rock type, e.g. "Rhyolite"; null where the GVP has no data. */
  rock: z.string().nullable(),
  lastEruption: z.number().int().nullable(),
  eruptions: z.array(eruptionSchema),
})
export const volcanoesSchema = z.array(volcanoSchema)
export type Volcano = z.infer<typeof volcanoSchema>

/** The GVP page for a volcano, by its number. */
export const gvpUrl = (number: number) => `https://volcano.si.edu/volcano.cfm?vn=${number}`

/** The largest VEI in a volcano's dated, confirmed eruptions, or null. */
export const largestVei = (v: Volcano) => v.eruptions.reduce<number | null>((max, [, vei, confirmed]) => (confirmed && vei !== null && (max === null || vei > max) ? vei : max), null)
