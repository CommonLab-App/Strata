const link = 'underline underline-offset-4'

/** Week 7: metamorphism, foliation and grade, and the rock cycle that joins the three classes. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="meta-heading">
        <h2 id="meta-heading" className="mb-1 text-lg font-medium">
          Changed in the solid state
        </h2>
        <p className="mb-2">
          Heat, pressure and hot fluids change a rock without melting it: minerals recrystallise, grow, and react to
          form new ones that are stable in the new conditions. Beside an intrusion the cause is heat alone, contact
          metamorphism, and the product is a massive, fine-grained hornfels. Across a mountain belt the cause is heat
          and directed pressure together, regional metamorphism, and the product is foliated: platy minerals line up
          at right angles to the squeeze.
        </p>
        <p>
          Grade is how far the change went. Shale becomes slate, then phyllite, then schist, then gneiss as the
          temperature climbs, and the index minerals mark the steps: chlorite at low grade, garnet and staurolite in
          the middle, sillimanite at the top. Limestone becomes marble and sandstone quartzite without foliation,
          because calcite and quartz grow as equant grains whatever the pressure.
        </p>
      </section>
      <section aria-labelledby="cycle-heading">
        <h2 id="cycle-heading" className="mb-1 text-lg font-medium">
          The rock cycle
        </h2>
        <p className="mb-2">
          Any rock can become any other. Igneous rock weathers to sediment; sediment is buried and lithified; buried
          deeper and heated it is metamorphosed; heated further it melts, and the magma cools to igneous rock again.
          None of the arrows is one-way, and most rock skips steps. The facies diagram in the Explore pane maps the
          temperatures and depths at which each metamorphic rock forms, which is one slice through that cycle.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/6-metamorphic-rocks/" rel="noreferrer">
              An Introduction to Geology, chapter 6: Metamorphic rocks
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Metamorphic_facies" rel="noreferrer">
              Metamorphic facies
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Rock_cycle" rel="noreferrer">
              Rock cycle
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
