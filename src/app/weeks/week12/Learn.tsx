const link = 'underline underline-offset-4'

/** Week 12: reading the shape of the land and the structure beneath it from maps. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="topo-heading">
        <h2 id="topo-heading" className="mb-1 text-lg font-medium">
          Topographic maps
        </h2>
        <p className="mb-2">
          A contour line joins points at the same elevation. Lines are drawn at a fixed interval, so their spacing is
          the slope: close together means steep, far apart means gentle, and a line never crosses another. Where
          contours cross a stream they bend upstream, making a V that points uphill. Closed loops are hills; loops
          with little tick marks are closed depressions. Every fifth line is drawn heavier and labelled so the map
          can be read quickly.
        </p>
        <p>
          A profile is the ground seen from the side along a chosen line: read the elevation where each contour
          crosses the line and plot it against distance. The gradient between two points is the rise divided by the
          run, often given in metres per kilometre or as a percentage.
        </p>
      </section>
      <section aria-labelledby="geologic-heading">
        <h2 id="geologic-heading" className="mb-1 text-lg font-medium">
          Geologic maps and the three-point problem
        </h2>
        <p>
          A geologic map shows which rock unit lies at the surface and how its layers are tilted. The attitude of a
          planar bed is written as strike and dip: the strike is the compass direction of a horizontal line on the
          bed, and the dip is the angle the bed slopes down from horizontal, measured at right angles to strike. By
          the right-hand rule the strike is quoted so that the bed dips to the right as you face along it. Three
          outcrops of one bed at known positions and elevations fix the plane, and so its strike and dip: that is the
          three-point problem. A cross-section is the map carried down into the ground along a line.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://pubs.usgs.gov/gip/TopographicMapSymbols/topomapsymbols.pdf" rel="noreferrer">
              Topographic map symbols
            </a>{' '}
            from the USGS.
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Contour_line" rel="noreferrer">
              Contour line
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Strike_and_dip" rel="noreferrer">
              Strike and dip
            </a>{' '}
            on Wikipedia.
          </li>
          <li>
            <a className={link} href="https://opengeology.org/textbook/9-crustal-deformation-and-earthquakes/" rel="noreferrer">
              An Introduction to Geology, chapter 9
            </a>
            , for structure on maps.
          </li>
        </ul>
      </section>
    </div>
  )
}
