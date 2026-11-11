const link = 'underline underline-offset-4'

/** Week 14: water underground, how it moves, and what it dissolves. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="table-heading">
        <h2 id="table-heading" className="mb-1 text-lg font-medium">
          The water table and how water moves
        </h2>
        <p className="mb-2">
          Below a certain depth every pore and crack is full of water; the top of that saturated zone is the water
          table. It rises and falls with the seasons and follows the land surface in a subdued way, so groundwater
          flows from hills toward valleys and feeds streams, springs and wetlands. A body of rock or sediment that
          stores and yields water is an aquifer; one that holds water but barely passes it is an aquitard.
        </p>
        <p>
          Porosity is the fraction of a material that is pore space; permeability is how well the pores connect.
          Clay can be very porous and nearly impermeable. Groundwater moves slowly, metres a day in gravel and
          centimetres a year in clay, driven by the slope of the water table and governed by Darcy&rsquo;s law:
          discharge is hydraulic conductivity times area times head gradient. Pumping a well lowers the head around
          it into a cone of depression whose depth depends on the pumping rate and the aquifer&rsquo;s transmissivity.
          The Model tab shows an artesian cross-section with three wells, the zones below the surface, and a karst
          block as looping diagrams.
        </p>
      </section>
      <section aria-labelledby="karst-heading">
        <h2 id="karst-heading" className="mb-1 text-lg font-medium">
          Karst
        </h2>
        <p>
          Rain picks up carbon dioxide and becomes weak carbonic acid, which dissolves limestone along joints and
          bedding planes. Over time the openings grow into caves; where a cave roof falls or soil is washed into a
          cavity the surface collapses into a sinkhole; streams vanish underground and reappear as springs. A
          landscape shaped this way is karst, and in it groundwater moves fast through conduits rather than slowly
          through pores.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/11-water/" rel="noreferrer">
              An Introduction to Geology, chapter 11: Water
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://www.usgs.gov/special-topics/water-science-school/science/groundwater-information-topic" rel="noreferrer">
              Groundwater
            </a>{' '}
            from the USGS Water Science School.
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Darcy%27s_law" rel="noreferrer">
              Darcy&rsquo;s law
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Karst" rel="noreferrer">
              Karst
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
