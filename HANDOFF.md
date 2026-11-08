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

## Then
Ask Claude Code to draft docs/specs/phase-2-earth-materials.md from docs/PLAN.md before any phase-2 code, and review it the same way.
