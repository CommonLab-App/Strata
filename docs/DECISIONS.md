# Decisions

Dated records of choices that are not obvious from the code.

## 2026-11-07 No backend

Progress, worksheets, self-check scores and cached data snapshots live in localStorage, as in Valence. No accounts, no database, no server job. The build is fully static.

## 2026-11-08 Globe engine: MapLibre GL (chosen over CesiumJS)

Decided 2026-11-08: MapLibre GL. Both candidates implemented the same five-call wrapper in `src/map/types.ts` and
drew the same layer: the past day's USGS quakes plus 10,000 synthetic points, on a bench page since removed with the
Cesium prototype (last present at commit d803ba3). Measured against the production build.

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

`npm run bench` now runs Lighthouse mobile on the week-1 Explore pane alone, for the phase-1 gate.

## 2026-11-08 Phase-1 Lighthouse gate: met, 92 on a desktop with a GPU

The spec asks for Lighthouse mobile performance of 80 or more on the Explore pane. `npm run bench` runs it twice in one
headless Chromium against the production build; this server has no GPU, so WebGL runs on SwiftShader (software).

| Run | Score | FCP | LCP | TBT | Speed index |
| --- | --- | --- | --- | --- | --- |
| Cold browser, SwiftShader | 68 | 0.76 s | 0.76 s | 4.2 s | 4.4 s |
| Warm browser, SwiftShader | 72 | 0.77 s | 0.77 s | 2.2 s | 2.7 s |
| Warm, WebGL disabled (`BENCH_NO_WEBGL=1`) | 67 | 0.76 s | 4.0 s | 0.8 s | 1.0 s |

What the runs say:

- First and largest paint are the same event at about 0.76 s: the pane's text paints in its web font before the
  engine starts. Three changes got it there: the quake count moved out of the caption into its own element, the
  latin Inter faces are served from `public/fonts/` with a preload in index.html instead of the fontsource CSS, and
  week content is in the main chunk rather than a lazy one. The engine starts only after a painted frame and
  `document.fonts.ready` (`settled()` in `src/app/weeks/week01/Explore.tsx`).
- The remaining 2.2 s of blocking time is MapLibre's start-up: WebGL context, globe and raster shaders, first
  frame. With WebGL disabled it falls to 0.8 s, of which the main chunk's evaluation is most. (The 4 s LCP in that
  row is the "globe could not load" message appearing late; it is not a real page state.) Under SwiftShader the
  shader work runs on the CPU and is counted at Lighthouse's four-times slowdown; on a phone the GPU driver does it.
- The cold run adds the browser's own GPU-process start to everything; Lighthouse on a desktop pays far less for it.

The gate cannot be shown from this server. Panda ran Lighthouse 13.5 from desktop Chrome 157 (Windows, GPU) against
`npm run preview` on 2026-11-08, mobile preset, default simulated throttling:

| Measure | Result |
| --- | --- |
| Performance | 92 |
| First contentful paint | 1.7 s |
| Largest contentful paint (the caption paragraph) | 2.0 s |
| Total blocking time | 291 ms |
| Cumulative layout shift | 0.007 |
| Speed index | 1.7 s |
| Accessibility, best practices, SEO | 96, 100, 91 |

The blocking time's largest task is MapLibre's start-up at 289 ms, a third of its software-rendered figure here. The
phase-1 gate is met. The two non-performance findings, MapLibre's attribution link lacking contrast and an underline,
and the preview server answering `/robots.txt` with the app shell, were fixed the same day (a CSS rule, a
`public/robots.txt`). The measurement to repeat after any change to the Explore pane: `npm run build && npm run
preview`, then Lighthouse from DevTools on `/#/week/1/explore`, or `CHROME_PATH=<a Chrome with a GPU> npm run bench`.

## 2026-11-08 Basemap: self-hosted Protomaps extract

The owner chose self-hosting over a hosted tile provider; the host has the space and bandwidth, and nothing in the app
then calls a third party except the data APIs. The basemap is one PMTiles file, a zoom 0 to 8 extract of the Protomaps
daily planet build, next to the Protomaps glyphs and sprites, in a folder named by `VITE_BASEMAP_URL` at build time.
PMTiles is read with HTTP range requests, so the reseller host needs no tile server. The style is the Protomaps
`light` or `dark` flavour from `@protomaps/basemaps`, matched to the app theme at map start. With the variable unset
the engine falls back to OpenStreetMap raster tiles for development. Rejected: Natural Earth raster (too coarse past
zoom 5 for regional views), a hosted vector provider (a key in the build, a third party in every page view).
Zoom 8 keeps the file in the hundreds of megabytes; pass a higher maximum to `scripts/build-basemap.sh` if regional
views need it.

## 2026-11-09 Phase-2 Lighthouse gate: met, 91 on the quartz card

Lighthouse 13.5 mobile (simulated throttling, 4x CPU slowdown) on `/#/explore/minerals/quartz` from the production
build on the owner's desktop with a GPU.

| Measure | Result |
| --- | --- |
| Performance | 91 |
| First contentful paint | 2.0 s |
| Largest contentful paint (the turntable video poster) | 2.9 s |
| Total blocking time | 147 ms |
| Cumulative layout shift | 0 |
| Speed index | 2.0 s |
| Accessibility, best practices, SEO | 100, 100, 100 |

The phase-2 gate is met. Notes for later, none blocking: the 640x360 poster is drawn at 308 px wide on a phone, so a
smaller poster would save about 26 kB per card; the main bundle and the crystal scene each carry about 40 % of code
unused on this page (the crystal scene is already a lazy chunk); the OSM preconnect hint was unused here and is now
removed since production serves its own basemap. The video-caption note does not apply: the turntable clips have no
audio.

## Phase-3 gate: Lighthouse on the week-8 Explore pane (2026-11-09)

Mobile preset, GPU desktop, against the deployed build (OSM raster fallback, no basemap yet).

| Category | Score |
| --- | --- |
| Performance | 71 |
| Accessibility | 96 |
| Best practices | 96 |
| SEO | 100 |

Performance misses the gate's 80. First paint and largest paint are fine (2.2 s, 2.6 s); the cost is total blocking
time, 1.1 s, almost all of it one 685 ms task inside MapLibre as the globe starts on the 4x-throttled CPU, plus
170 ms and 125 ms tasks in the main chunk. Decision: record the number, fix what the run found that is ours (icon
files deployed mode 700 so the host answered 403, no Cache-Control on hashed assets, manifest served as
octet-stream, attribution link contrast), and measure before optimising: the same run on the week-1 Explore pane
(the quake globe, far fewer features) tells whether the blocking time is the globe itself or week 8's layers. If it is
the layers, defer the arrows and boundaries to an idle callback after the first frame; if it is the globe, the gate
number is revisited rather than the code.

