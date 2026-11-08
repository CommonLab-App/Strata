# Changelog

## Unreleased

Phase-1 gate met 2026-11-08: build, tests and the acceptance flow pass; Lighthouse mobile performance 92 on the Explore pane (docs/DECISIONS.md).

- Scaffold copied from Valence: Vite, React, hash router, Tailwind, shadcn, first-paint theme script, architecture lint rules (network only in `src/data/adapters/`).
- Versioned localStorage progress with per-week entries and data-snapshot entries; Home lists the eighteen weeks with their status; Settings and About pages.
- Data adapter interface and `getSnapshot` cache (TTL per adapter, fetched_at and source_url on every snapshot).
- `usgs-quakes` adapter over the USGS GeoJSON summary feeds, with `scripts/demo-quakes.mjs`.
- Globe engine wrapper (`src/map/`) on MapLibre GL, chosen over CesiumJS after a measured comparison (`docs/DECISIONS.md`).
- Week shell with Learn, Explore, Lab and Self-check sections and a progress chip; data footer under live layers.
- Week 1: Learn page with linked reading; Explore with the quake globe, time-range toggle, quake details and a largest-quakes list; sand-and-water lab worksheet; ten-question self-check with best score kept.
- `npm run bench`: Lighthouse mobile on the Explore pane, cold and warm, with a no-WebGL diagnostic switch.
- `public/robots.txt`; MapLibre's attribution link styled as a link.
- `scripts/import_sample.py`: turntable video import with ffmpeg (H.264, 720p, silent, all metadata stripped and verified, a provenance tag drawn into the frame and kept as the comment tag) for the phase-2 sample library.
