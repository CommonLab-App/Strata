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

## Status 2026-11-11 (overnight build)

All eighteen topics are built; `npm run build` (lint, 254 tests, types, bundle) and `npm run smoke` pass. New
overnight, on the owner's request and with their delegated decisions: a **Model tab** on six topics
(docs/specs/models.md, plan in docs/superpowers/plans/2026-11-10-models.md): looping block diagrams drawn as SVG in
the brand's cabinet-projection style, animated with CSS keyframes, each with variant buttons, a caption and
tappable labelled parts. Plate tectonics (divergent, subduction, collision, transform), earthquakes (normal,
reverse, strike-slip faults), volcanoes (shield, stratovolcano, cinder cone, caldera, cut open, plus a Three.js
turntable of the edifice from `src/engine/volcano/shape.ts`), streams (the three zones and four drainage patterns),
groundwater (artesian cross-section with three wells, infiltration zones, karst), and glaciers-deserts-coasts (five
agents of erosion before and after). Shared pieces in `src/app/models/` (draw helpers, keyframes, ModelTab); each
topic's `Model.tsx` is a lazy chunk. Reduced motion lands every loop on its end state. `scripts/model-shots.mjs`
screenshots every variant for review; `npm run smoke` no longer leaks preview servers.

Also live since the last note: topics replace weeks in routes and copy (`/#/topic/<slug>`, old links redirect);
the self-hosted basemap is uploaded and on; the plate-boundaries layer-name clash is fixed and deployed.

Owner work, also on the Planka digest card: look over the six Model tabs on the phone and the desktop (every
drawing and caption was reviewed in screenshots, not by the owner yet); redeploy; Lighthouse on
/#/topic/plate-tectonics/model on the GPU desktop (docs/DECISIONS.md 2026-11-11 says why the dev-box number does
not count); Lighthouse on /#/topic/earth-system/explore and /#/topic/plate-tectonics/explore with the vector
basemap; check install and airplane mode; record the turntable videos for the 35 core samples
(`scripts/import_sample.py <video> --id <sample>`); the GPU check of the plate-tectonics globe zoomed in; nineteen
stale `vite preview` processes from earlier smoke runs can be cleared with `pkill -f "vite preview"`. Reviewer
work: the Planka review cards, whose answers go into docs/WEEK-PLANS.md and then into the code paths each entry
names. Phase 6 still owes the accessibility pass and launch.

## Then
Ask Claude Code to draft docs/specs/phase-2-earth-materials.md from docs/PLAN.md before any phase-2 code, and review it the same way.
