// StrataLab's saved data, made by the shared shell (@commonlab/shell) under the `strata:` prefix. What is stored,
// and how, is the shell's; the entries StrataLab saves are listed here.
import { createStorage, PREFS_ENTRY } from '@commonlab/shell/core'

export { createMemoryStore, readEntry, sessionStore, type ActivityStatus, type KeyValueStore, type SessionStore } from '@commonlab/shell/core'

export const ENTRY = {
  prefs: PREFS_ENTRY,
} as const

/** The entry a week's progress, worksheet and best self-check score are stored under, e.g. `week:01`. */
export const weekEntry = (week: number) => `week:${String(week).padStart(2, '0')}`

/** The entry a cached data snapshot is stored under: the adapter's id and its cache key for the query. */
export const snapshotEntry = (adapterId: string, cacheKey: string) => `snapshot:${adapterId}:${cacheKey}`

export const storage = createStorage({ prefix: 'strata:', name: 'StrataLab' })

export const { storageKey, browserStore, saveEntry, loadEntry, peekStatus, wasSetAside, exportAll, clearAll, NOT_SAVING_TEXT } = storage
