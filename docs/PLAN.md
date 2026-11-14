# Strata — Geology Explorer Plan

Prepared 2026-11-05 by Erin Lukens (Panda) with Claude. Living copy: https://claude.ai/artifact/9j9aBBXbpKVUsDTUn2Ui1g

## Overview

Strata is a free, open-source browser app for self-learning introductory physical geology, built the way Valence covers general chemistry: interactive explorers, virtual labs, and live real-world data, organized into a 16-week semester with two optional extension weeks.

Where Valence lets you inspect bonds and run a titration, Strata lets you watch plates move on live GPS data, scrub earthquakes on a world map, build a stratigraphic column, and trace a river's discharge through a flood. Coverage matches a community-college physical geology course with lab: minerals and rocks, plate tectonics, earthquakes and volcanoes, geologic time, surface processes, water, maps, resources.

Audience: anyone curious, no prior geology. The app never assumes a classroom, an instructor, or a textbook.

## Guardrails

- No course numbers, institution names, campus or location data anywhere.
- No school-system integration, no accounts. Progress saved in the browser (localStorage), as in Valence. Decided 2026-11-07.
- Free and open source, same license as Valence; hosted at stratalab.app (first planned for firetailfab.com beside Valence; moved 2026-11-13).
- No hand-written observation text; live data, published datasets, linked references.
- Labs modeled on common intro physical geology lab-manual exercises, not one school's manual.
- Credit AI assistance on the About page.
- Recent-event views: neutral one-line caption + official source link, no risk interpretation.

## Core modules

Every module has a Learn pane (short, linked explanation), an Explore pane (interactive), and a Lab pane (the week's exercise).

| Module | What you do | Valence analog |
| --- | --- | --- |
| Mineral & Rock Inspector | Rotate 3D crystal structures and hand samples; test hardness, streak, cleavage, luster, density against a key; ~60 minerals, ~40 rocks | Molecule explorer |
| Plate Motion Explorer | Globe with live GPS velocity arrows; pick two stations, read relative motion in mm/yr; slider 540 Ma to today | Reaction timeline |
| Seismic Viewer | Live quake map (hour/day/week/month); depth, magnitude, focal mechanism; S-minus-P triangulation; scrub seismograms | Scrubbable reaction |
| Volcano Lab | Vary silica, water, temperature; watch viscosity, eruption style, VEI; compare to real volcanoes | Ideal gas law sim |
| Geologic Time Builder | Stack layers, cut faults/intrusions, erode unconformities; app orders events by relative-dating rules; radiometric slider | Titration curve |
| Map & Topo Workshop | Contours, profiles, strike and dip, cross-sections; real quads via elevation tiles | Lab notebook |
| Water Explorer | Live river gauges and wells; flood hydrographs; Darcy's-law aquifer sim; water table from well data | Calorimetry sim |
| Surface Process Sandbox | Erode a landscape with rainfall and rock-strength sliders; river, glacier, coast modes; before/after DEMs | Distillation sim |
| Resources & Hazards | Hazard overlays (quakes, landslides, floods, sinkholes); oil/gas, mineral, groundwater resource maps | Aqueous reactions |

Shared pieces: one globe/map engine (WebGL globe + 2D map, layer toggles) and one sample library with stable IDs.

## Live data sources

| Module | Source | Gives | Access | Status |
| --- | --- | --- | --- | --- |
| Plate Motion (today) | EarthScope NGF / GAGE velocity products (https://ngf.earthscope.org/data/tools) | Velocity vectors for ~2,000+ North American GNSS stations | Moving to token-based access; cache a weekly snapshot | Checked 2026-11-05 |
| Plate Motion (deep time) | GPlates Web Service (https://gwsdoc.gplates.org/) | Paleo-coordinates and plate polygons at any age | Open HTTP GET, GeoJSON, no key; Muller2019 / Zahirovic2022 | Checked 2026-11-05 |
| Map Workshop, Time Builder | Macrostrat API v2 (https://macrostrat.org/) | Geologic map polygons, 1,400 columns, 33,900 units with ages/lithology/colors | Open REST, no key | Checked 2026-11-05 |
| Seismic Viewer | USGS Earthquake GeoJSON feeds | Quakes past hour/day/week/month | Open, no key, 1-minute updates | Verify |
| Seismic (waveforms) | EarthScope/IRIS FDSN dataselect | Seismograms for S-minus-P | Open; cache a few teaching events | Verify |
| Water Explorer | USGS NWIS and successor Water Data APIs | Discharge, stage, groundwater levels | Open REST; NWIS being retired, wrap in one adapter | Verify |
| Map Workshop, Sandbox | USGS 3DEP via OpenTopography / terrain tiles | DEMs | Tiles open; OpenTopography bulk needs free key | Verify |
| Volcano Lab | Smithsonian Global Volcanism Program | Volcano list, type, VEI history | Open web data; cache a table | Verify |
| Mineral Inspector | RRUFF / COD for CIF structures; Mindat for properties | Crystal structures, physical properties | CIF open; author ~60-mineral table by hand | Verify |
| Resources & Hazards | USGS landslide/sinkhole inventories, NOAA flood outlooks, state survey open data | Hazard overlays | Mixed; pick stable GeoJSON endpoints | Verify |

## 16-week semester map

| Week | Topic | Explorer module | Virtual lab | Live-data activity |
| --- | --- | --- | --- | --- |
| 1 | Earth as a system; how geologists think | Globe overview; layer tour | Scientific method with a sand-and-water model | Watch today's quakes appear on the globe |
| 2 | Minerals: atoms, bonds, crystal structure | Mineral Inspector (crystal view) | Mineral ID I: hardness, streak, luster, cleavage on 12 unknowns | Browse real crystal structures from CIF files |
| 3 | Minerals: silicate families; rock-forming minerals | Mineral Inspector (property key) | Mineral ID II: 15 unknowns, full key | Compare quartz, feldspar, mica, olivine structures |
| 4 | Igneous rocks and magma | Volcano Lab; Rock Inspector | Igneous ID: texture/composition grid; Bowen's series | Pull a real volcano's silica and VEI history |
| 5 | Volcanoes and volcanic hazards | Volcano Lab; Hazards overlay | Eruption-style sim: silica, water, temperature | Map active volcanoes vs plate boundaries |
| 6 | Weathering, soils, sedimentary rocks | Surface Sandbox (weathering); Rock Inspector | Sedimentary ID: grain size, sorting, rounding, cement | Macrostrat column at a chosen point |
| 7 | Metamorphic rocks; the rock cycle | Rock Inspector; P-T grid | Metamorphic ID: foliation, grade, index minerals | Trace a rock through the cycle on a P-T path |
| 8 | Plate tectonics: evidence and boundaries | Plate Motion Explorer (live GPS) | Boundary ID from velocity arrows; seafloor age stripes | Relative motion between two real GPS stations |
| 9 | Earthquakes and Earth's interior | Seismic Viewer | Locate an epicenter: S-minus-P from three stations; shadow zone | Scrub seismograms of a real teaching event |
| 10 | Deep time: relative dating and stratigraphy | Geologic Time Builder | Order a cross-section's events; unconformities | Reconstruct a point back to 540 Ma with GPlates |
| 11 | Absolute dating and the time scale | Time Builder (radiometric slider) | Half-life sim: date three samples; build a time scale | Place Macrostrat units on the time scale |
| 12 | Topographic and geologic maps | Map & Topo Workshop | Contours, profile, strike and dip, cross-section | Load a real quad from elevation tiles and profile it |
| 13 | Streams and floods | Water Explorer (rivers); Surface Sandbox | Stream table sim; read a hydrograph | Pull a live gauge; find a flood in the record |
| 14 | Groundwater and karst | Water Explorer (wells) | Darcy's law sim; contour a water table; cone of depression | Live well levels; map sinkhole inventory |
| 15 | Glaciers, deserts, coasts | Surface Sandbox (glacier, wind, wave) | Landforms on DEMs; sea-level change sim | Glaciated vs unglaciated valley DEMs |
| 16 | Mass wasting, resources, climate | Resources & Hazards overlay | Slope stability sim: angle, water, vegetation | Landslide inventory vs rainfall; resource maps |
| 17 (ext.) | Mountain building and structural geology | Map Workshop (folds, faults in 3D) | Fold/fault block models; stereonet basics | Cross-section through a real mapped area |
| 18 (ext.) | Planetary geology and synthesis | Globe (Moon and Mars DEM swap) | Crater counting for relative age | Mars vs Earth DEMs; semester review |

Each week ends with a 10-question auto-graded self-check (retry allowed) and the lab's saved worksheet. Progress shows as a 16-step track on the home page.

## Virtual labs

Identification labs (weeks 2, 3, 4, 6, 7): tray of 3D unknowns with photo textures; tools (glass plate, streak plate, nail, penny, magnet, dilute acid, hand lens, balance + graduated cylinder). Each test is an animation with a result that fills a worksheet column; the key narrows live. Scored on correct ID and sufficiency of tests run. Rock labs add texture grids.

Simulation labs (weeks 5, 11, 13, 14, 15, 16): slider-driven models with plotted output — eruption style, half-life decay, stream table, Darcy's law, slope stability, sea-level rise on a real DEM. 3 to 4 guided prompts plus free play.

Construction labs (weeks 10, 12, 17): order cross-section events (checker names the broken rule); draw a profile (snaps to contour crossings); measure strike and dip; sketch a cross-section from map pattern.

Data labs (weeks 1, 8, 9, 13, 14): fixed question on live data — relative plate motion, epicenter from three S-minus-P times, peak discharge and lag time, water-table contours. Checker recomputes from the same cached snapshot the learner saw.

Deferred: thin-section labs, field-trip-style labs (location-specific), fossil ID beyond index fossils.

## Technical stack

| Layer | Choice | Why |
| --- | --- | --- |
| Shell, routing, progress storage | Lifted from Valence as-is (localStorage, no accounts) | One pattern for both apps |
| Globe and 2D map | CesiumJS or MapLibre GL + light globe; decide in phase 1 | Cesium: terrain and time-dynamic layers; MapLibre: lighter, better on phones |
| 3D samples and crystals | Three.js; CIF parser; glTF | Same renderer as molecules |
| Sims | TypeScript models + shared slider/plot component | Same pattern as gas law / calorimetry |
| Data adapters | One module per source, common fetch-cache-normalize interface | Isolates API churn |
| Cache and snapshots | localStorage keyed source + query, each with fetched_at; TTL per adapter (GPS weekly, quakes 5 min, gauges hourly) | Reproducible lab answers, polite to public APIs |
| Sample library | JSON in repo with stable IDs; images in public/ | Hand-editable, versioned |
| Worksheets and progress | localStorage: worksheets, self-check best scores, module progress | Mirrors Valence |
| Offline and phones | Service worker caches sample library and last snapshots | Many learners on phones |

Fully static. The browser fetches public APIs directly and caches per adapter TTL; no server job.

## Build phases

1. Shell and data layer. Fork Valence shell, strip chemistry, add adapter interface and localStorage snapshot cache, globe with USGS quakes layer. Week 1 works. Gate: open the app, see today's quakes, finish week-1 self-check, reload and see it persisted.
2. Earth materials. Mineral and Rock Inspector, sample library, five ID labs. Weeks 2-7 minus Volcano Lab. Gate: all five ID labs save a worksheet and score.
3. Internal processes. Plate Motion Explorer (cached GPS + GPlates), Seismic Viewer with S-minus-P lab, Volcano Lab. Weeks 4, 5, 8, 9. Gate: relative-motion and epicenter labs recompute from snapshots.
4. Time and maps. Time Builder, half-life sim, Map & Topo Workshop with elevation tiles and Macrostrat. Weeks 10-12. Gate: ordering and profile checkers pass a fixed test set.
5. Water and surface. Water Explorer, Surface Sandbox, slope-stability and sea-level sims, hazard overlays. Weeks 13-16. Gate: hydrograph lab reads a live gauge; sandbox runs 30 fps on a mid-range phone.
6. Polish and extensions. Weeks 17-18, offline mode, About page with credits, accessibility pass, launch on stratalab.app.

Each phase starts with one spec per module in docs/specs/ before code.

## Open questions

- [ ] Name: "Strata" is the placeholder; check repo name and firetailfab.com path. Alternatives: Bedrock, Terrane, Moraine, Lithic.
- [ ] Globe engine: CesiumJS vs MapLibre. Decide in phase 1.
- [ ] GPS velocities: confirm EarthScope token-access terms allow a cached weekly snapshot in an open app, or use the published velocity-field release files.
- [ ] Water data: build the adapter against the new USGS Water Data APIs if stable by phase 5.
- [ ] Sample images: CC-licensed photos vs procedural textures first.
- [ ] Which open (OER) intro physical geology lab manual to use as the reference exercise list.
- [ ] Keep weeks 17-18 as extensions or fold structural into week 12.
- [ ] Extract the Valence shell into a shared package, or keep two copies.
