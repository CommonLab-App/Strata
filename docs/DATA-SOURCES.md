# Data sources

Findings about public APIs: what was checked, when, and anything unclear or changed.

## USGS Earthquake GeoJSON summary feeds

Checked 2026-11-07. `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_{hour,day,week,month}.geojson`. Open, no key, CORS allowed, updated about every minute. Feature `geometry.coordinates` is `[lon, lat, depth_km]`; `properties.mag`, `place` and `depth` can be null. The 30-day all-quakes feed held 9,982 features, 6.9 MB raw and 2.2 MB after `usgs-quakes.normalize`. Four cached ranges fit under localStorage's usual 5 MB, but not with much room: see the ponytail note in `src/app/data/snapshot.ts`.
