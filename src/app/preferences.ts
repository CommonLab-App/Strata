// StrataLab's preferences: the shared shell's dark mode and reduced motion, and none of its own.
// With its extensions, here and in firstPaint.ts: vite.config.ts imports this file, and Vite asks that of what its config imports.
import { createPreferences, type CorePrefs } from '@commonlab/shell/core'
import { storage } from './progress/storage.ts'

export { PREFS_VERSION, resolveTri, type Tri } from '@commonlab/shell/core'

export const prefs = createPreferences(storage)

export const { PREF_VALUES, DEFAULT_PREFS, loadPrefs, savePrefs } = prefs

export type Prefs = CorePrefs
