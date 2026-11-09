import { z } from 'zod'
import type { Crater } from '@/engine/craters'

/** The bundled lunar crater catalogue subset: [lat, lon, diameter km] for craters at or above the index's threshold. */
export const catalogueSchema = z.object({
  source: z.string(),
  url: z.string(),
  licence: z.string(),
  fetched: z.string(),
  minDiameterKm: z.number(),
  craters: z.array(z.tuple([z.number(), z.number(), z.number()])),
})
export type Catalogue = z.infer<typeof catalogueSchema>

export async function loadMoonCraters(): Promise<{ catalogue: Catalogue; craters: Crater[] }> {
  const file = await import('@data/craters/moon.json')
  const catalogue = catalogueSchema.parse(file.default)
  return { catalogue, craters: catalogue.craters.map(([lat, lon, diameter]) => ({ lat, lon, diameter })) }
}
