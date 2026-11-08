# Data sources

Findings about public APIs: what was checked, when, and anything unclear or changed.

## USGS Earthquake GeoJSON summary feeds

Checked 2026-11-07. `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_{hour,day,week,month}.geojson`. Open, no key, CORS allowed, updated about every minute. Feature `geometry.coordinates` is `[lon, lat, depth_km]`; `properties.mag`, `place` and `depth` can be null. The 30-day all-quakes feed held 9,982 features, 6.9 MB raw and 2.2 MB after `usgs-quakes.normalize`. Four cached ranges fit under localStorage's usual 5 MB, but not with much room: see the ponytail note in `src/app/data/snapshot.ts`.

## OpenStreetMap raster tiles

Used 2026-11-08 as the basemap in both engine prototypes (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`). The OSM
tile usage policy asks that heavy or public use go elsewhere; before launch, switch the basemap to a permitted or
self-hosted source (Natural Earth raster, or a vector style on a hosted provider) and keep the attribution.

## Phase-3 probes (2026-11-08)

- GPlates Web Service `reconstruct_points` (MULLER2019) answers open HTTP GET with GeoJSON. Open, no key.
- USGS FDSN event service (`earthquake.usgs.gov/fdsnws/event/1/query?format=geojson`) answers; event detail carries focal mechanisms where available.
- IRIS FDSN dataselect (`service.iris.edu/fdsnws/dataselect/1`) reachable; waveforms for teaching events to be fetched by script and bundled.
- Bird (2003) PB2002 plate boundaries as GeoJSON reachable from the open `tectonicplates` repository (MIT; data public domain).
- Smithsonian GVP web-services page returned HTTP 403 to a plain client. Unresolved: try with a browser user agent or the data downloads, and record the terms before using it.
- EarthScope GNSS velocities: access and redistribution terms still to confirm, as the plan's open question says.
