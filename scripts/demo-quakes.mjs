// Relative .ts imports in snapshot.ts and the adapters, so Node can run this without a bundler.
// Fetches the past hour's quakes through getSnapshot twice: once on an empty store (a miss) and once more (a hit).
//   node scripts/demo-quakes.mjs
import { getSnapshot } from '../src/app/data/snapshot.ts'
import { createMemoryStore } from '../src/app/progress/storage.ts'
import { usgsQuakes } from '../src/data/adapters/usgs-quakes.ts'

const store = createMemoryStore()
const realFetch = usgsQuakes.fetch
let calls = 0
usgsQuakes.fetch = (params) => (calls++, realFetch(params))

for (const label of ['miss', 'hit']) {
  const t0 = performance.now()
  const snap = await getSnapshot(store, usgsQuakes, { range: 'hour' })
  console.log(`${label}: ${snap.data.length} quakes, fetched_at ${snap.fetched_at}, network calls so far ${calls}, ${(performance.now() - t0).toFixed(0)} ms`)
  if (label === 'miss') console.log('  first:', snap.data[0])
}
console.log(`stored under ${store.key(0)}, ${(store.getItem(store.key(0)).length / 1024).toFixed(0)} kB`)
