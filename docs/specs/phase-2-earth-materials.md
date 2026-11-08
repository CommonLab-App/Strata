# Phase 2 spec — Earth materials

Goal: a learner identifies minerals and rocks the way an intro lab does, on a tray of unknowns with the usual bench
tools, against a key they can read, and sees the crystal structure behind each mineral. Covers weeks 2, 3, 4, 6 and 7
of docs/PLAN.md. Week 5 (volcanoes) and the volcano half of week 4 are phase 3.

Gate: all five identification labs save a worksheet, score it, and reproduce the same unknowns and the same score
from the stored entry after a reload.

## What phase 1 gives us

- Week shell with Learn / Explore / Lab / Self-check, per-week localStorage entry, `useWeekProgress`, self-check
  component and grading, `STATUS_LABEL`, Home track (`src/app/weeks.ts`, `hasPage` lists the built weeks).
- Pure-folder lint: `src/engine/**` may not touch React, the DOM, the network, the clock or `Math.random`. Everything
  that decides an answer in this phase lives there.
- Adapter + snapshot cache for live data. Phase 2 needs no live source (see Data below), so nothing new there.

## Deliverables

1. **Sample library** under `data/samples/`: `minerals.json` (about 60), `rocks.json` (about 40), each entry with a
   stable string id, properties, a cited source per value set, and image credits. Validated by a zod schema and a test.
2. **Crystal structures**: about 20 CIF files under `data/cif/` fetched from the Crystallography Open Database by
   `scripts/fetch-cif.mjs`, which records COD id, URL and fetch date in `data/cif/index.json`. A pure CIF parser and
   unit-cell builder in `src/engine/crystal/`. A Three.js viewer in `src/app/inspector/scene/`, lazily loaded.
3. **Mineral Inspector** (`/explore/minerals`, `/explore/minerals/:id`): list and search, a card per mineral with its
   properties and sources, the crystal viewer, and the property key (filter by hardness, streak, luster, cleavage,
   colour, density) that narrows the list live.
4. **Rock Inspector** (`/explore/rocks`, `/explore/rocks/:id`): list by class (igneous, sedimentary, metamorphic), a
   card per rock with texture, composition, formation environment and sources, photos, and the three classification
   grids as interactive figures (igneous texture × composition; sedimentary grain size × composition; metamorphic
   foliation × grade).
5. **Identification lab bench** (`src/app/lab/IdBench.tsx` + `src/engine/idlab/`): a tray of unknowns drawn by seed
   from the library, a toolbox, a worksheet whose columns fill as tests are run, the key alongside, and a checker.
   One component configured five ways.
6. **Weeks 2, 3, 4, 6, 7** wired into `WEEK_CONTENT`: Learn text with linked reading, Explore pane pointing into the
   inspectors with that week's filter, the lab, ten self-check questions each in `data/self-checks/week-0N.json`.
7. **Turntable videos**: a one-minute recording of each hand sample on a turntable, made by Panda, imported by
   `scripts/import_sample.py recording.mp4 --id <sample-id>` into `public/media/samples/<id>/` as a silent H.264 MP4
   (at most 1280 wide, 30 fps, faststart), a poster frame and a `meta.json`. The script drops every tag in the
   source (phone recordings carry GPS, device and time fields) and refuses the file if any survive. `public/media/`
   is not in git and is copied to the server with the build. A provenance tag, by default the year and
   `stratalab.app` (`--tag` to change it), is drawn small into the bottom-right of every frame and kept as the
   file's one `comment` tag: a mark of origin, not a copyright notice, so it survives screenshots and copies alike.
   The library entry holds
   `turntable: { file, poster, seconds }`. The card shows the video; the lab tray shows the poster and, when an
   unknown is selected, the video, with horizontal drag scrubbing its time so dragging turns the sample. Where a
   sample has no video yet, a CC-licensed Wikimedia Commons photo stands in, with author, licence and source URL in
   the entry; credits roll up on the About page. This settles the plan's open question: Panda's own recordings
   first, Commons photos as fallback, procedural textures never. 3D hand samples as glTF are a stretch.
8. ESLint: restore Valence's rule that Three.js is imported only under a `scene/` folder, and add `src/engine/**` to
   the lint-rules test for it.

## Sample library

### Minerals (`data/samples/minerals.json`)

Fields per entry:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | stable, kebab-case, e.g. `quartz`, `plagioclase-feldspar` |
| `name`, `formula` | string | formula with subscripts as plain digits, rendered by the UI |
| `group` | enum | silicate (framework, sheet, chain, isolated), carbonate, oxide, sulfide, sulfate, halide, native, phosphate |
| `hardness` | `[min, max]` | Mohs |
| `streak` | string | colour as the key uses it |
| `luster` | enum | metallic, submetallic, vitreous, pearly, greasy, silky, resinous, dull, earthy, adamantine |
| `cleavage` | object | `{ directions: 0..6, quality: none/poor/good/perfect, angles?: string }` |
| `fracture` | enum | conchoidal, uneven, splintery, hackly, none |
| `colour` | string[] | common colours |
| `density` | `[min, max]` | g/cm³ |
| `crystalSystem` | enum | the seven systems |
| `diagnostic` | object | `{ acid?: 'fizzes' / 'fizzes-powdered' / 'none', magnetic?: boolean, taste?: 'salty', feel?: 'greasy' / 'soapy', other?: string }` |
| `habit` | string[] | |
| `cif` | string? | id into `data/cif/index.json` |
| `images` | `{ file, author, licence, source }[]` | |
| `sources` | `{ title, url, accessed }[]` | the references the values were read from |

Values are read from open references and the reference is recorded: the Handbook of Mineralogy (Mineralogical
Society of America, open PDFs), webmineral.com, Mindat (properties pages), and the open textbook *An Introduction to
Geology*. No text is copied; the entry holds values, not prose. A `describe` step is not needed: the UI renders the
fields.

The list, roughly what an intro lab tray holds: quartz, orthoclase, plagioclase, muscovite, biotite, hornblende,
augite, olivine, garnet, calcite, dolomite, gypsum, halite, fluorite, apatite, corundum, topaz, talc, kaolinite,
chlorite, serpentine, epidote, staurolite, kyanite, sillimanite, andalusite, tourmaline, beryl, zircon, sphalerite,
galena, pyrite, chalcopyrite, magnetite, hematite, limonite/goethite, bornite, graphite, sulfur, copper, gold (native,
as a card only), barite, malachite, azurite, aragonite, siderite, rhodochrosite, bauxite (as a rock card too),
limonite, chromite, ilmenite, rutile, cassiterite, molybdenite, cinnabar, stibnite, pyrrhotite, arsenopyrite, opal,
chalcedony/agate, obsidian (rock, cross-referenced).

### Rocks (`data/samples/rocks.json`)

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `name` | string | |
| `class` | enum | igneous, sedimentary, metamorphic |
| `texture` | object | igneous: `{ grain: phaneritic / aphanitic / porphyritic / glassy / vesicular / pyroclastic, grainSizeMm?: [min, max] }`; sedimentary: `{ kind: clastic / chemical / biochemical, grainSizeMm?, sorting?, rounding?, cement? }`; metamorphic: `{ foliated: boolean, grade: low / medium / high, texture: slaty / phyllitic / schistose / gneissic / granoblastic / hornfelsic }` |
| `composition` | object | igneous: `{ silica: felsic / intermediate / mafic / ultramafic, minerals: id[] }`; sedimentary: `{ minerals: id[], clasts?: string }`; metamorphic: `{ indexMinerals: id[], parent: id[] }` |
| `formation` | string[] | environment keywords, not prose |
| `related` | object | igneous: extrusive/intrusive twin; metamorphic: parent rock; sedimentary: lithified-from |
| `images`, `sources` | | as minerals |

About 40: granite, granodiorite, diorite, gabbro, peridotite, rhyolite, dacite, andesite, basalt, obsidian, pumice,
scoria, tuff, pegmatite, porphyry; conglomerate, breccia, sandstone (quartz arenite, arkose, greywacke), siltstone,
shale, mudstone, limestone (fossiliferous, oolitic, micrite, chalk), coquina, dolostone, chert, rock salt, rock
gypsum, coal, travertine; slate, phyllite, schist (mica, garnet), gneiss, migmatite, marble, quartzite, hornfels,
amphibolite, serpentinite, anthracite.

### Crystal structures (`data/cif/`)

CIFs from the Crystallography Open Database (open data, CC0). `scripts/fetch-cif.mjs <cod-id> <mineral-id>` downloads
`https://www.crystallography.net/cod/<id>.cif`, stores it, and appends `{ mineral, cod, url, fetched }` to
`data/cif/index.json`. Twenty to start: quartz, orthoclase, albite, anorthite, muscovite, biotite (annite), hornblende
(a tremolite or pargasite entry), diopside, forsterite, almandine, calcite, dolomite, gypsum, halite, fluorite,
apatite, corundum, talc, pyrite, galena, magnetite, hematite, graphite. Each inspector card links the COD page.

`src/engine/crystal/`: `parseCif(text)` (cell lengths and angles, space-group symmetry operations as `_symmetry_equiv_pos_as_xyz`
or `_space_group_symop_operation_xyz`, atom sites with fractional coordinates and element), `buildCell(cif, { repeat })`
applying the symmetry operations and deduplicating, converting fractional to Cartesian, and `bonds(atoms, cutoffs)`
by covalent-radius sums with tolerance. Pure, deterministic, unit-tested on quartz and halite against known atom
counts and bond lengths (Si–O about 1.61 Å, Na–Cl 2.82 Å).

## Mineral Inspector

Learn sources (week 2 and 3 Learn panes link, never copy): *An Introduction to Geology* chapters 3 (Minerals) and 4
(Igneous processes); Mindat's and webmineral's pages per mineral; the Handbook of Mineralogy PDF per mineral; Wikipedia
for silicate structure families.

Explore interactions:

- List with search by name and formula, grouped by `group`; a card per mineral.
- Card: properties table, each row with its source footnote; the crystal viewer; photos with credits; "Compare"
  adds the mineral to a side-by-side tray of up to four (week 3's quartz / feldspar / mica / olivine comparison).
- Crystal viewer: rotate, zoom, toggle unit cell outline, toggle bonds, toggle 1×1×1 / 2×2×2 repeat, colour by
  element with a legend, a "polyhedra" toggle for silicates (SiO₄ tetrahedra drawn as faces) because the silicate
  families are taught by tetrahedron linkage.
- Property key: controls for hardness (a two-handle range), streak, luster, cleavage count, colour, density range,
  and the diagnostics (acid, magnet). The list narrows live and shows the count; "clear" resets. The same key
  component sits beside the lab tray.

## Rock Inspector

Learn sources: *An Introduction to Geology* chapters 4, 5 (Weathering and sedimentary rocks), 6 (Metamorphic rocks);
Wikipedia for the rock cycle and Bowen's reaction series; USGS pages on rock types.

Explore interactions:

- List by class, a card per rock with texture, composition, formation keywords, the related rocks, photos.
- Igneous grid: texture (rows) × silica (columns); every cell a rock; tap a cell to open it. Bowen's reaction series
  drawn alongside as a figure from data (`data/figures/bowen.json`: the two branches and the order), with the
  minerals linked into the Mineral Inspector.
- Sedimentary grid: clastic by grain size on one axis, chemical/biochemical by composition on the other.
- Metamorphic grid: foliated by grade, non-foliated by parent; index minerals per grade linked to the Mineral
  Inspector. Week 7's "P–T path" is a static pressure–temperature figure from `data/figures/pt-grid.json` (facies
  fields, approximate boundaries as published in the open textbook) with the rock's field highlighted; tapping a
  field lists the rocks in it. Not a simulation.

## Identification labs

One bench, five configurations. The engine is `src/engine/idlab/`; the component `src/app/lab/IdBench.tsx`.

### Engine

- `draw(config, seed)`: picks `config.count` distinct sample ids from `config.pool` with a seeded RNG (mulberry32, as
  phase 1's synthetic points), fixing the tray for that seed. Stored progress holds the seed, never the ids; a change
  to the pool or the draw means a version bump (a `*-version.test.ts` per lab pins the draw for seed 1, as Valence).
- `runTest(sample, tool)`: the observation a tool yields on a sample, from the library entry. Tools and what they
  yield:

  | Tool | Yields | Minerals | Rocks |
  | --- | --- | --- | --- |
  | Hand lens | luster, colour, habit / texture | yes | yes (grain size, sorting, rounding, foliation) |
  | Streak plate | streak | yes | no |
  | Glass plate, nail, penny, fingernail | hardness bracket (one bound per tool) | yes | no |
  | Cleavage check (rotate under light) | cleavage directions and quality, or fracture | yes | no |
  | Dilute acid | fizz / fizz when powdered / none | yes | yes (calcite cement, limestone, marble) |
  | Magnet | attracted / not | yes | no |
  | Balance + cylinder | density (two readings with a small seeded reading error, as Valence's density lab) | yes | no |
  | Grain gauge | grain size class, sorting, rounding | no | sedimentary, igneous |

  Each test appends `{ tool, result }` to that unknown's record. Results are the library values, never free text,
  and the hardness bracket narrows from both sides as more scratch tools are used.
- `candidates(record, pool)`: the library entries consistent with every result so far (the key the learner sees next
  to the tray). Consistency rules: hardness bracket overlaps the entry's range; streak, luster, cleavage count and
  fizz match exactly; colour is advisory (never excludes); density overlaps.
- `score(config, record, answer)`: for each unknown, `correct` (answer id equals the drawn id) and `sufficient` (the
  tests run would have left at most `config.sufficiency` candidates, default 2, whether or not the answer is right).
  Lab score = correct count; the worksheet also shows sufficiency per row, and the stored entry keeps both.
- Rock labs replace tools with the grid: the learner places the unknown on the grid cell (texture × composition) and
  names it; `score` checks the cell and the name separately.

### Bench (UI)

Tray of `count` numbered unknowns with a photo each; tap one to select; toolbox buttons run a test and show its
result with a short, reduced-motion-aware reveal (a streak mark appears, the glass is or is not scratched, the
drop fizzes); the worksheet below the tray has one row per unknown and one column per observation; the key beside it
narrows as results arrive; a name is chosen from the key (not typed) so answers are ids. "Check" scores and locks the
row; "New tray" draws a new seed and keeps the old score as the week's best. Keyboard: unknowns and tools are buttons,
the worksheet is a table with headers.

### The five labs

| Week | Lab | Pool | Count | Tools | Worksheet columns |
| --- | --- | --- | --- | --- | --- |
| 2 | Mineral ID I | 20 common minerals, no diagnostic-only ones | 12 | hand lens, streak, hardness set, cleavage | colour, luster, streak, hardness, cleavage, name |
| 3 | Mineral ID II | all minerals with photos | 15 | all mineral tools | the above + acid, magnet, density, name |
| 4 | Igneous ID | igneous rocks | 8 | hand lens, grain gauge | grain texture, colour index, grid cell, name |
| 6 | Sedimentary ID | sedimentary rocks | 8 | hand lens, grain gauge, acid | kind, grain size, sorting, rounding, cement/fizz, grid cell, name |
| 7 | Metamorphic ID | metamorphic rocks | 8 | hand lens, acid | foliated, texture, grade, index minerals seen, parent, grid cell, name |

### Stored entry

The per-week entry (`week:0N`, version 1 for these weeks) gains `lab: { seed, records, answers, checked, best }` with a
per-lab zod schema in the engine; `status` stays derived by `withStatus` (completed when checked and the self-check
taken). Week 1's shape is untouched.

## Weeks 2 to 7 content

Each week: Learn (our words, four to six short paragraphs, linked reading), Explore (the inspector opened with that
week's filter: week 2 the crystal viewer, week 3 the key and compare tray, week 4 the igneous grid and Bowen, week 6 the
sedimentary grid, week 7 the metamorphic grid and P–T figure), Lab (above), Self-check (ten questions, same JSON
shape as week 1, graded by the existing `grade`). Home shows weeks 2, 3, 4, 6, 7 as built; week 5 stays "Planned"
until phase 3.

## Recording guidelines

For the turntable videos, so that the set looks like one set and the import needs no hand work:

- Same turntable speed, one full turn in about 20 to 30 seconds, recorded for one minute (two to three turns).
- Same background (a plain neutral card), same lamp position, camera on a tripod at the same height and distance,
  so size is comparable between samples; a small scale bar or coin in frame is welcome.
- Nothing in frame that names a place or an organisation: no labelled drawers, room signs, lanyards, handouts or
  sample tags with catalogue numbers that encode a course. The script strips the file's metadata, but it cannot
  strip what is in the picture.
- Landscape, 1080p or better, phone is fine. Name the file as you like; the sample id is given to the script.
- Drop raw files in `incoming/` (not committed) and run `scripts/import_sample.py incoming/<file> --id <id>`; use
  `--start`/`--end` to trim handling at either end.

## Data

No live source. Everything is in the repo: the library JSON, the CIFs with their COD provenance, the figures, the
photos with their credits. The snapshot cache is unused this phase. The adapter table in docs/DATA-SOURCES.md gains
an entry for COD (open data, no key, `https://www.crystallography.net/cod/<id>.cif`) and one for Wikimedia Commons
(per-file licence recorded; only CC0, CC BY and CC BY-SA files accepted).

## Acceptance tests

- `npm test` passes; includes: library schema validation (every id unique, every referenced mineral id exists, every
  image file exists, every entry has at least one source); CIF parser and cell builder on quartz and halite;
  `draw` determinism and distinctness; `candidates` narrowing on fixed records; `score` on right, wrong and
  insufficient cases; a version test per lab pinning seed 1's draw; week self-check files valid.
- Fresh browser: open each of the five labs, run enough tests on one unknown to narrow the key to one, name it,
  check it, see the row scored, reload, see the same tray, results and score.
- Crystal viewer renders quartz with the expected atom count for a 1×1×1 cell and toggles polyhedra.
- Lighthouse mobile performance on `/#/explore/minerals/quartz` stays at or above 80 on a desktop with a GPU (the
  Three.js chunk loads lazily after the card's text paints, as the globe does).
- `grep -ri` for institution, campus and course strings returns nothing; no library entry mentions a place.
- Every imported video's `meta.json` exists, the MP4 has no tags beyond brand and encoder, and every Commons photo has
  author, licence and source; About lists the photo credits.

## Out of scope for phase 2

Volcano Lab and the volcano half of week 4 (phase 3). Macrostrat column for week 6 (phase 4, with the Macrostrat
adapter). Surface Sandbox weathering (phase 5). glTF hand samples, thin sections, fossil ID. Procedural textures.
