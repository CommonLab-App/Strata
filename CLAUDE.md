# Strata — project memory for Claude Code

Strata is a free, open-source browser app for self-learning introductory physical geology.
It is the geology counterpart of Valence (Panda's chemistry explorer, live at https://firetailfab.com/valence/).
Full plan: docs/PLAN.md. Per-module specs: docs/specs/. Work one spec at a time.

## Hard rules (never break these)
- No course numbers, institution names, campus names, or location data anywhere: code, data, docs, commits, UI copy.
- No school-system integration, no accounts, no login of any kind. Progress lives in the browser (localStorage), as in Valence.
- No server-side user data at all. Nothing leaves the browser except requests to public data APIs.
- No hand-written descriptions of real places or real events. Store the query, cache the response, link the source.
- Recent-event views (live quakes, floods) carry a one-line neutral caption + link to the official source. Never interpret risk.
- Free and open source, same license as Valence.
- Credit AI assistance (Claude) on the About page, as Valence does.

## Stack (decided)
- Front end: same framework, build tooling, and component conventions as Valence. Read the Valence repo (path below) first: README, package.json, src/ layout. Copy the structure.
- Storage: localStorage via the same storage module pattern as Valence. No database, no auth. Decided 2026-11-07.
- Hosting: static build served at https://firetailfab.com/strata/ (hash router, like Valence), base path configurable.
- Map/globe: one engine for the whole app. Decision pending; phase 1 prototypes both candidates (see docs/specs/phase-1-shell.md).
- 3D samples/crystals: Three.js. CIF parser for crystal structures, glTF for hand samples.
- Sims: plain TypeScript models + one shared slider/plot component. Never bury physics in UI components.
- Data: one adapter module per external source under src/data/adapters/, all implementing the same interface (fetch -> cache -> normalize). Cached snapshots live in localStorage, keyed by source + query, each carrying fetched_at and source_url.
- Sample library (minerals, rocks, fossils, volcanoes): JSON in the repo under data/ with stable string IDs. Images in the repo under public/ (CC-licensed or procedural).

## Valence reference
- Valence repo path: /home/winter/work/Valence (GitHub: https://github.com/zebadrabbit/Valence)
- Reuse, don't reinvent: app shell, routing, progress storage module, lab worksheet pattern, About/credits page. (Valence has no auth; neither does Strata.)

## Working agreements
- Build in the six phases in docs/PLAN.md. Each phase has a gate; do not start the next phase until the gate passes.
- Before coding a module, read its spec in docs/specs/ (write it first if missing). A spec lists: Learn sources, Explore interactions, Lab worksheet fields, checker rules, data adapter(s), acceptance tests.
- Lab answers must be reproducible: checkers recompute the expected answer from the same cached snapshot the learner saw.
- Mobile first. Live layers show their fetched_at time. Sample library and last snapshots work offline (service worker) by phase 6.
- Commit small and often, conventional commit messages, keep CHANGELOG.md.
- When a public API is unclear or has changed, stop and record the finding in docs/DATA-SOURCES.md instead of guessing.
