import type { z } from 'zod'

/**
 * One external data source. `fetch` is the only place in the app that may reach the network (eslint.config.js);
 * everything else reads the source through getSnapshot, which caches what `normalize` returns for `ttlSeconds`.
 * A lab checker recomputes its answer from the same snapshot the learner saw, so `normalize` must be a pure
 * function of `raw`, and `normalized` must accept everything it returns.
 */
export interface Adapter<Params, Raw, Normalized> {
  /** Stable, e.g. `usgs-quakes`. Part of every cache key. */
  id: string
  ttlSeconds: number
  /** Shown in the UI under any layer drawn from this source. */
  attribution: string
  /** The address a learner may follow to see the source's own view of this query. */
  sourceUrl(params: Params): string
  /** The part of the cache key that varies with the query. */
  cacheKey(params: Params): string
  fetch(params: Params): Promise<Raw>
  normalize(raw: Raw): Normalized
  /** What a stored snapshot's data must satisfy to be served from the cache. */
  normalized: z.ZodType<Normalized>
}

/** What getSnapshot returns and stores: the normalized data, when it was fetched, and where from. */
export interface Snapshot<Normalized> {
  fetched_at: string
  source_url: string
  data: Normalized
}
