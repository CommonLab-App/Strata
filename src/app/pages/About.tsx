import { PageHeader } from '@/app/PageHeader'

const link = 'underline underline-offset-4'

export function About() {
  return (
    <>
      <PageHeader title="About" />
      <div className="grid max-w-prose grid-cols-[minmax(0,1fr)] gap-6 break-words">
        <section aria-labelledby="independence-heading">
          <h2 id="independence-heading" className="mb-1 text-lg font-medium">
            Independent project
          </h2>
          <p>
            Strata is an independent personal project for anyone learning physical geology. It is not an official tool
            of any school, has no connection to any school's systems or student records, and does not replace field
            work or a laboratory course.
          </p>
        </section>

        <section aria-labelledby="privacy-heading">
          <h2 id="privacy-heading" className="mb-1 text-lg font-medium">
            Your data
          </h2>
          <p>
            Strata has no accounts and no server of its own. It collects no personal information and uses no analytics.
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
            connected with Strata or has reviewed it.
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
              Basemap:{' '}
              <a className={link} href="https://www.openstreetmap.org/copyright" rel="noreferrer">
                OpenStreetMap contributors
              </a>
              , drawn with{' '}
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
            Strata is free and open source under the MIT License, the same license as its sibling project Valence. The
            source code is published alongside it.
          </p>
        </section>

        <section aria-labelledby="ai-heading">
          <h2 id="ai-heading" className="mb-1 text-lg font-medium">
            AI assistance
          </h2>
          <p>
            Strata was built with the help of Claude, an AI assistant made by Anthropic, which wrote and reviewed code
            and documentation under the direction of the project's author.
          </p>
        </section>
      </div>
    </>
  )
}
