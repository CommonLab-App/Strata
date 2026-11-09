import { peekStatus, weekEntry, type ActivityStatus, type KeyValueStore } from './progress/storage'

/**
 * The semester, as Home's progress track and the router list it. `version` is the version of the week's stored
 * entry: the week's pages load and save with it, and Home reads status with it (weekStatus). A week whose page
 * is not built yet (hasPage) is shown on the track with no link.
 */
export const WEEKS = [
  { week: 1, title: 'Earth as a system', version: 1 },
  { week: 2, title: 'Minerals: atoms, bonds, crystal structure', version: 1 },
  { week: 3, title: 'Minerals: silicate families', version: 1 },
  { week: 4, title: 'Igneous rocks and magma', version: 1 },
  { week: 5, title: 'Volcanoes and volcanic hazards', version: 1 },
  { week: 6, title: 'Weathering, soils, sedimentary rocks', version: 1 },
  { week: 7, title: 'Metamorphic rocks; the rock cycle', version: 1 },
  { week: 8, title: 'Plate tectonics', version: 1 },
  { week: 9, title: "Earthquakes and Earth's interior", version: 1 },
  { week: 10, title: 'Deep time: relative dating', version: 1 },
  { week: 11, title: 'Absolute dating and the time scale', version: 1 },
  { week: 12, title: 'Topographic and geologic maps', version: 1 },
  { week: 13, title: 'Streams and floods', version: 1 },
  { week: 14, title: 'Groundwater and karst', version: 1 },
  { week: 15, title: 'Glaciers, deserts, coasts', version: 1 },
  { week: 16, title: 'Mass wasting, resources, climate', version: 1 },
  { week: 17, title: 'Mountain building and structural geology', version: 1, optional: true },
  { week: 18, title: 'Planetary geology and synthesis', version: 1, optional: true },
] as const

export type Week = (typeof WEEKS)[number]

/** The weeks whose page is a plan outline, not built content (src/app/weeks/scaffold.tsx). Home shows them as drafts. */
export const DRAFT: readonly number[] = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
export const isDraft = (week: Week) => DRAFT.includes(week.week)
/** Every week has a page: built content or its scaffold. */
export const hasPage = (week: Week) => WEEKS.includes(week)

export const weekPath = (week: number) => `/week/${week}`

/** A week's status as Home shows it, read with the version the week's pages load with. */
export function weekStatus(store: KeyValueStore, week: Week): ActivityStatus {
  return peekStatus(store, weekEntry(week.week), week.version)
}
