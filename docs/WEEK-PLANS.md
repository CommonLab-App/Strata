# Week-by-week implementation plans

One entry per week, in the shape the working agreement asks of a spec: Learn sources, Explore interactions, Lab
worksheet fields, checker rules, data adapters and licences, and the questions the reviewers should settle before
the week is built. Weeks 1 to 4, 6 and 7 are built; their entries say where the content lives and what is still
open. Weeks 5, 8 and 9 follow docs/specs/phase-3-internal-processes.md. Weeks 10 to 18 are plans only; their
Explore pages today show the outline from `src/app/weeks/scaffold.tsx`, marked Draft on Home.

Conventions that hold for every week: Learn links out and never copies; Explore shows a one-line neutral caption and
a source link with the fetch date; labs save to the week's localStorage entry and the checker recomputes from the
same cached data the learner saw; ten self-check questions in `data/self-checks/week-NN.json`; nothing names a
school or course code (the forbidden-strings grep covers this file too). Formulae named here are the usual textbook ones; the reviewers confirm or
replace each before it is coded, and the chosen source is named in docs/DATA-SOURCES.md.

Status of every live or bundled source is in docs/DATA-SOURCES.md. Licences confirmed so far: USGS feeds (public
domain), COD structures (public domain), PB2002 via tectonicplates (ODC-BY 1.0), EarthScope GNSS velocities
(CC BY 4.0), GVP Volcanoes of the World (US government work). GPlates Web Service terms still to read.

---

## Week 1: Earth as a system

**Status:** built (phase 1). `src/app/weeks/week01/`, `data/self-checks/week-01.json`.

- Learn: Earth as a system; how geologists reason. Links to the USGS science pages.
- Explore: the globe with the USGS quake feed, time-range toggle, event cards, largest-five list.
- Lab: guided observation form for a sand-and-water model (hypothesis, variable, prediction, observation, conclusion).
- Checker: completeness of the five fields.
- Data: `usgs-quakes` adapter, TTL 300 s.
- For review: the Learn text's emphasis; whether the lab prompt wants a second model (an ice-cube "glacier" or a
  dripping "spring") for a second observation.

## Week 2: Minerals, atoms, bonds, crystal structure

**Status:** built (phase 2). `src/app/weeks/week02/`, Mineral Inspector `src/app/inspector/`, structures `data/cif/`.

- Learn: bonding and structure; links out.
- Explore: Mineral Inspector with the CIF crystal view.
- Lab: Mineral ID I, 12 unknowns, hardness, streak, lustre, cleavage (`MINERAL_ID_1` in `src/app/lab/labs.ts`).
- Checker: identification and sufficiency of tests, scored by the engine from the saved tray (`src/engine/idlab/`).
- For review: the property values in `data/samples/minerals.json`, the week-2 pool, and the roughly 35-mineral core
  list the owner is assembling (flip the `core` flags when it arrives).

## Week 3: Minerals, silicate families

**Status:** built (phase 2). `src/app/weeks/week03/`.

- Learn: silicate structures from isolated tetrahedra to frameworks; links out.
- Explore: Mineral Inspector with the property key; compare quartz, feldspar, mica, olivine.
- Lab: Mineral ID II, 15 unknowns, full key, including density by balance and cylinder (tolerance ±5 %).
- Checker: as week 2.
- For review: the week-3 pool and the density tolerance.

## Week 4: Igneous rocks and magma

**Status:** built except the volcano panel (phase 2; panel is phase-3 deliverable 12). `src/app/weeks/week04/`.

- Learn: magma, cooling history, Bowen's series; links out.
- Explore: Rock Inspector on the igneous texture-composition grid; later, one volcano's eruption history from the GVP
  table beside the grid.
- Lab: Igneous ID on the texture and composition grid (`IGNEOUS_ID`).
- Checker: as the mineral labs, with texture and composition cells.
- For review: the Bowen's series figure in `data/figures/`, the rock values and pool in `data/samples/rocks.json`.

## Week 5: Volcanoes

**Status:** built 2026-11-09 on the assumptions below. `src/app/weeks/week05/`, `src/engine/volcano/`,
`data/self-checks/week-05.json`. Assumed: a StrataLab teaching fit for viscosity (three linear terms anchored on
basalt, andesite and dry rhyolite; see the file comment) and style rules by viscosity and water; the reviewers'
relation replaces `logViscosity` alone. Not built: the real-volcano overlay on the plot and the week-4 panel.

- Learn: magma properties and eruption style; why volcanoes line the boundaries. Sources: OpenGeology chapter 4; GVP
  pages for the real examples the reviewers pick.
- Explore: Holocene volcanoes beside the PB2002 boundaries, a tap opens the GVP record (done). To add: the Volcano
  Lab sliders and plot, and an eruption-history bar chart (VEI by year) in the volcano card.
- Lab: guided sim, three prompts (land a basaltic shield, a stratovolcano, a caldera-forming eruption) by setting
  silica, water and temperature; free play after.
- Checker: the model's style class for each prompt's settings; a prompt lands when the class matches.
- Model (`src/engine/volcano/`): viscosity from silica, water and temperature by a named empirical relation
  (candidate: Giordano, Russell and Dingwell 2008, or a simpler textbook fit); style classes effusive, strombolian,
  vulcanian, plinian with a VEI range each; tested on basalt at 1200 °C and rhyolite at 800 °C.
- Data: GVP bundle (`data/volcanoes/`, `scripts/fetch-gvp.mjs`), PB2002 bundle.
- For review: the viscosity relation and its inputs; the style and VEI class boundaries; which real volcanoes the
  overlay should name as end members; the week's ten questions.

## Week 6: Weathering, soils, sedimentary rocks

**Status:** built (phase 2). `src/app/weeks/week06/`.

- Learn: weathering, soil, sediment to rock; links out (done).
- Explore: Rock Inspector on the sedimentary set. Phase 4 adds a Macrostrat column at a chosen point.
- Lab: Sedimentary ID by grain size, sorting, rounding, cement, acid (`SEDIMENTARY_ID`).
- Checker: as the other identification labs.
- For review: the sedimentary pool and the facies figure.

## Week 7: Metamorphic rocks and the rock cycle

**Status:** built (phase 2). `src/app/weeks/week07/`.

- Learn: grade, foliation, index minerals, the cycle; links out.
- Explore: Rock Inspector with the pressure-temperature grid.
- Lab: Metamorphic ID by foliation, grade and index minerals (`METAMORPHIC_ID`).
- Checker: as above.
- For review: the P-T grid values and the index-mineral sequence.

## Week 8: Plate tectonics

**Status:** built 2026-11-09 on the assumptions below; the reviewers may change any of them. `src/app/weeks/week08/`,
`src/engine/tectonics/worksheet.ts`, `data/self-checks/week-08.json`. Assumed: the spec's tolerances; the learner
chooses the station pair; the age slider stops at 250 Ma (MULLER2019) in 25 Ma steps.

- Learn: plates, boundary types, the evidence then and now. Sources: OpenGeology chapter 2; EarthScope education
  pages.
- Explore: GNSS arrows and boundaries, two-station relative motion with the nearest boundary (done). To add: the age
  slider, today to 250 Ma with MULLER2019 through the GPlates adapters, drawing reconstructed plate polygons and
  moving a chosen point; past 250 Ma only if the reviewers pick a model that covers it.
- Lab worksheet: station A id and velocity, station B id and velocity, relative east and north, speed (mm/yr),
  azimuth (degrees from north), boundary type (divergent, convergent, transform, none).
- Checker (`src/engine/tectonics/`, done): relative components B − A, speed their norm, azimuth atan2(east, north);
  speed within 10 % or 1 mm/yr, azimuth within 10°; boundary type accepted when it matches the nearest PB2002
  segment within 200 km of the midpoint, or none when no segment is that close.
- Data: GNSS bundle `data/gnss/` (CC BY 4.0), PB2002, GPlates Web Service (terms to read).
- For review: the tolerances; whether the lab should fix the station pairs or let the learner choose; the
  reconstruction model past 250 Ma; the ten questions.

## Week 9: Earthquakes and Earth's interior

**Status:** built 2026-11-09 on the assumptions below. `src/app/weeks/week09/`, `src/app/quakes/`,
`src/engine/seismic/`, `data/seismograms/` (four events bundled by `scripts/fetch-waveforms.mjs`),
`data/self-checks/week-09.json`. Assumed: a two-layer teaching travel-time table (35 km crust, P 6.1 and S 3.5
km/s over mantle P 8.0 and S 4.5); the four largest shallow catalogue events of 2023 to 2025 with three open
records 200 to 1500 km away; reference picks are the model's predicted arrivals at the catalogue distance, not
hand picks; the table is applied for the learner rather than read by eye. Not built: focal-mechanism glyphs.

- Learn: faults and waves, locating an epicentre, the shadow zone and the core. Sources: OpenGeology chapter 9; USGS
  earthquake science pages.
- Explore: the quake globe with depth as colour and magnitude as size; a seismogram panel for a chosen teaching
  event, three vertical traces on one time axis, P and S picks to drag, distance circles drawn as picks are made.
- Lab worksheet: per station the P pick, S pick, S − P and distance; the learner's epicentre; the catalogue epicentre;
  the miss distance.
- Checker (`src/engine/seismic/`, done): distances by the bundled travel-time table, interpolated; expected epicentre
  by least squares from the learner's own distances; a mark for a point within 50 km, a second for picks each within
  2 s of the bundled reference picks.
- Data: `scripts/fetch-waveforms.mjs` against the FDSN dataselect service, three stations per event, decimated to
  1 Hz, bundled under `data/seismograms/` with network, station, channel, window and request URL; the travel-time
  table bundled with its source named.
- For review: the travel-time table source (candidate: a textbook S − P curve, or iasp91 sampled to a table); three to
  five teaching earthquakes with clear P and S at three stations 200 to 1500 km away; the ten questions.

## Week 10: Deep time, relative dating

**Status:** built 2026-11-09. `src/app/weeks/week10/`, `src/app/strata/SectionView.tsx`, `src/engine/strata/`,
`data/self-checks/week-10.json`. Assumed: event types bed, dike, fault, tilt, erosion (no folds, inclusions or
fossils); five to twelve events per section; unconformities classed angular or disconformity (no nonconformity, as
there is no basement); two marks, one for a perfect order and one for the unconformity types. Not built: the GPlates
panel (week 8 has it).

- Learn: superposition, original horizontality, cross-cutting, inclusions, faunal succession, the three unconformity
  types. Sources: OpenGeology chapter 7.
- Explore: the Geologic Time Builder: a generated cross-section (beds, intrusions, faults, erosion surfaces) drawn as
  SVG; drag events into order; the app names the rule that places each pair. A second panel moves a chosen point back
  through time with the GPlates adapters.
- Lab worksheet: the ordered list of events; for each unconformity, its type; one sentence on the rule used for a
  chosen pair.
- Checker: the section is generated by a seeded engine (`src/engine/strata/`) from a recorded event list, so the
  true order is known; score is the fraction of event pairs in the right order; the first wrong pair is reported
  with the rule it breaks; unconformity type is read from the generating geometry (angular, disconformity,
  nonconformity). Deterministic for a given seed, which the entry stores.
- Data: none live; GPlates for the reconstruction panel.
- For review: the set of event types and rules to include; how many events per section at this level (candidate:
  six to nine); whether to include fossils as a succession rule.

## Week 11: Absolute dating and the time scale

**Status:** built 2026-11-09. `src/app/weeks/week11/`, `src/engine/dating/`, `data/timescale/` (Macrostrat, CC BY 4.0,
`scripts/fetch-timescale.mjs`), `data/self-checks/week-11.json`. Assumed: four systems (C-14, K-Ar, U-Pb, Rb-Sr)
with textbook half-lives and ranges; three samples per sheet from C-14, K-Ar and U-Pb with the system given, no
initial daughter; 5 % age tolerance; a second mark per sample for the period. Not built: a choose-the-system step.

- Learn: decay, half-life, which isotopes date what, how the time scale was pinned. Sources: OpenGeology chapter 7.
- Explore: Time Builder with a half-life slider: parent and daughter counts animate as a plot (shared `Plot`);
  read an age off the curve; place dated units on a drawn time scale.
- Lab worksheet: three samples, each with the isotope chosen, the parent-daughter ratio given, and the learner's age;
  a short time scale built from them.
- Checker (`src/engine/dating/`): age = T × log2(1 + D/P) for the isotope's half-life; within 5 %; the isotope is
  accepted when its usable range covers the true age; the time scale scores on order and on each age within the
  same tolerance. Candidate isotopes and half-lives: carbon-14 5730 a, potassium-40 1.25 Ga, uranium-238 4.47 Ga,
  rubidium-87 48.8 Ga, each with a usable range the reviewers set.
- Data: Macrostrat API for unit ages (open, no key; terms to record) for the time-scale panel.
- For review: the isotope list, half-lives and ranges; the tolerance; the ten questions.

## Week 12: Topographic and geologic maps

**Status:** built 2026-11-09. `src/app/weeks/week12/`, `src/app/topo/TopoView.tsx`, `src/engine/topo/`, `data/terrain/`
(three zoom-11 Terrarium tiles decoded to 128 by 128 grids by `scripts/fetch-terrain.mjs`), `data/self-checks/week-12.json`.
Assumed: the three areas (given by latitude and longitude only in the script); 50 m contours in the lab; the
three-point problem on a synthetic plane with the outcrops as coordinates, not on the map; tolerances one interval,
10 % gradient, 10° strike, 5° dip. Not built: the Macrostrat geologic-map overlay (the tiles need a vector-tile
parser; the point query is too slow for an area) and a scored cross-section sketch.

- Learn: contours, scale, profiles, strike and dip, cross-sections. Sources: USGS topographic map symbols; OpenGeology
  chapter 9 for structure.
- Explore: the Map and Topo Workshop: an elevation tile drawn with contours at a chosen interval, a profile tool
  (click two points, see the profile), strike-and-dip symbols to place, a Macrostrat geologic-map overlay.
- Lab worksheet: a profile along a given line as a list of elevations at marked stations; the gradient between two
  points; strike and dip from a three-point problem; a sketched cross-section (free drawing, not scored).
- Checker (`src/engine/topo/`): elevations sampled from the same tile at the same stations, each within one contour
  interval; gradient within 10 %; strike within 10° and dip within 5° of the three-point solution.
- Data: elevation tiles, candidates: the Terrain Tiles on AWS Open Data (Terrarium encoding, no key; licence per
  source, to record) or USGS 3DEP through a tile service; Macrostrat map tiles. Adapter `terrain-tiles`, TTL 30 days.
- For review: the tile source; the contour interval and quad the lab fixes on; whether the cross-section sketch should
  be scored at all.

## Week 13: Streams and floods

**Status:** built 2026-11-09. `src/app/weeks/week13/`, `src/app/water/GaugePicker.tsx`, `src/data/adapters/usgs-water.ts`,
`src/engine/hydro/`, `data/self-checks/week-13.json`. Assumed: the legacy NWIS site and IV services (CORS, open);
the learner chooses the gauge by tapping the globe (no fixed gauge); the lab keeps hourly means of the record in the
worksheet so the checker reads what the learner saw; the start of the rise is the last trough before the peak;
Leopold and Wolman (1957) for braided against meandering, with a slope one twentieth of the line as the straight
cut. Not built: flood stage (not in the services used).

- Learn: drainage, discharge, floodplains, hydrographs, recurrence. Sources: OpenGeology chapter 11; USGS water
  science school pages.
- Explore: the Water Explorer for rivers: gauges on the globe, a tap opens the current discharge and the recent
  hydrograph (shared `Plot`); a stream-table sandbox with sliders for slope, discharge and sediment size.
- Lab worksheet: for a chosen gauge and window, peak discharge, time of peak, time from start of rise to peak, and
  whether the record crossed the flood stage where the site gives one.
- Checker: peak and times recomputed from the cached record (peak within 2 %, times within one data step); flood
  stage read from the site metadata when present, otherwise the question is skipped. Stream-table class
  (straight, meandering, braided) from a named slope-discharge threshold (candidate: Leopold and Wolman 1957).
- Data: USGS Water Services instantaneous and daily values (open REST; NWIS is being retired in favour of the new
  Water Data APIs, so one adapter `usgs-water` wraps whichever is live), TTL 900 s.
- For review: the stream-table relation; the gauge the lab fixes on; the ten questions.

## Week 14: Groundwater and karst

**Status:** built 2026-11-09. `src/app/weeks/week14/`, `src/engine/groundwater/`, the well mode of the gauge picker
(`usgs-well-sites`, `usgs-well-iv` with parameter 72019), `data/self-checks/week-14.json`. Assumed: a generated
eight-well set (a sloping table with one bump) rather than live wells, so the checker reproduces; inverse-distance
weighting (power 2) for the table and 2 m contours; the learner reads head and flow azimuth at a point rather than
drawing contours; Thiem confined steady state with a given radius of influence; tolerances 1 m, 20°, 10 %. Karst
stays in Learn (no sinkhole layer).

- Learn: porosity, permeability, the water table, Darcy's law, wells, karst. Sources: OpenGeology chapter 11.
- Explore: the Water Explorer for wells: live well levels on the globe; a Darcy sandbox with sliders for hydraulic
  conductivity, gradient and area giving discharge (shared `Sliders` and `Plot`).
- Lab worksheet: water-table contours drawn from a set of well heads (as contour values at crossings on a grid),
  the flow direction, and the drawdown at a given radius for a pumping scenario.
- Checker (`src/engine/groundwater/`): a surface interpolated from the same well heads (inverse distance); each
  contour crossing within half an interval; flow direction within 20° of the steepest descent; drawdown by the Thiem
  steady-state equation within 10 %.
- Data: USGS groundwater levels through the same `usgs-water` adapter.
- For review: the interpolation and tolerances; the well set the lab fixes on; whether karst gets a map layer
  (sinkhole inventories are patchy and state-by-state) or stays in Learn.

## Week 15: Glaciers, deserts, coasts

**Status:** planned (phase 5).

- Learn: glacial erosion and deposition, wind, waves and longshore drift, sea-level change. Sources: OpenGeology
  chapters 12 to 14.
- Explore: the Surface Sandbox in glacier, wind and wave modes (slider-driven erosion of a synthetic surface, drawn
  as shaded relief); paired elevation tiles of a glaciated and an unglaciated valley.
- Lab worksheet: landforms identified by clicking labelled regions on two tiles; a sea-level scenario on a coastal
  tile with the flooded area read off.
- Checker: landform picks against the reviewers' labelled regions bundled with the tiles; flooded area recomputed
  from the same tile at the same level within 5 %.
- Data: `terrain-tiles` adapter as week 12; the labelled regions bundled under `data/landforms/`.
- For review: the valley pair and the coast; the landform list; the ten questions.

## Week 16: Mass wasting, resources, climate

**Status:** planned (phase 5).

- Learn: slope processes and triggers, the resources we take from rock, the climate record in geology. Sources:
  OpenGeology chapters 10, 15 and 16.
- Explore: a slope-stability sandbox with sliders for slope angle, water (saturation fraction), and vegetation (root
  cohesion), plotting factor of safety against angle; map layers from public landslide inventories and mineral
  resource records.
- Lab worksheet: the failure angle for three given settings; one sentence per slider on its effect.
- Checker (`src/engine/slope/`): infinite-slope factor of safety, FS = (c' + (γ − m·γw)·z·cos²β·tanφ') /
  (γ·z·sinβ·cosβ), with vegetation as added cohesion; failure angle where FS = 1, within 2°.
- Data: USGS landslide inventory (public domain) and mineral resource data; one adapter each, or bundles if the
  endpoints are unstable.
- For review: the soil parameters to fix; whether climate gets an Explore layer (ice-core or sea-level curve bundled
  from a public dataset) or stays in Learn; the ten questions.

## Week 17: Mountain building and structural geology (optional)

**Status:** planned (phase 6).

- Learn: stress and strain, folds, faults, orogeny. Sources: OpenGeology chapter 9.
- Explore: the Map Workshop in three dimensions: Three.js block models of an anticline, a syncline, a normal, a
  reverse and a strike-slip fault to rotate and slice; a basic stereonet that plots planes and poles.
- Lab worksheet: the structure named from a map pattern; two planes plotted on the stereonet as strike and dip.
- Checker: structure against the model that generated the pattern; each plotted plane within 5° of the given one.
- Data: none live.
- For review: whether to keep this as an extension or fold it into week 12; the structure list.

## Week 18: Planetary geology and synthesis (optional)

**Status:** planned (phase 6).

- Learn: comparative planetology; crater counting as a clock. Sources: USGS Astrogeology; Wikipedia articles linked.
- Explore: the globe with Moon and Mars elevation in place of Earth, the same layer tools running on them.
- Lab worksheet: crater counts above a size threshold in two marked regions; the regions ranked by age.
- Checker: counts from a bundled crater catalogue subset in the same boxes (within 10 %); the ranking must match.
- Data: lunar and Martian elevation from USGS Astrogeology (public domain); a crater catalogue subset (candidates: the
  Robbins Mars crater database; a lunar crater catalogue), licence to record.
- For review: keep as an extension or drop; the catalogue; the regions.

---

## Order of work after the review

Phase 3 finishes first (weeks 5, 8, 9 labs and content), then phase 4 (weeks 10 to 12), phase 5 (weeks 13 to 16),
phase 6 (17, 18, offline, launch). Each phase gets its spec in docs/specs/ from the entries above once the reviewers'
answers are in; this file then records the decision beside each question rather than being rewritten.
