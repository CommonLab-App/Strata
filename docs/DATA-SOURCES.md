# Data sources

Findings about public APIs: what was checked, when, and anything unclear or changed.

## USGS Earthquake GeoJSON summary feeds

Checked 2026-11-07. `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_{hour,day,week,month}.geojson`. Open, no key, CORS allowed, updated about every minute. Feature `geometry.coordinates` is `[lon, lat, depth_km]`; `properties.mag`, `place` and `depth` can be null. The 30-day all-quakes feed held 9,982 features, 6.9 MB raw and 2.2 MB after `usgs-quakes.normalize`. Four cached ranges fit under localStorage's usual 5 MB, but not with much room: see the ponytail note in `src/app/data/snapshot.ts`.

## OpenStreetMap raster tiles

Used 2026-11-08 as the basemap in both engine prototypes (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`). The OSM
tile usage policy asks that heavy or public use go elsewhere. Decided 2026-11-08: self-host (docs/DECISIONS.md). The
production basemap is a zoom-limited extract of a Protomaps daily planet build (`build.protomaps.com/YYYYMMDD.pmtiles`,
139 GB, extracted by range requests with the `pmtiles` CLI; OpenStreetMap data under ODbL 1.0, attribution to
OpenStreetMap contributors and Protomaps) plus the Noto Sans glyphs and sprites from `protomaps/basemaps-assets`
(OFL), all served from the app's own host; `scripts/build-basemap.sh` builds the folder. The OSM raster tiles remain
the fallback when `VITE_BASEMAP_URL` is unset, for development only.

## Phase-3 probes (2026-11-08)

- GPlates Web Service `reconstruct_points` (MULLER2019) answers open HTTP GET with GeoJSON. Open, no key.
- USGS FDSN event service (`earthquake.usgs.gov/fdsnws/event/1/query?format=geojson`) answers; event detail carries focal mechanisms where available.
- IRIS FDSN dataselect (`service.iris.edu/fdsnws/dataselect/1`) reachable; waveforms for teaching events to be fetched by script and bundled.
- Bird (2003) PB2002 plate boundaries, `github.com/fraxen/tectonicplates` (`GeoJSON/PB2002_boundaries.json`, 226 kB, 241 LineStrings; `PB2002_steps.json`, 10 MB, 5824 steps). The repository licence is the **Open Data Commons Attribution 1.0** (not MIT as the spec first said; credit Bird 2003 and the repository). The boundaries file's `Type` field is empty; boundary kind comes from the steps file's `STEPCLASS` (OSR, CRB, OTF, CTF, SUB, OCB, CCB), so the fetch script must join steps to boundaries and keep only class and coordinates, about 300 kB.
- Smithsonian GVP: the GeoServer at `webservices.volcano.si.edu/geoserver/GVP-VOTW/ows` (WFS 2.0) answers a plain client with GeoJSON: `Smithsonian_VOTW_Holocene_Volcanoes` (1214 features: number, name, landform, primary type, last eruption year, country, region, lat, lon, elevation, tectonic setting, major rock type, photo link and credit), `Smithsonian_VOTW_Holocene_Eruptions` (11089: volcano number, eruption number, activity type, VEI max, start and end years), `E3WebApp_Eruptions1960` (2248). The response carries **no `Access-Control-Allow-Origin` header**, so a browser cannot fetch it from a static app: bundle both tables by script with provenance, as the spec's fallback says. The main site (`volcano.si.edu`, including the web-services and terms pages) returned a "site temporarily unavailable" 403 page all day; read the data-use terms there before the bundled file ships, and cite as the GVP asks (Global Volcanism Program, Smithsonian Institution, Volcanoes of the World database version in the response). Update later on 2026-11-08: `scripts/fetch-gvp.mjs` bundles both tables to `data/volcanoes/holocene.json` (439 kB: 1214 volcanoes, 11043 dated eruptions as [year, VEI, confirmed]); prose summaries, photos, country and region are left out and the card links to the GVP page. Resolved 2026-11-08 from the How To Cite page (`volcano.si.edu/gvp_cite.cfm`, pasted by the owner; the site answers browsers but serves other clients a 403 "temporarily unavailable" page): the database compilation is a product of United States government employees and falls under item 2 of the Intellectual Property Rights in Content section of the Smithsonian Terms of Use for GVP Content; the Smithsonian invites use "for personal, educational, and other non-commercial purposes". Minimum reference: "Global Volcanism Program, Smithsonian Institution" linked to the home page; formal citation Volcanoes of the World v. 5.4.0 (7 Aug 2026), doi 10.5479/si.GVP.VOTW5-2026.5.4, which is the version current when the tables were fetched. Both are in `data/volcanoes/index.json` and on About. Still unread: the Terms of Use page itself (item 2's exact wording); read it when the site answers.
- GPlates Web Service, update later on 2026-11-08: responses carry `Access-Control-Allow-Origin: *`, so the browser can call it live. `reconstruct/reconstruct_points` is tiny. `reconstruct/coastlines` at 100 Ma is 1.3 MB, too large to snapshot per age step in localStorage; `topology/plate_polygons` at 100 Ma is 247 kB and is what the age slider should draw. MULLER2019 covers 0 to 250 Ma; the plan's 540 Ma needs a different model (`model/list` offers merdith2021 and others), which is a content decision for the reviewers.
- EarthScope GNSS velocities: `gage-data.earthscope.org/archive/gnss/products/velocity/` lists the releases (latest `rel_231230`, with `cwu.final_nam14.20231230.vel` and others) to a plain client, but every file download redirects to `/login` (302), so an account token is required. The GAGE GeoServer (`web-services.unavco.org/geoserver`) returned 403. The GAGE metadata web service (`web-services.unavco.org/gps/metadata/sites/v1`) is open and gives station positions only. The old policy page URLs are gone and the EarthScope terms-of-service page covers the website, not the data. **Unresolved, and a decision for the project owner:** (a) one of us logs in once, downloads a velocity release file, and we bundle a teaching subset if the release's stated terms permit redistribution; or (b) the adapter stays live with a token kept out of the repo and no bundled data. Recorded instead of guessed, per the working agreement.
- EarthScope GNSS velocities, update later on 2026-11-08: the owner downloaded `cwu.final_nam14.20231230.vel` (release 2024-01-23, NAM14 frame, 6495 segments over 2194 stations) with their account. `scripts/import-velocities.mjs` normalizes it to `data/gnss/` keeping one segment per station (longest span), code, position, north/east/up velocities and uncertainties in mm/yr; the 16-character station names are dropped because some carry institution names. The file itself states no terms. Resolved 2026-11-08 (read with the owner): the GAGE data policy was retired on 2025-06-12 and replaced by the GAGE Data License (`unavco.org/data/policies_forms/data-policy/data-license.html`), under which "all data originating from EarthScope operated facilities" is CC BY 4.0, reuse and redistribution for any purpose permitted, with credit, a link to the data, the licence named, and changes indicated. The EarthScope terms of service cover the website only (respectful automated use; acknowledge the Consortium and sponsors) and the How To Cite page asks for "Data were accessed from the NSF NGF data archive operated by EarthScope Consortium (NSF award 2435260)." The licence page does not name derived products such as velocity solutions explicitly; we treat the facility's own combined solution as facility data. `data/gnss/index.json` now carries the licence, its URL and the attribution text, which the About page must show.

## EarthScope FDSN web services (2026-11-09)

`service.iris.edu` is retired (404 "This service has been retired"). The FDSN station and dataselect services answer
at `service.earthscope.org/fdsnws/{station,dataselect}/1/query`, open, no key; the `irisws/timeseries` service is gone,
but dataselect accepts `format=geocsv` and returns plain text samples, which `scripts/fetch-waveforms.mjs` reads. The
USGS catalogue is read from `earthquake.usgs.gov/fdsnws/event/1/query` (public domain). Waveform licence: the GAGE
Data License (CC BY 4.0) covers data from EarthScope-operated facilities, which includes the global network stations
(IU, IC, CU); contributed networks (JP, TW, PS, GE, NU here) carry their own terms, to confirm per network before the
public build; `data/seismograms/index.json` lists the networks used.

## Macrostrat time scale (2026-11-09)

`macrostrat.org/api/v2/defs/intervals?timescale=international%20{eras,periods}` answers openly, no key, and states
`"license": "CC-BY 4.0"` in the response. Bundled by `scripts/fetch-timescale.mjs` to `data/timescale/` with the
licence in its index; credited on About. The columns and map endpoints (phase 4, weeks 6 and 12) are still to probe.

## Terrain Tiles on AWS Open Data (2026-11-09)

`s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` answers openly with no key but sends no
`Access-Control-Allow-Origin` header, so a browser can draw a tile but not read its heights; the three week-12 areas
are therefore decoded by `scripts/fetch-terrain.mjs` and bundled under `data/terrain/`. The dataset is a Tilezen
compilation of public sources (USGS 3DEP, SRTM, GMTED2010, ETOPO1 and others); its registry page lists them and asks
for attribution, which About gives. Confirm the attribution wording against the registry before the public build.
