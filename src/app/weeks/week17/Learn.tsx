const link = 'underline underline-offset-4'

/** Week 17: how rock deforms, and the geometry used to describe it. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="deform-heading">
        <h2 id="deform-heading" className="mb-1 text-lg font-medium">
          Stress, strain and structures
        </h2>
        <p className="mb-2">
          Rock under stress deforms: elastically at first, then by flowing if it is hot and buried, or by breaking
          if it is cold and near the surface. Flowing layers fold. An anticline arches up with the oldest beds in
          its core; a syncline sags with the youngest in the core; where the hinge line is not horizontal the fold
          plunges, and its outcrop pattern closes in a V on the map. Breaking makes faults: normal faults where the
          crust stretches and the hanging wall drops, reverse and thrust faults where it shortens and the hanging
          wall rises, strike-slip faults where blocks slide past each other sideways. Mountain belts are the sum of
          these at a plate boundary, stacked by thrusts, folded and uplifted.
        </p>
      </section>
      <section aria-labelledby="stereonet-heading">
        <h2 id="stereonet-heading" className="mb-1 text-lg font-medium">
          The stereonet
        </h2>
        <p>
          Describing all this takes a way to record and compare directions. A plane has a strike and dip; a line has
          a trend and plunge. The stereonet projects the lower half of a reference sphere onto a disc so that planes
          become arcs and lines become points, and the geometry can be done graphically: the pole to a plane, the
          angle between two lines, the line where two planes meet. For a fold, that intersection of the two limbs is
          the fold axis, and the spread of poles to bedding around the net tells the fold&rsquo;s shape.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/9-crustal-deformation-and-earthquakes/" rel="noreferrer">
              An Introduction to Geology, chapter 9: Crustal deformation and earthquakes
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Fold_(geology)" rel="noreferrer">
              Fold
            </a>
            ,{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Fault_(geology)" rel="noreferrer">
              Fault
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Stereographic_projection" rel="noreferrer">
              Stereographic projection
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
