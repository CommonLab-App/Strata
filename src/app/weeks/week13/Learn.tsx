const link = 'underline underline-offset-4'

/** Week 13: what streams do and how a gauge records it. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="streams-heading">
        <h2 id="streams-heading" className="mb-1 text-lg font-medium">
          Streams at work
        </h2>
        <p className="mb-2">
          Running water is the main sculptor of the land. A stream gathers rain from its drainage basin, cuts down
          where it is steep and sideways where it is gentle, carries sediment as dissolved load, suspended load and
          bed load, and drops it where it slows: on the inside of bends, across a floodplain when it overtops its
          banks, and in a delta where it meets still water. Steep, sediment-choked streams braid into many shifting
          channels; gentler ones meander in a single channel that migrates across the valley floor. The Model tab
          shows the zones of a stream and the four drainage patterns as looping block diagrams.
        </p>
        <p>
          Discharge is the volume of water passing a point per second. A gauge measures the water level and converts
          it to discharge with a rating curve built from direct measurements. A hydrograph is discharge plotted
          against time: a storm shows as a rise, a peak and a long recession, and the lag between the rain and the
          peak says how fast the basin delivers water.
        </p>
      </section>
      <section aria-labelledby="floods-heading">
        <h2 id="floods-heading" className="mb-1 text-lg font-medium">
          Floods in the record
        </h2>
        <p>
          A flood is a flow that leaves the channel. Long gauge records let geologists rank past peaks and estimate
          how often a given discharge recurs; a hundred-year flood is one with a one percent chance in any year, not
          one that waits a century. Floodplains exist because floods build them, which is the plainest thing the
          landscape has to say about where water goes.
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
            <a className={link} href="https://www.usgs.gov/special-topics/water-science-school/science/streamflow-and-water-cycle" rel="noreferrer">
              Streamflow and the water cycle
            </a>{' '}
            from the USGS Water Science School.
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Hydrograph" rel="noreferrer">
              Hydrograph
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
