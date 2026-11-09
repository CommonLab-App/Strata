# Phase 6 spec — Polish

Goal: the app works on a phone with no signal once it has been opened once, and installs to the home screen. Weeks
17 and 18 and the About credits were done with the week builds; the accessibility pass and launch are written up
here when their turn comes.

Gate: airplane mode after one visit still opens Home, every week's Learn, the mineral and rock inspectors, and the
labs over the last cached snapshots; Lighthouse "installable" passes.

## Offline mode

1. **Service worker** generated at build time by a Vite plugin in `vite.config.ts` from `src/sw/worker.js`: the
   bundle's hashed assets, `index.html` and the fonts are precached at install under a cache named by a hash of that
   list, so a new deploy installs a new cache and drops the old one. Same-origin requests are served cache first;
   a navigation is served network first and falls back to the cached shell. Sample media (`media/samples/`) is
   cached as it is watched, full responses only. Cross-origin requests (data APIs, basemap, planet tiles) are not
   touched: the adapters' localStorage snapshots are the offline copy of data, as phase 1 decided.
2. **Registration** in `src/main.tsx`, production builds only, at `BASE_URL + 'sw.js'`.
3. **Web app manifest** `public/manifest.webmanifest` with the maskable icons already in `public/`, linked from
   `index.html` with a theme colour.

## Acceptance tests

- `npm test`: the plugin's output lists `./`, every bundle asset and every font, and the worker source has no module
  syntax (a service worker is a classic script).
- `npm run smoke` passes with the worker registered (no console errors).
- Owner, on a phone: open the deployed app, open a week, switch to airplane mode, reload, the week opens.

## Out of scope

Background sync, push, caching cross-origin data in the worker (the snapshots do that), caching ranged media
responses (a video seek on a cold cache streams from the network).
