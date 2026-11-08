const link = 'underline underline-offset-4'

/** Week 6: weathering, soil, and how sediment becomes sedimentary rock. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="weathering-heading">
        <h2 id="weathering-heading" className="mb-1 text-lg font-medium">
          Weathering and soil
        </h2>
        <p className="mb-2">
          Rock at the surface is out of place: it formed hot, deep or dry, and now sits in cool air and water.
          Mechanical weathering breaks it without changing it, by frost in cracks, by roots, by the release of
          pressure as the rock above is removed. Chemical weathering changes it: feldspar turns to clay, iron minerals
          rust, calcite dissolves. Quartz survives both, which is why beaches are made of it. Soil is what weathering
          leaves in place, mixed with life.
        </p>
        <p>
          The order in which minerals weather is Bowen's series read backwards: olivine goes first, quartz last.
        </p>
      </section>
      <section aria-labelledby="sediment-heading">
        <h2 id="sediment-heading" className="mb-1 text-lg font-medium">
          From sediment to rock
        </h2>
        <p className="mb-2">
          Loose grains are moved by water, wind and ice, sorted by size as they go, rounded as they knock together,
          and dropped where the current slows. Buried, they are compacted and cemented by minerals growing in the
          pores, usually calcite, silica or iron oxide. Clastic rocks are named by grain size, from conglomerate and
          breccia down through sandstone and siltstone to shale; sorting and rounding say how far and how long the
          grains travelled.
        </p>
        <p>
          Chemical and biochemical rocks precipitate from water or are built by living things: limestone from shells
          and reefs, chert from silica ooze, rock salt and gypsum from evaporating seas, coal from buried peat. Dilute
          acid tells calcite from everything else at once.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/5-weathering-erosion-and-sedimentary-rocks/" rel="noreferrer">
              An Introduction to Geology, chapter 5: Weathering, erosion and sedimentary rocks
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Sedimentary_rock" rel="noreferrer">
              Sedimentary rock
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Grain_size" rel="noreferrer">
              Grain size
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
