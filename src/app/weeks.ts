import { peekStatus, weekEntry, type ActivityStatus, type KeyValueStore } from './progress/storage'

/**
 * The topics in order, as Home's progress track and the router list them. Shown to the learner as topics under
 * /topic/<slug>; named weeks here, in the folders and in the storage key (`week:08`) because the plan and the
 * saved progress were laid out that way first. ponytail: renaming the internals would touch sixty files and orphan
 * saved progress for no learner-visible gain. `version` is the version of the week's stored
 * entry: the week's pages load and save with it, and Home reads status with it (weekStatus). A week whose page
 * is not built yet (hasPage) is shown on the track with no link.
 */
export const WEEKS = [
  { week: 1, slug: 'earth-system', title: 'Earth as a system', version: 1 },
  { week: 2, slug: 'minerals-crystal-structure', title: 'Minerals: atoms, bonds, crystal structure', version: 2 },
  { week: 3, slug: 'silicate-minerals', title: 'Minerals: silicate families', version: 2 },
  { week: 4, slug: 'igneous-rocks', title: 'Igneous rocks and magma', version: 2 },
  { week: 5, slug: 'volcanoes', title: 'Volcanoes and volcanic hazards', version: 1 },
  { week: 6, slug: 'sedimentary-rocks', title: 'Weathering, soils, sedimentary rocks', version: 2 },
  { week: 7, slug: 'metamorphic-rocks', title: 'Metamorphic rocks; the rock cycle', version: 2 },
  { week: 8, slug: 'plate-tectonics', title: 'Plate tectonics', version: 1 },
  { week: 9, slug: 'earthquakes', title: "Earthquakes and Earth's interior", version: 1 },
  { week: 10, slug: 'relative-dating', title: 'Deep time: relative dating', version: 1 },
  { week: 11, slug: 'absolute-dating', title: 'Absolute dating and the time scale', version: 1 },
  { week: 12, slug: 'maps', title: 'Topographic and geologic maps', version: 1 },
  { week: 13, slug: 'streams-and-floods', title: 'Streams and floods', version: 1 },
  { week: 14, slug: 'groundwater', title: 'Groundwater and karst', version: 1 },
  { week: 15, slug: 'glaciers-deserts-coasts', title: 'Glaciers, deserts, coasts', version: 1 },
  { week: 16, slug: 'mass-wasting-resources-climate', title: 'Mass wasting, resources, climate', version: 1 },
  { week: 17, slug: 'structural-geology', title: 'Mountain building and structural geology', version: 1, optional: true },
  { week: 18, slug: 'planetary-geology', title: 'Planetary geology and synthesis', version: 1, optional: true },
] as const

export type Week = (typeof WEEKS)[number]

/** The weeks whose page is a plan outline, not built content (src/app/weeks/scaffold.tsx). Home shows them as drafts. */
export const DRAFT: readonly number[] = []
export const isDraft = (week: Week) => DRAFT.includes(week.week)
/** Every week has a page: built content or its scaffold. */
export const hasPage = (week: Week) => WEEKS.includes(week)

export const weekPath = (week: number) => `/topic/${WEEKS.find((w) => w.week === week)?.slug}`
export const weekBySlug = (slug: string | undefined) => WEEKS.find((w) => w.slug === slug)

/** A week's status as Home shows it, read with the version the week's pages load with. */
export function weekStatus(store: KeyValueStore, week: Week): ActivityStatus {
  return peekStatus(store, weekEntry(week.week), week.version)
}
