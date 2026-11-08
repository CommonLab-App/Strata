import { z } from 'zod'

/** What a week stores for its identification lab. The tray is the seed; the ids are drawn again on load. */
const observationsSchema = z.object({
  colour: z.array(z.string()).optional(),
  luster: z.array(z.string()).optional(),
  feel: z.string().optional(),
  streak: z.string().optional(),
  hardnessMin: z.number().optional(),
  hardnessMax: z.number().optional(),
  cleavageDirections: z.number().optional(),
  cleavageQuality: z.string().optional(),
  acid: z.enum(['fizzes', 'fizzes-powdered', 'none']).optional(),
  magnetic: z.boolean().optional(),
  density: z.number().optional(),
})

export const idLabStateSchema = z.object({
  seed: z.number().int(),
  records: z.array(z.object({ tests: z.array(z.string()), seen: observationsSchema })),
  answers: z.array(z.string().nullable()),
  checked: z.boolean(),
  /** Best correct count over the trays checked this week. */
  best: z.number().int().nullable(),
  attempts: z.number().int(),
})
export type IdLabState = z.infer<typeof idLabStateSchema>
