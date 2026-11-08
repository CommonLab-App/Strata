# Decisions

Dated records of choices that are not obvious from the code.

## 2026-11-07 No backend

Progress, worksheets, self-check scores and cached data snapshots live in localStorage, as in Valence. No accounts, no database, no server job. The build is fully static.

## 2026-11-08 Globe engine: CesiumJS vs MapLibre GL (decision pending)

Both candidates implement the same five-call wrapper in `src/map/types.ts` and draw the same layer: the past day's
USGS quakes plus 10,000 synthetic points. Bench page: `/#/bench/cesium` and `/#/bench/maplibre`, `?points=10000`
to add the scatter and fly the camera. Measured by `npm run bench` against the production build.

### Numbers

| Measure | MapLibre GL 6.17 | CesiumJS 1.147 |
| --- | --- | --- |
| Engine chunk, minified | 1,035 kB (287 kB gzip) | 4,079 kB (1,120 kB gzip) |
| Extra runtime files | 520 kB worker | 7.7 MB of workers, glyphs and widget assets in public/cesium/ |
| Frame rate, 10,000 points, 6 s flight, mean | 13 fps | 3 fps |
| Frame rate, worst half-second | 6 fps | 0 fps (stalls over 500 ms) |
| Engine ready after chunk load | 0.7 to 0.9 s | 0.5 s |
| Lighthouse mobile, quakes only: performance score | 51 | 61 |
| Lighthouse first contentful paint | 0.76 s | 0.76 s |
| Lighthouse largest contentful paint | 5.0 s | 2.5 s |
| Lighthouse total blocking time | 2.8 s | 7.1 s |
| Lighthouse transfer | 562 kB | 2,492 kB |

Conditions: headless Chromium 158 with SwiftShader software GL, 390 by 844 viewport, eight-core server. The frame
rates compare the two engines against each other; a phone's GPU will be faster for both. Lighthouse used its
default simulated mobile throttling. Cesium's better LCP is its dark canvas painting early; its blocking time is the
4 MB chunk parsing. Neither page meets the phase-1 gate of 80 yet: the Explore page will have to paint its text
first and load the engine chunk after, whichever engine is chosen.

Imagery in both prototypes is OpenStreetMap raster tiles, which is fine for development but not for a public app
(tile usage policy); the chosen engine gets a self-hosted or permitted basemap in deliverable 8.

### Recommendation: MapLibre GL

- A quarter of the download, a tenth counting Cesium's runtime assets. Many learners are on phones.
- Four times the frame rate with 10,000 points, and no half-second stalls.
- Point layers are GeoJSON sources with expression filters, so a time scrub is one `setFilter` call rather than a
  loop over primitives.
- No Cesium Ion token or branding to manage.

What Cesium would have given and MapLibre lacks: built-in terrain and 3D tiles, and time-dynamic layers out of the
box. Phase 4's topographic work needs hillshade and profiles, not 3D terrain; MapLibre has raster-DEM hillshade and
terrain, and profiles are computed from elevation tiles in code anyway. Phase 6's Moon and Mars DEM swap works on
either by changing the raster source.

### After the pick

Delete the loser's folder under `src/map/`, its dependency, its lint ignore and (for Cesium) `scripts/copy-cesium.mjs`,
the `prepare` script, `public/cesium/` and the `CESIUM_BASE_URL` define. Keep `scripts/bench.mjs` for the Lighthouse gate.
