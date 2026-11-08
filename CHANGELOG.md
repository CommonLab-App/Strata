# Changelog

## Unreleased

- Scaffold copied from Valence: Vite, React, hash router, Tailwind, shadcn, first-paint theme script, architecture lint rules (network only in `src/data/adapters/`).
- Versioned localStorage progress with per-week entries and data-snapshot entries; Home lists the eighteen weeks; Settings and About pages.
- Data adapter interface and `getSnapshot` cache (TTL per adapter, fetched_at and source_url on every snapshot).
- `usgs-quakes` adapter over the USGS GeoJSON summary feeds, with `scripts/demo-quakes.mjs`.
- Globe engine wrapper (`src/map/`) with CesiumJS and MapLibre GL prototypes, a bench page at `/bench/:engine`, `npm run bench`, and the comparison in `docs/DECISIONS.md`.
