# Changelog

## Unreleased

- Scaffold copied from Valence: Vite, React, hash router, Tailwind, shadcn, first-paint theme script, architecture lint rules (network only in `src/data/adapters/`).
- Versioned localStorage progress with per-week entries and data-snapshot entries; Home lists the eighteen weeks with their status; Settings and About pages.
- Data adapter interface and `getSnapshot` cache (TTL per adapter, fetched_at and source_url on every snapshot).
- `usgs-quakes` adapter over the USGS GeoJSON summary feeds, with `scripts/demo-quakes.mjs`.
- Globe engine wrapper (`src/map/`) on MapLibre GL, chosen over CesiumJS after a measured comparison (`docs/DECISIONS.md`).
- Week shell with Learn, Explore, Lab and Self-check sections and a progress chip; data footer under live layers.
- Week 1: Learn page with linked reading; Explore with the quake globe, time-range toggle, quake details and a largest-quakes list; sand-and-water lab worksheet; ten-question self-check with best score kept.
- `npm run bench`: Lighthouse mobile on the Explore pane, cold and warm, with a no-WebGL diagnostic switch.
