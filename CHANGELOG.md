# Changelog

## Unreleased

- Week 8 Explore, the Plate Motion Explorer: GNSS velocity arrows and the PB2002 boundaries on the globe, tap two stations for the motion between them (speed, direction, nearest boundary to the midpoint, a third arrow). Week 5 Explore: Holocene volcanoes beside the boundaries, a tap opens the GVP record. Both load their bundles with the pane; point layers take a colour; the globe start-up moved into `useGlobe`, shared with week 1. A test keeps every Explore caption free of risk words.
- Every week now has a page: weeks 5 and 8 to 18 are scaffolds built from a plan outline (`src/app/weeks/scaffold.tsx`) with an orientation paragraph, reading, the planned explorer and lab, and the data sources; Home marks them Draft and their self-check tab says it is not written yet.
- Dropped the OpenStreetMap preconnect hint from index.html: production serves its own basemap, and Lighthouse flagged the hint as unused on non-map pages.
- Basemap decided and wired: a self-hosted Protomaps PMTiles extract with its glyphs and sprites, folder named by `VITE_BASEMAP_URL`; `scripts/build-basemap.sh` builds it; OSM raster tiles stay the development fallback (docs/DECISIONS.md).
- Phase 3 groundwork, review-independent: great-circle helpers, relative plate motion with the lab tolerances, travel-time interpolation and a least-squares epicentre, all pure and unit-tested under `src/engine/`; PB2002 plate boundaries bundled with provenance by `scripts/fetch-static.mjs`; source probes for GVP, EarthScope and PB2002 recorded in docs/DATA-SOURCES.md. Then: GAGE NAM14 GNSS velocities (2194 stations) and the GVP Holocene volcano and eruption tables bundled by script, each with provenance (GNSS now CC BY 4.0 per the GAGE Data License of 2025-06-12, with attribution text in its index; GVP recorded as a work of United States government employees with the Volcanoes of the World v. 5.4.0 citation); About lists the GNSS, PB2002, GVP and COD attributions; map engine line layers and velocity arrows; the shared `Sliders` and SVG `Plot` under `src/app/sim/`; `gplates-points` and `gplates-plates` live adapters; the nearest-boundary rule for the week-8 checker.

Phase-2 gate met on the build machine 2026-11-08: all five identification labs save, score and reproduce their tray after a reload (docs/specs/phase-2-earth-materials.md); Lighthouse mobile on the quartz card 91 on the owner's GPU desktop, 2026-11-09 (docs/DECISIONS.md).

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
- Phase 2 begun: mineral library (48 species, 36 core, sourced values) with the two imported turntable specimens; 27 crystal structures from the Crystallography Open Database with provenance; CIF reader and unit-cell builder; identification-lab engine (seeded draw, bench tools, key narrowing, scoring with sufficiency).
- Mineral Inspector with search, property key, compare tray, cards with sourced values, turntable video and a lazily loaded Three.js crystal viewer with bonds, unit cell and silicate tetrahedra.
- Weeks 2 and 3: Learn text, Explore into the inspector, Mineral ID I (12 unknowns, basic tools) and Mineral ID II (15 unknowns, full toolbox), ten self-check questions each.
- Rock library (47 rocks, 30 core) with Bowen's series and metamorphic facies as data figures; Rock Inspector with the three classification grids; rock identification engine and bench; weeks 4, 6 and 7 with Learn text, labs and self-checks.
- StrataLab brand: tokens, Zilla Slab and JetBrains Mono, mark and lockups, icons, the labelled block diagram on About.
- Elements of the crust: the periodic table shaded by crustal abundance with Goldschmidt classes and links to the minerals that hold each element; Maps and data page of public services.
- `scripts/import_sample.py`: turntable video import with ffmpeg (H.264, 1080p, CRF 22, silent, all metadata stripped and verified, a provenance tag drawn into the frame and kept as the comment tag) for the phase-2 sample library.
