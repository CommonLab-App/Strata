const link = 'underline underline-offset-4'

/** Week 10: putting events in order before anything had a date. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="rules-heading">
        <h2 id="rules-heading" className="mb-1 text-lg font-medium">
          The rules of relative dating
        </h2>
        <p className="mb-2">
          Long before any rock could be dated in years, geologists could say which came first. Sediment settles in
          flat layers, so a bed lies on an older bed: superposition. Layers that are now tilted or folded were flat
          when they formed: original horizontality. A dike, a fault or any feature that cuts through rock is younger
          than the rock it cuts: cross-cutting. A fragment of one rock enclosed in another was there first: inclusions.
          And fossils succeed one another in a fixed order, so the same kinds mark the same time wherever they are
          found.
        </p>
        <p>
          Apply the rules to a cross-section one feature at a time and a story comes out in sequence: these beds,
          then this tilt, then erosion, then more beds, then the dike that cuts them all.
        </p>
      </section>
      <section aria-labelledby="gaps-heading">
        <h2 id="gaps-heading" className="mb-1 text-lg font-medium">
          Gaps in the record
        </h2>
        <p>
          An unconformity is a surface where time passed without a record: either nothing was deposited, or what was
          deposited was eroded away before the next layer came. Where the beds below were tilted and planed off
          before the beds above were laid, the surface is an angular unconformity. Where the beds on both sides are
          parallel, it is a disconformity, often marked only by a weathered or channelled surface. Where sediment
          lies on eroded igneous or metamorphic rock, it is a nonconformity. Deep time hides in these gaps: the
          surface may represent far more time than all the rock above and below it.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/7-geologic-time/" rel="noreferrer">
              An Introduction to Geology, chapter 7: Geologic time
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Relative_dating" rel="noreferrer">
              Relative dating
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Unconformity" rel="noreferrer">
              Unconformity
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
