import { useState } from 'react'
import { z } from 'zod'
import { useAppState } from '@/app/AppState'
import { loadEntry, saveEntry, weekEntry, type KeyValueStore } from '@/app/progress/storage'
import { idLabStateSchema } from '@/engine/idlab/state'
import type { Week } from '@/app/weeks'

export const WORKSHEET_FIELDS = ['hypothesis', 'variable', 'prediction', 'observation', 'conclusion'] as const
export type WorksheetField = (typeof WORKSHEET_FIELDS)[number]

const worksheetSchema = z.object({
  hypothesis: z.string(),
  variable: z.string(),
  prediction: z.string(),
  observation: z.string(),
  conclusion: z.string(),
})

/** Everything a week stores, in one entry: the lab worksheet, whether the lab was finished, and the self-check record. */
export const weekProgressSchema = z.object({
  // Home reads this field alone (peekStatus); withStatus keeps it in step with the rest.
  status: z.enum(['not-started', 'in-progress', 'completed']),
  worksheet: worksheetSchema,
  labDone: z.boolean(),
  /** Weeks with an identification lab keep its tray here; week 1's guided form uses `worksheet` and `labDone`. */
  lab: idLabStateSchema.optional(),
  selfCheckBest: z.number().int().nullable(),
  selfCheckAttempts: z.number().int(),
})
export type WeekProgress = z.infer<typeof weekProgressSchema>
export type Worksheet = z.infer<typeof worksheetSchema>

export const EMPTY_PROGRESS: WeekProgress = {
  status: 'not-started',
  worksheet: { hypothesis: '', variable: '', prediction: '', observation: '', conclusion: '' },
  labDone: false,
  selfCheckBest: null,
  selfCheckAttempts: 0,
}

export const worksheetComplete = (worksheet: Worksheet) => WORKSHEET_FIELDS.every((field) => worksheet[field].trim() !== '')

/** The record with its status worked out: completed once the lab is finished and the self-check taken; in progress once anything is written. */
export function withStatus(progress: Omit<WeekProgress, 'status'>): WeekProgress {
  const labFinished = progress.labDone || progress.lab?.checked === true
  const begun = labFinished || progress.lab !== undefined || progress.selfCheckAttempts > 0 || WORKSHEET_FIELDS.some((field) => progress.worksheet[field] !== '')
  const status = labFinished && progress.selfCheckBest !== null ? 'completed' : begun ? 'in-progress' : 'not-started'
  return { ...progress, status }
}

export const loadWeek = (store: KeyValueStore, week: Week) => loadEntry(store, weekEntry(week.week), week.version, weekProgressSchema) ?? EMPTY_PROGRESS
export const saveWeek = (store: KeyValueStore, week: Week, progress: WeekProgress) => saveEntry(store, weekEntry(week.week), week.version, progress)

/** A week's stored progress, loaded once, and a function that patches, re-derives the status and saves. Call it from handlers, never from effects. */
export function useWeekProgress(week: Week): [WeekProgress, (patch: Partial<Omit<WeekProgress, 'status'>>) => void] {
  const { store } = useAppState()
  const [progress, setProgress] = useState(() => loadWeek(store, week))
  const update = (patch: Partial<Omit<WeekProgress, 'status'>>) => {
    const next = withStatus({ ...progress, ...patch })
    setProgress(next)
    saveWeek(store, week, next)
  }
  return [progress, update]
}
