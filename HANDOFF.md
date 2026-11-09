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

## Status 2026-11-09

All eighteen weeks are built and every phase gate that can be checked here passes: `npm run build` (lint, 206
tests, types, bundle) and `npm run smoke` (headless Chromium over the globe panes). Phases 1 and 2 met their gates
with Lighthouse on a GPU machine (92 and 91). Phase 3 (weeks 5, 8, 9), phase 4 (10 to 12), phase 5 (13 to 16) and
the phase-6 extension weeks (17, 18) were built on 2026-11-09 against docs/WEEK-PLANS.md, which records for every
week what was assumed where a reviewer's decision was expected (viscosity relation, travel-time table and teaching
earthquakes, isotope ranges, elevation tile source and areas, stream-table rule, soil parameters, crater catalogue)
and what was left out (GPlates past 250 Ma, the real-volcano overlay, the Macrostrat map overlay, landslide and
resource layers, labelled landforms, Three.js block models, Mars craters). Each data source's terms are in
docs/DATA-SOURCES.md and credited on About.

Still owner work: build and upload the basemap folder (`scripts/build-basemap.sh`, `VITE_BASEMAP_URL`); run
Lighthouse on the week-8 Explore pane from a GPU machine (phase-3 gate item); the core mineral list; more
turntable videos; the GPU check of week 8 zoomed in. Still reviewer work: the Planka review cards, whose answers go
into docs/WEEK-PLANS.md and then into the code paths each entry names. Phase 6's remaining items are offline mode
(service worker), the accessibility pass and launch.

## Then
Ask Claude Code to draft docs/specs/phase-2-earth-materials.md from docs/PLAN.md before any phase-2 code, and review it the same way.
