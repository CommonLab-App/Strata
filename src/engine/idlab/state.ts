import { z } from 'zod'

/** What a week stores for its identification lab. The tray is the seed; the ids are drawn again on load. */
export const idLabStateSchema = z.object({
  seed: z.number().int(),
  // Observations differ by lab (minerals, rocks); each lab's engine knows its own shape and reads the record as it.
  records: z.array(z.object({ tests: z.array(z.string()), seen: z.record(z.string(), z.unknown()) })),
  answers: z.array(z.string().nullable()),
  checked: z.boolean(),
  /** Best correct count over the trays checked this week. */
  best: z.number().int().nullable(),
  attempts: z.number().int(),
})
export type IdLabState = z.infer<typeof idLabStateSchema>
