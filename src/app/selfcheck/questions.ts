import { z } from 'zod'

export const questionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).length(4),
  /** Index into options. */
  answer: z.number().int().min(0).max(3),
  explanation: z.string(),
})
export const questionsSchema = z.array(questionSchema).length(10)
export type Question = z.infer<typeof questionSchema>
