import { PageHeader } from '@/app/PageHeader'

const link = 'underline underline-offset-4'

export function About() {
  return (
    <>
      <PageHeader title="About" />
      <figure className="mb-6 max-w-prose">
        <img src={`${import.meta.env.BASE_URL}brand/stratalab-hero-block-labelled-light.svg`} alt="A block diagram of five sedimentary beds cut by a normal fault, with the beds, the fault and a dike labelled" className="w-full rounded-lg dark:hidden" />
        <img src={`${import.meta.env.BASE_URL}brand/stratalab-hero-block-labelled-dark.svg`} alt="" className="hidden w-full rounded-lg dark:block" />
        <figcaption className="mt-1 text-sm text-muted-foreground">Deep time, close up: the mark and the colours of StrataLab come from a faulted stack of beds.</figcaption>
      </figure>
      <div className="grid max-w-prose grid-cols-[minmax(0,1fr)] gap-6 break-words">
        <section aria-labelledby="independence-heading">
          <h2 id="independence-heading" className="mb-1 text-lg font-medium">
            Independent project
          </h2>
          <p>
            StrataLab is an independent personal project for anyone learning physical geology. It is not an official tool
            of any school, has no connection to any school's systems or student records, and does not replace field
            work or a laboratory course.
          </p>
        </section>

        <section aria-labelledby="privacy-heading">
          <h2 id="privacy-heading" className="mb-1 text-lg font-medium">
            Your data
          </h2>
          <p>
            StrataLab has no accounts and no server of its own. It collects no personal information and uses no analytics.
            Your progress and settings are stored only in this browser, and you can export or clear them in Settings.
            Live data is fetched directly from the public sources below and cached in this browser for a short time.
          </p>
        </section>

        <section aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="mb-1 text-lg font-medium">
            Data sources
          </h2>
          <p>
            Every live layer names its source and the time its data was fetched. None of the publishers below is
            connected with StrataLab or has reviewed it.
          </p>
          {/* ponytail: one list, extended as adapters are added. */}
          <ul className="mt-2 list-disc pl-5">
            <li>
              Earthquakes: the{' '}
              <a className={link} href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" rel="noreferrer">
                USGS Earthquake Hazards Program GeoJSON feeds
              </a>
              .
            </li>
            <li>
              Plate motion: GNSS station velocities from the NSF NGF data archive operated by{' '}
              <a className={link} href="https://www.earthscope.org/" rel="noreferrer">
                EarthScope Consortium
              </a>{' '}
              (NSF award 2435260), under{' '}
              <a className={link} href="https://www.unavco.org/data/policies_forms/data-policy/data-license.html" rel="noreferrer">
                CC BY 4.0
              </a>
              . StrataLab keeps one solution per station, drops station names and converts to mm/yr.
            </li>
            <li>
              Plate boundaries: the PB2002 model of Bird (2003), from the{' '}
              <a className={link} href="https://github.com/fraxen/tectonicplates" rel="noreferrer">
                tectonicplates
              </a>{' '}
              GeoJSON under ODC-BY 1.0; StrataLab merges steps of one boundary class into lines.
            </li>
            <li>
              Volcanoes: the Volcanoes of the World database (v. 5.4.0, 7 Aug 2026) of the{' '}
              <a className={link} href="https://volcano.si.edu/" rel="noreferrer">
                Global Volcanism Program, Smithsonian Institution
              </a>
              , compiled by Venzke, E.,{' '}
              <a className={link} href="https://doi.org/10.5479/si.GVP.VOTW5-2026.5.4" rel="noreferrer">
                doi 10.5479/si.GVP.VOTW5-2026.5.4
              </a>
              ; StrataLab keeps positions, types and dated eruptions and links each volcano's own page.
            </li>
            <li>
              Geologic time scale: international eras and periods from{' '}
              <a className={link} href="https://macrostrat.org/" rel="noreferrer">
                Macrostrat
              </a>{' '}
              (CC BY 4.0).
            </li>
            <li>
              Elevation: three areas from the{' '}
              <a className={link} href="https://registry.opendata.aws/terrain-tiles/" rel="noreferrer">
                Terrain Tiles on AWS Open Data
              </a>{' '}
              (Tilezen; built from the USGS 3DEP, SRTM and other public sources), decoded to height grids.
            </li>
            <li>
              Crystal structures: CIF files from the{' '}
              <a className={link} href="https://www.crystallography.net/cod/" rel="noreferrer">
                Crystallography Open Database
              </a>
              , placed in the public domain by their contributors; each structure links its COD entry.
            </li>
            <li>
              Rivers and groundwater: gauges, discharge and well levels from the{' '}
              <a className={link} href="https://waterservices.usgs.gov/" rel="noreferrer">
                USGS Water Services
              </a>
              .
            </li>
            <li>
              Basemap: map data ©{' '}
              <a className={link} href="https://www.openstreetmap.org/copyright" rel="noreferrer">
                OpenStreetMap contributors
              </a>{' '}
              (ODbL), tiles built by{' '}
              <a className={link} href="https://protomaps.com/" rel="noreferrer">
                Protomaps
              </a>{' '}
              and served from StrataLab's own host, drawn with{' '}
              <a className={link} href="https://maplibre.org/" rel="noreferrer">
                MapLibre GL JS
              </a>
              .
            </li>
          </ul>
        </section>

        <section aria-labelledby="license-heading">
          <h2 id="license-heading" className="mb-1 text-lg font-medium">
            License
          </h2>
          <p>
            StrataLab is free and open source under the MIT License, the same license as its sibling project Valence. The
            source code is published alongside it.
          </p>
        </section>

        <section aria-labelledby="brand-heading">
          <h2 id="brand-heading" className="mb-1 text-lg font-medium">
            Typefaces
          </h2>
          <p>
            Headings are set in Zilla Slab, body text in Inter and data in JetBrains Mono, all under the SIL Open Font License; the
            licences are served beside the font files.
          </p>
        </section>

        <section aria-labelledby="ai-heading">
          <h2 id="ai-heading" className="mb-1 text-lg font-medium">
            AI assistance
          </h2>
          <p>
            StrataLab was built with the help of Claude, an AI assistant made by Anthropic, which wrote and reviewed code
            and documentation under the direction of the project's author.
          </p>
        </section>
      </div>
    </>
  )
}
