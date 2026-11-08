# Phase 1 spec — Shell and data layer

Goal: a learner opens Strata, sees today's earthquakes on a globe, reads the week-1 Learn pane, and finishes the week-1 self-check. Everything later plugs into what this phase builds.

## Deliverables

1. Repo scaffold copied from Valence's structure (same framework, lint, test, build, hash router, base path config).
2. Storage module `src/app/progress/storage.ts` copied from Valence, extended with namespaced keys for `module_progress`, `worksheets`, `self_check_best`, and `data_snapshots`. All localStorage, all versioned, all survive reload.
3. (removed: no auth, no accounts.)
4. Data adapter interface in `src/data/adapters/types.ts`:
   - `id: string` (e.g. `usgs-quakes`)
   - `fetch(params): Promise<Raw>`
   - `normalize(raw): Normalized`
   - `cacheKey(params): string`
   - `ttlSeconds: number`
   - `sourceUrl(params): string` and `attribution: string` (shown in UI)
   - A generic `getSnapshot(adapter, params)` that returns the cached `data_snapshots` entry from localStorage if fresh, else fetches, normalizes, stores, returns. Every returned object carries `fetched_at` and `source_url`.
5. First adapter: `usgs-quakes` against the USGS GeoJSON summary feeds (all quakes, past hour / day / 7 days / 30 days). TTL 300 s. Normalized fields: id, time, lat, lon, depth_km, mag, place (as given by source, not rewritten), url.
6. Globe/map engine wrapper `src/map/` with a tiny API: `addLayer`, `removeLayer`, `setTime`, `flyTo`, `onPick`. Build the same quake layer twice, once on CesiumJS and once on MapLibre GL (globe projection). Measure bundle size, first paint on a throttled mobile profile, and frame rate with 10,000 points. Write the comparison and a recommendation to `docs/DECISIONS.md`; stop and ask before deleting the loser.
7. Module shell component: Learn / Explore / Lab tabs, progress chip, "data as of {fetched_at}, source: {attribution}" footer on any live layer.
8. Week 1 content:
   - Learn: short page on Earth as a system and how geologists reason, with links out (no copied textbook text).
   - Explore: the globe with the quake layer, time range toggle, click a quake for its fields and a source link, one-line neutral caption.
   - Lab: "scientific method with a sand-and-water model" as a guided observation form (hypothesis, variable, prediction, observation, conclusion) saved to `worksheets`.
   - Self-check: 10 multiple-choice questions in `data/self-checks/week-01.json`, auto-graded, retry allowed, best score stored.
9. Home page with a 16-step progress track (weeks 17-18 shown as optional).
10. About page with license, data attributions, and AI-assistance credit.

## Acceptance tests

- `npm test` passes; includes unit tests for `usgs-quakes.normalize`, `getSnapshot` cache hit/miss, and self-check grading.
- Fresh browser profile + `npm run dev`: see quakes from the past day, open one, finish the week-1 lab and self-check, reload and see progress persisted.
- Lighthouse mobile performance >= 80 on the Explore page with the chosen engine.
- `grep -ri` for any institution name, course code, or campus string returns nothing.

## Out of scope for phase 1

Minerals, rocks, any other adapter, offline mode, production hosting.
