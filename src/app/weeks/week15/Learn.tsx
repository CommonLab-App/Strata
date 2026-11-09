const link = 'underline underline-offset-4'

/** Week 15: ice, wind and waves, and the shorelines that record a moving sea. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="ice-heading">
        <h2 id="ice-heading" className="mb-1 text-lg font-medium">
          Glaciers
        </h2>
        <p>
          Where more snow falls in winter than melts in summer, it compacts to ice and the ice flows under its own
          weight. A valley glacier plucks rock from its bed and grinds it with the debris it carries, deepening and
          widening the river valley it occupies into a U-shaped trough with a flat floor and steep walls; tributary
          valleys are left hanging above it, and the head of the valley is carved into a bowl, a cirque. The ice
          drops its load where it melts, in ridges of unsorted debris called moraines and in boulders carried far
          from their source, erratics. Continental ice sheets did the same across whole regions in the last ice age.
        </p>
      </section>
      <section aria-labelledby="wind-heading">
        <h2 id="wind-heading" className="mb-1 text-lg font-medium">
          Wind and waves
        </h2>
        <p className="mb-2">
          Wind can lift only sand and finer grains, so it sorts as it goes: sand bounces along the ground into dunes
          whose steep slip face points downwind, while dust travels far and settles as loess. Wind-blown sand
          polishes and facets stones at the surface. Deserts are shaped more by rare floods than by wind, but the
          wind leaves the clearest signature.
        </p>
        <p>
          Waves do the work on coasts. They cut cliffs and planed-off platforms where the land is high, build
          beaches and spits where there is sand, and shift it along the shore as longshore drift. Sea level is not
          fixed: it stood more than a hundred metres lower when the ice sheets were at their largest, and the
          shorelines and drowned valleys of today record its return.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/14-glaciers/" rel="noreferrer">
              An Introduction to Geology, chapter 14: Glaciers
            </a>
            ,{' '}
            <a className={link} href="https://opengeology.org/textbook/13-deserts/" rel="noreferrer">
              chapter 13: Deserts
            </a>{' '}
            and{' '}
            <a className={link} href="https://opengeology.org/textbook/12-coastlines/" rel="noreferrer">
              chapter 12: Coastlines
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/U-shaped_valley" rel="noreferrer">
              U-shaped valley
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Past_sea_level" rel="noreferrer">
              Past sea level
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
