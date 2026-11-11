const link = 'underline underline-offset-4'

/** Week 8: plates, boundaries, the evidence, and how motion is measured today. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="plates-heading">
        <h2 id="plates-heading" className="mb-1 text-lg font-medium">
          Plates and their boundaries
        </h2>
        <p className="mb-2">
          The outer shell of the Earth, the lithosphere, is cold and rigid and broken into a dozen large plates and
          many small ones. They ride on the warmer, slowly flowing mantle beneath and move a few centimetres a year,
          about the rate fingernails grow. Nearly all earthquakes, most volcanoes and the youngest mountains lie along
          the edges where plates meet.
        </p>
        <p>
          There are three kinds of edge. At a divergent boundary two plates pull apart and new oceanic crust fills the
          gap; the mid-ocean ridges are the longest mountain chain on the planet. At a convergent boundary plates
          push together: an oceanic plate sinks beneath another plate at a trench, or two continents crumple into a
          mountain belt. At a transform boundary plates slide past each other sideways and the crust is neither made
          nor destroyed.
        </p>
      </section>
      <section aria-labelledby="evidence-heading">
        <h2 id="evidence-heading" className="mb-1 text-lg font-medium">
          The evidence, then and now
        </h2>
        <p className="mb-2">
          The fit of the continents, matching rocks and fossils across oceans, and glacial scratches in places now
          near the equator were the first clues, but a mechanism was missing. Mapping the seafloor supplied it: a
          ridge with young crust at its crest and older crust on either side, recorded in stripes of reversed
          magnetism, showed the seafloor spreading. The oldest ocean floor is under 200 million years old; the
          continents carry rocks twenty times older.
        </p>
        <p>
          Today the motion is measured directly. Stations fixed to bedrock track satellite positioning signals for
          years, and their drift, millimetres per year, is the plate motion. A velocity has to be stated relative to
          something: in this topic&rsquo;s data the frame is the stable interior of the North American plate, so
          stations there read close to zero and the western edge shows the Pacific plate sliding past.
        </p>
      </section>
      <section aria-labelledby="relative-heading">
        <h2 id="relative-heading" className="mb-1 text-lg font-medium">
          Relative motion
        </h2>
        <p>
          What a boundary does depends on how the plates move relative to each other, not on either one alone. Take
          the velocity of one station from another, component by component, and the result is how the second moves
          as seen from the first. Its length is the relative speed; its direction, compared with the trend of the
          boundary between them, says whether they are pulling apart, converging, or sliding past.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/2-plate-tectonics/" rel="noreferrer">
              An Introduction to Geology, chapter 2: Plate tectonics
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Plate_tectonics" rel="noreferrer">
              Plate tectonics
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Satellite_geodesy" rel="noreferrer">
              Satellite geodesy
            </a>{' '}
            on Wikipedia.
          </li>
          <li>
            <a className={link} href="https://www.earthscope.org/" rel="noreferrer">
              EarthScope Consortium
            </a>
            , whose archive holds the station velocities drawn in Explore.
          </li>
        </ul>
      </section>
    </div>
  )
}
