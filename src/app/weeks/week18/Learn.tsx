const link = 'underline underline-offset-4'

/** Week 18: geology off the Earth, and the course looked back on from there. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="planets-heading">
        <h2 id="planets-heading" className="mb-1 text-lg font-medium">
          Other worlds, same rules
        </h2>
        <p>
          Rock behaves the same everywhere; what differs is the ingredients. The Moon is small and cooled quickly:
          its surface is ancient highland crust pocked by craters and dark plains of basalt that flooded the largest
          basins, with no air or water to wear any of it away. Mars is larger and kept more heat: it has the solar
          system&rsquo;s biggest shield volcano, a canyon system that would span a continent, dunes, polar ice, and
          channels and layered sediments that record running water long ago, now preserved under a thin cold
          atmosphere. Earth, with plate tectonics, oceans and life, recycles its surface so fast that only a few
          large craters survive.
        </p>
      </section>
      <section aria-labelledby="counting-heading">
        <h2 id="counting-heading" className="mb-1 text-lg font-medium">
          Crater counting
        </h2>
        <p>
          Where no sample can be dated, the number of craters per unit area is the clock: a surface collects impacts
          at a rate that has been estimated from the lunar samples returned to Earth, so a denser crater population
          means an older surface. The method needs craters above a fixed size, because small ones are erased or
          saturated, and a surface large enough for the count to mean something. Relative ages come straight from
          the comparison; absolute ages need the calibrated rate.
        </p>
      </section>
      <section aria-labelledby="synthesis-heading">
        <h2 id="synthesis-heading" className="mb-1 text-lg font-medium">
          Looking back
        </h2>
        <p>
          Every week of this course was a way of reading time and process from material: minerals from their
          structure, rocks from their textures, plates from their motion, earthquakes from their waves, history from
          its layers and clocks, landscapes from the water, ice and wind that shaped them. On another planet the same
          reading applies with fewer helpers, which is the best test of whether the habits have taken.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://www.usgs.gov/centers/astrogeology-science-center" rel="noreferrer">
              USGS Astrogeology Science Center
            </a>{' '}
            and{' '}
            <a className={link} href="https://trek.nasa.gov/" rel="noreferrer">
              NASA Trek
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Planetary_geology" rel="noreferrer">
              Planetary geology
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Crater_counting" rel="noreferrer">
              Crater counting
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
