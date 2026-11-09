const link = 'underline underline-offset-4'

/** Week 11: decay as a clock, and how the time scale got its numbers. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="decay-heading">
        <h2 id="decay-heading" className="mb-1 text-lg font-medium">
          Decay as a clock
        </h2>
        <p className="mb-2">
          Some atoms are unstable and change into others at a rate that nothing, heat, pressure or chemistry, can
          alter. The time for half of any amount to decay is the half-life, and it is the same whether the sample is
          a gram or a mountain. When a mineral crystallises it locks in parent atoms and, usually, no daughter; from
          then on the ratio of daughter to parent grows in a known way, so measuring it gives the time since the
          crystal formed. Age equals the half-life times the base-two logarithm of one plus the daughter-to-parent
          ratio.
        </p>
        <p>
          Each system suits a range of ages. Carbon-14, with a half-life of 5730 years, dates wood, bone and shell
          back a few tens of thousands of years and no further, because too little parent is left. Potassium-argon,
          uranium-lead and rubidium-strontium have half-lives of billions of years and date igneous and metamorphic
          minerals across all of Earth history. None of them dates a sedimentary grain's deposition directly, which
          is why the time scale is pinned by dated lava flows, ash beds and intrusions caught between the layers.
        </p>
      </section>
      <section aria-labelledby="scale-heading">
        <h2 id="scale-heading" className="mb-1 text-lg font-medium">
          The time scale
        </h2>
        <p>
          The eons, eras and periods were named and ordered from fossils and superposition in the nineteenth
          century, long before anyone could put a year on them. Radiometric dates then turned the ordered list into a
          calendar: Earth is about 4.5 billion years old, visible animal life appears about 540 million years ago at
          the start of the Cambrian, and all of the familiar periods fit in the last eighth of the planet&rsquo;s
          history. The international commission revises the boundary ages as better dates arrive.
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
            <a className={link} href="https://en.wikipedia.org/wiki/Radiometric_dating" rel="noreferrer">
              Radiometric dating
            </a>{' '}
            on Wikipedia, and the{' '}
            <a className={link} href="https://stratigraphy.org/chart" rel="noreferrer">
              International Chronostratigraphic Chart
            </a>
            .
          </li>
        </ul>
      </section>
    </div>
  )
}
