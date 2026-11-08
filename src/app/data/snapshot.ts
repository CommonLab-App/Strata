import { z } from 'zod'
import type { Adapter, Snapshot } from '../../data/adapters/types.ts'
import { readEntry, saveEntry, snapshotEntry, storageKey, type KeyValueStore } from '../progress/storage.ts'

export const SNAPSHOT_VERSION = 1

/**
 * The cached snapshot for this adapter and query if it is younger than the adapter's TTL; otherwise fetches,
 * normalizes, stores and returns a fresh one. A stored snapshot that cannot be read is simply fetched over, not
 * backed up: it is a copy of public data, not the learner's work. `now` is injectable for tests.
 *
 * ponytail: localStorage holds about 5 MB. A refused save still returns the fresh snapshot, so the app works;
 * move snapshots to IndexedDB if the 30-day quake feed turns out to refuse regularly.
 */
export async function getSnapshot<P, R, N>(store: KeyValueStore, adapter: Adapter<P, R, N>, params: P, now: () => number = Date.now): Promise<Snapshot<N>> {
  const entry = snapshotEntry(adapter.id, adapter.cacheKey(params))
  const raw = store.getItem(storageKey(entry))
  const schema = z.object({ fetched_at: z.string(), source_url: z.string(), data: adapter.normalized }) as z.ZodType<Snapshot<N>>
  const cached = raw === null ? undefined : readEntry(raw, SNAPSHOT_VERSION, schema)
  if (cached && now() - Date.parse(cached.fetched_at) < adapter.ttlSeconds * 1000) return cached

  const fetched_at = new Date(now()).toISOString()
  const data = adapter.normalize(await adapter.fetch(params))
  const snapshot: Snapshot<N> = { fetched_at, source_url: adapter.sourceUrl(params), data }
  saveEntry(store, entry, SNAPSHOT_VERSION, snapshot)
  return snapshot
}
