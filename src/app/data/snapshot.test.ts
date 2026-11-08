import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import type { Adapter } from '@/data/adapters/types'
import { createMemoryStore } from '@/app/progress/storage'
import { getSnapshot } from './snapshot'

function counting() {
  let calls = 0
  const adapter: Adapter<{ n: number }, { v: number }, number> = {
    id: 'test',
    ttlSeconds: 300,
    attribution: 'Test',
    sourceUrl: ({ n }) => `https://example.org/${n}`,
    cacheKey: ({ n }) => String(n),
    fetch: async ({ n }) => {
      calls++
      return { v: n * 10 }
    },
    normalize: (raw) => raw.v,
    normalized: z.number(),
  }
  return { adapter, calls: () => calls }
}

describe('getSnapshot', () => {
  it('fetches on a miss, stores the result, and serves the hit without fetching', async () => {
    const store = createMemoryStore()
    const { adapter, calls } = counting()
    let t = 1_000_000
    const miss = await getSnapshot(store, adapter, { n: 1 }, () => t)
    expect(miss).toEqual({ fetched_at: new Date(1_000_000).toISOString(), source_url: 'https://example.org/1', data: 10 })
    expect(calls()).toBe(1)
    expect(store.getItem('strata:snapshot:test:1')).not.toBeNull()

    t += 299_000
    expect(await getSnapshot(store, adapter, { n: 1 }, () => t)).toEqual(miss)
    expect(calls()).toBe(1)
  })

  it('fetches again once the TTL has passed', async () => {
    const store = createMemoryStore()
    const { adapter, calls } = counting()
    let t = 1_000_000
    await getSnapshot(store, adapter, { n: 1 }, () => t)
    t += 300_000
    const fresh = await getSnapshot(store, adapter, { n: 1 }, () => t)
    expect(calls()).toBe(2)
    expect(fresh.fetched_at).toBe(new Date(1_300_000).toISOString())
  })

  it('keys the cache by query, and treats a stored snapshot it cannot read as a miss', async () => {
    const store = createMemoryStore()
    const { adapter, calls } = counting()
    await getSnapshot(store, adapter, { n: 1 }, () => 0)
    await getSnapshot(store, adapter, { n: 2 }, () => 0)
    expect(calls()).toBe(2)

    store.setItem('strata:snapshot:test:1', JSON.stringify({ version: 1, data: { fetched_at: new Date(0).toISOString(), source_url: 'x', data: 'not a number' } }))
    expect((await getSnapshot(store, adapter, { n: 1 }, () => 0)).data).toBe(10)
    expect(calls()).toBe(3)
    // No backup is made of public data.
    expect(store.getItem('strata:backup:snapshot:test:1')).toBeNull()
  })
})
