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

## Status 2026-11-10 (end of day)

All eighteen topics are built; `npm run build` (lint, 209 tests, types, bundle) and `npm run smoke` pass. The
learner sees topics, not weeks: `/#/topic/<slug>` (slugs in src/app/weeks.ts), page titles without a number, and
old `/week/<n>` links redirect. Internals keep the week names (folders, `WEEKS`, storage key `week:08`,
docs/WEEK-PLANS.md); the note on `WEEKS` says why. Core sets match the owner's hand samples (14 minerals, 21 rocks,
`core` flag in data/samples); the identification labs draw from them, weeks 2, 3, 4, 6 and 7 at stored-entry
version 2. Phase 6 offline mode is in (docs/specs/phase-6-polish.md) and seen activated on the live site. The
self-hosted Protomaps basemap is uploaded beside the app and live (`VITE_BASEMAP_URL` in `.env`; `basemap/` is
excluded from the deploy rsync). It exposed a layer-name clash that broke plate boundaries on the volcano and
plate-tectonics topics; fixed, waiting for a redeploy with the topic routes. Lighthouse on the plate-tectonics
Explore pane before the basemap: 71/96/96/100, below the phase-3 gate's 80; docs/DECISIONS.md has the reasoning and
the next measurement.

Owner work, also on the Planka digest card: redeploy (`scripts/deploy.sh`, from a terminal that holds the ssh key);
confirm boundaries draw on the two globes; check install and airplane mode; Lighthouse on
/#/topic/earth-system/explore and again on /#/topic/plate-tectonics/explore with the vector basemap; record the
turntable videos for the 35 core samples (`scripts/import_sample.py <video> --id <sample>`); the GPU check of the
plate-tectonics globe zoomed in. Reviewer work: the Planka review cards, whose answers go into docs/WEEK-PLANS.md and
then into the code paths each entry names. Phase 6 still owes the accessibility pass and launch.

## Then
Ask Claude Code to draft docs/specs/phase-2-earth-materials.md from docs/PLAN.md before any phase-2 code, and review it the same way.
