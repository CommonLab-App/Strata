# Strata — Claude Code hand-off

## Before you start
1. Fill in the Valence repo path in CLAUDE.md (line under "Valence reference").
2. `cd` into this folder and run `claude`.

## First prompt (paste as-is)

Read CLAUDE.md, docs/PLAN.md, and docs/specs/phase-1-shell.md. Then open the Valence repo at the path in CLAUDE.md and study its structure: framework, build config, routing, the localStorage progress module, and how a lab saves a worksheet. Do not write any Strata code yet. Report back with: (1) a one-screen summary of the Valence conventions you will copy, (2) the exact file tree you propose for Strata, (3) the localStorage key schema for progress, worksheets, self-checks and data snapshots, and (4) anything in the phase-1 spec that conflicts with how Valence actually works. Wait for my go-ahead before scaffolding.

## Second prompt (after you approve the above)

Scaffold Strata per the approved tree. Work through docs/specs/phase-1-shell.md deliverables 1 through 5 in order, committing after each. Stop after deliverable 5 and show me the usgs-quakes adapter returning normalized data from a cache hit and a cache miss.

## Third prompt

Do deliverable 6: build the quake layer on both CesiumJS and MapLibre GL, run the measurements, write docs/DECISIONS.md with the numbers and your recommendation, and stop. I will pick the engine.

## Fourth prompt

Remove the engine we did not pick. Finish deliverables 7 through 10 and run the acceptance tests. When all pass, update CHANGELOG.md and tell me the phase-1 gate is met.

## Status 2026-11-08

Prompts one to four are done and the phase-1 gate is met: deliverables 1 to 10 are built and committed, `npm run
build` passes, the scripted acceptance flow passes in a fresh browser profile, and Lighthouse mobile performance on
Explore is 92 on a desktop with a GPU (docs/DECISIONS.md).

Phase 2 is built and its gate is met as of 2026-11-09 (docs/specs/phase-2-earth-materials.md, Status): Lighthouse mobile
on the quartz card scored 91 on the owner's GPU desktop. The phase-3 spec is drafted (docs/specs/phase-3-internal-processes.md, 2026-11-08) and is out for review by
geologists; expect changes to specs 2 and 3 and to the library data from that review. Meanwhile the review-independent
phase-3 groundwork is in: pure engine maths with tests (`src/engine/{geo,tectonics,seismic}`), PB2002 boundaries
bundled (`scripts/fetch-static.mjs`), and source findings in docs/DATA-SOURCES.md. The owner downloaded the GAGE NAM14
velocity release; it is normalized into `data/gnss/` by `scripts/import-velocities.mjs` (CC BY 4.0 under the GAGE Data License, attribution text in its index). GVP tables are bundled too (`scripts/fetch-gvp.mjs`), cited per the GVP How To Cite page. Phase 3 is under way (2026-11-09): the week-8 Plate Motion Explorer and the week-5 volcano overlay are built on the bundled data (spec deliverables 5 and 11's overlay); the labs, Learn texts, self-checks, the GPlates age slider, the volcano model and the seismic work wait on the review. Weeks 5 and 8 to 18 are scaffolded (2026-11-09): plan outlines in `src/app/weeks/scaffold.tsx`, shown as Draft on Home; building a week means adding its folder and removing its number from DRAFT in `src/app/weeks.ts`. Basemap decided 2026-11-08: self-hosted Protomaps extract, built by `scripts/build-basemap.sh` and named by `VITE_BASEMAP_URL`; the owner builds and uploads the folder before launch. Also in:
map line layers and arrows, `src/app/sim/` Sliders and Plot, GPlates adapters, nearest-boundary checker rule. Waiting
on the review: the volcano model's empirical relation, the travel-time table source, the teaching earthquakes for the
seismograms, the reconstruction model beyond 250 Ma, and all week content and labs.

## Then
Ask Claude Code to draft docs/specs/phase-2-earth-materials.md from docs/PLAN.md before any phase-2 code, and review it the same way.
