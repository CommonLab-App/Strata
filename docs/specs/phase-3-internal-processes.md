# Phase 3 spec — Internal processes

Goal: a learner reads plate motion off real GPS stations, locates an earthquake from three seismograms, and runs a
volcano on sliders against the record of real ones. Covers weeks 5, 8 and 9 of docs/PLAN.md and the volcano half of
week 4 (the live activity "pull a real volcano's silica and VEI history"), deferred from phase 2.

Gate: the relative-motion lab (week 8) and the epicentre lab (week 9) each recompute their expected answer from the
same cached snapshot the learner saw, score a worksheet, and reproduce the score after a reload.

## What phases 1 and 2 give us

- Adapter + `getSnapshot` cache with `fetched_at` and `source_url` on every snapshot; the quake adapter; the MapLibre
  engine with point layers and `setTime`; the data footer; the week shell with a typed lab state; `settled()` for
  heavy chunks; the pure-folder lint (`src/engine/**`: no DOM, no clock, no random).
- The identification engine's pattern: pure rules in `src/engine`, a thin bench in `src/app/lab`, a version test
  pinning what a stored entry is judged against.

## Deliverables

1. **Shared slider-and-plot component** (`src/app/sim/`): a `Sliders` panel bound to a model's parameters and a
   `Plot` that draws one or more series on SVG axes with units, a cursor readout, and reduced-motion-aware
   animation. Used by the Volcano Lab here and by the half-life, stream, Darcy and slope sims later. Plot is pure
   SVG, no chart library.
2. **Plate boundaries layer**: `data/tectonics/pb2002-boundaries.json`, the Bird (2003) PB2002 boundaries as
   GeoJSON (Bird 2003 data as redistributed by the open `tectonicplates` repository, ODC-BY 1.0), fetched once by
   `scripts/fetch-static.mjs` with provenance in `data/tectonics/index.json`. A `LineLayer` added to the map engine
   (`addLines`, `removeLayer`), coloured by boundary kind (ridge, trench, transform).
3. **GNSS velocities adapter** `gnss-velocities`: present-day station velocities (east, north, up, mm/yr, with
   uncertainties) for the North American network. Source decision in Data below. TTL 7 days. Normalized fields:
   `station`, `lat`, `lon`, `ve`, `vn`, `vu`, `se`, `sn`, `frame`, `epoch`. An `ArrowLayer` in the map engine
   draws a scaled vector per station; one `addArrows` call.
4. **GPlates adapter** `gplates-reconstruct`: `reconstruct_points` for a list of points at an age, and
   `reconstruct_coastlines` (or the plate polygons) at an age, from the GPlates Web Service, model MULLER2019. TTL
   30 days. The reconstructed coastlines draw as a `LineLayer`; the reconstructed point as a marker.
5. **Plate Motion Explorer** (week 8 Explore): the globe with the GNSS arrows and the plate boundaries. Tap two
   stations to get their relative velocity: magnitude in mm/yr and azimuth, drawn as a third arrow. An age slider
   from today to 540 Ma redraws the coastlines through GPlates (debounced; snapshots per age step of 10 Ma) and
   moves a chosen point back through time.
6. **Relative-motion lab** (week 8): pick two stations on opposite sides of a boundary; the worksheet records both
   velocities as the snapshot has them, the learner's computed relative speed and direction, and which kind of
   boundary that implies. Checker rules below.
7. **Seismic Viewer** (week 9 Explore): the quake globe (phase 1) with depth as colour and magnitude as size, a
   focal-mechanism glyph where the USGS event detail carries one, and a seismogram panel for a cached teaching
   event: three stations' vertical traces on a shared time axis, scrubbable, with P and S picks the learner drags.
   Waveforms come from the IRIS FDSN dataselect service, fetched once by script for about five teaching events and
   bundled under `data/seismograms/`, decimated to 1 Hz with provenance (network, station, channel, start, end,
   request URL). The adapter interface is still used so a future live fetch is a drop-in.
8. **Epicentre lab** (week 9): three stations, three S−P times read off the traces, three distances from a
   travel-time table, three circles on the map, the learner's epicentre, and the catalogue epicentre for
   comparison. Checker rules below.
9. **Volcano model** (`src/engine/volcano/`): silica (wt %), water (wt %) and temperature (°C) in; viscosity (log
   Pa·s, by a published empirical relation named in the data notes), gas content and an eruption-style class out
   (effusive lava flow, strombolian, vulcanian, plinian) with a VEI range; deterministic and unit-tested on the
   textbook end members (basalt at 1200 °C, rhyolite at 800 °C).
10. **Volcano Lab** (week 5): the sliders drive the model, the plot draws viscosity against silica with the current
    point, a "compare to real volcanoes" overlay places named volcanoes from the GVP table by their dominant rock
    type and largest VEI; week 4's live activity opens one volcano's eruption history from the same adapter.
11. **GVP adapter** `gvp-volcanoes`: the Smithsonian Global Volcanism Program's Holocene volcano list and per-volcano
    eruption history (VEI, year). Access decision in Data below. Hazards overlay for week 5: active volcanoes on the
    globe beside the plate boundaries, one neutral caption and a link to the GVP page. Never a word about risk.
12. **Weeks 5, 8, 9** wired into `WEEK_CONTENT` with Learn text, Explore, Lab and ten self-check questions each;
    week 4's Explore gains the volcano history panel beside the igneous grid.

## Data

| Source | Decision | Notes |
| --- | --- | --- |
| Plate boundaries | Bundle PB2002 GeoJSON, fetched by script with provenance | Checked 2026-11-08: raw files reachable; Bird 2003 data, repository ODC-BY 1.0. Kind comes from the steps file (docs/DATA-SOURCES.md). |
| GNSS velocities | Owner's decision pending | Checked 2026-11-08: release files need a login; GeoServer 403. Either download one release with an account and bundle a teaching subset if its terms allow, or keep the adapter live behind a token kept out of the repo (docs/DATA-SOURCES.md). |
| GPlates Web Service | Live, open HTTP GET, no key | Checked 2026-11-08: `reconstruct_points` answers in GeoJSON. Snapshots cached per request. |
| USGS earthquakes | Phase 1 adapter; event detail via the FDSN event service for focal mechanisms | Checked 2026-11-08: `fdsnws/event/1/query` answers GeoJSON. |
| IRIS FDSN dataselect | Script-fetched teaching events, bundled | Checked 2026-11-08: service reachable. Choose events with clear P and S at three stations 200 to 1500 km away. |
| Smithsonian GVP | Bundle by script with provenance | Checked 2026-11-08: the WFS answers a plain client but sends no CORS header, so the browser cannot call it. Terms page was down that day; read it before the bundle ships (docs/DATA-SOURCES.md). |

Every bundled file carries the request URL, the fetch date and the licence in an `index.json` beside it, as
`data/cif/index.json` does. Snapshot sizes: velocities about 150 kB, a GPlates coastline response under 1 MB,
eruption histories a few kB; all within the localStorage budget alongside the quake feeds.

## Learn sources

Week 5: *An Introduction to Geology* chapter 4 (volcanoes), USGS Volcano Hazards Program pages on eruption styles,
Wikipedia on the Volcanic Explosivity Index. Week 8: chapter 2 (plate tectonics), EarthScope's explainer on GPS and
plate motion, Wikipedia on plate boundaries. Week 9: chapter 9 (earthquakes), USGS "The science of earthquakes",
IRIS education pages on locating an earthquake. Linked, never copied.

## Explore interactions

- Plate Motion: toggle arrows, boundaries, and a 20 mm/yr scale bar; tap a station for its card (velocities with
  uncertainties, frame, epoch); tap a second for the relative vector; age slider with the reconstructed coastlines
  and the "where was this point" marker; data footer for each source shown.
- Seismic: range toggle as phase 1; depth colour legend; tap a quake for its card; choose a teaching event to open
  the seismogram panel; drag P and S picks on each trace; the S−P time and the distance it implies update live.
- Volcano: three sliders; the plot; the overlay of real volcanoes; tap one for its eruption history as a bar chart
  of VEI by year with the GVP link.

## Lab worksheets and checkers

### Relative motion (week 8)

Worksheet: station A id and velocity (ve, vn), station B id and velocity, relative east and north components,
relative speed (mm/yr), azimuth (degrees from north), boundary type (divergent, convergent, transform, none).

Checker, recomputed from the stored snapshot by station id: relative components are B − A; speed is their norm;
azimuth is `atan2(east, north)` in degrees; each within 10 % or 1 mm/yr and within 10°. Boundary type is accepted
when it agrees with the nearest PB2002 segment's kind within 200 km of the midpoint, or when the stations are on
the same plate and the learner says none. Stored entry: both station ids, the snapshot's `fetched_at`, the learner's
numbers, the score.

### Epicentre (week 9)

Worksheet: for each of three stations, the P pick (s), the S pick (s), S−P (s), distance (km); the learner's
epicentre (lat, lon); the catalogue epicentre; the miss distance (km).

Checker: distances from S−P by the bundled travel-time table (interpolated; the table's source named); the expected
epicentre is the least-squares point minimising the distance residuals to the three circles, computed by the engine
from the learner's own distances; the learner's point scores when it lies within 50 km of that point, and a second
mark when the picks are each within 2 s of the bundled reference picks. Stored entry: event id, picks, point, score.

### Volcano (week 5)

A guided sim, as the plan has it: three prompts (match a basaltic shield, match a stratovolcano, match a caldera
eruption) each asking for slider settings that land in a named style; scored by the model's style for the settings
chosen. Stored entry: the three settings and whether each landed.

## Acceptance tests

- `npm test` passes; includes: the volcano model on end members; relative-vector maths; S−P distance table
  interpolation and the least-squares epicentre on a synthetic three-station case with a known answer; adapter
  `normalize` on fixtures for GNSS, GPlates and GVP; bundled-data index files complete (URL, date, licence).
- Fresh browser: week 8, pick two stations, fill the worksheet, check, reload, same score; week 9, pick P and S on
  three traces, place the epicentre, check, reload, same score; week 5, land all three prompts.
- The quake and volcano captions name the source and time and say nothing about risk (a test greps the week-5 and
  week-9 strings for the words the plan forbids).
- Lighthouse mobile performance 80 or more on the week-8 Explore pane, on a machine with a GPU.
- Forbidden-strings grep clean.

## Out of scope for phase 3

Macrostrat (phase 4), live waveforms, moment tensors beyond the glyph, volcanic hazard maps beyond the volcano
points, anything that interprets a recent event.
