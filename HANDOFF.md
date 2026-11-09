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

## Status 2026-11-09 (end of day)

All eighteen weeks are built; `npm run build` (lint, 208 tests, types, bundle) and `npm run smoke` pass. Core sets
match the owner's hand samples (14 minerals, 21 rocks, `core` flag in data/samples); the identification labs draw
from them, weeks 2, 3, 4, 6 and 7 at stored-entry version 2. Phase 6 offline mode is in: a Vite plugin builds
`sw.js` from `src/sw/worker.js`, the manifest makes the app installable (docs/specs/phase-6-polish.md). First deploy
to stratalab.app done with `scripts/deploy.sh` (target in the gitignored `.env`); the worker was seen activated on
the live site with the precache full. Lighthouse on the week-8 Explore pane: 71/96/96/100, below the phase-3 gate's
80; the reasoning and the next measurement (week-1 pane) are in docs/DECISIONS.md. The fixes that run produced
(icon file modes, `public/.htaccess` cache headers and manifest type, attribution contrast) are committed and wait
for a redeploy.

Owner work, also on the Planka digest card: redeploy; check install and airplane mode; Lighthouse on
/#/week/1/explore; build and upload the basemap (`scripts/build-basemap.sh`, `VITE_BASEMAP_URL`); record the
turntable videos for the 35 core samples (`scripts/import_sample.py <video> --id <sample>`); the GPU check of week 8
zoomed in. Reviewer work: the Planka review cards, whose answers go into docs/WEEK-PLANS.md and then into the code
paths each entry names. Phase 6 still owes the accessibility pass and launch.

## Then
Ask Claude Code to draft docs/specs/phase-2-earth-materials.md from docs/PLAN.md before any phase-2 code, and review it the same way.
