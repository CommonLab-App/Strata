const link = 'underline underline-offset-4'

/** Week 16: slopes that fail, the things we take from the ground, and the climate record in rock. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="slopes-heading">
        <h2 id="slopes-heading" className="mb-1 text-lg font-medium">
          Mass wasting
        </h2>
        <p>
          Gravity moves material downslope without the help of a river or a glacier: a rockfall from a cliff, a
          slide along a surface, a flow of water-soaked debris, or the imperceptible creep of soil shown by tilted
          fences and bent tree trunks. A slope holds while the shear strength of its material, friction between grains
          plus the cohesion of clay and roots, exceeds the shear stress that gravity applies along the slope. Water
          is the usual trigger: it adds weight, raises pore pressure and pushes grains apart. Steepening a slope by
          cutting its base, removing vegetation, and shaking by an earthquake do the rest.
        </p>
      </section>
      <section aria-labelledby="resources-heading">
        <h2 id="resources-heading" className="mb-1 text-lg font-medium">
          Resources
        </h2>
        <p>
          Everything that is not grown is mined. Ore deposits are rock in which a useful element has been
          concentrated far above its average by magma, hot water, weathering or sedimentary sorting; an ore is only
          an ore if it pays to extract. Coal is buried plant matter; oil and gas are the cooked remains of marine
          plankton that migrated from the shale they formed in to a porous reservoir sealed by an impermeable cap.
          Groundwater, sand, gravel and building stone are resources too, taken in greater tonnage than any metal.
        </p>
      </section>
      <section aria-labelledby="climate-heading">
        <h2 id="climate-heading" className="mb-1 text-lg font-medium">
          Climate in the rock record
        </h2>
        <p>
          Geology reads past climate from what it left: glacial deposits far from any ice today, coal and coral
          where it is now cold, dune sandstones, evaporites, the oxygen isotopes of shells and ice, and the
          chemistry of bubbles trapped in ice cores. The record shows a climate that has swung between hothouse and
          icehouse over millions of years, with carbon dioxide and the arrangement of continents among the controls,
          and it sets the scale against which the present change is measured.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/10-mass-wasting/" rel="noreferrer">
              An Introduction to Geology, chapter 10: Mass wasting
            </a>
            ,{' '}
            <a className={link} href="https://opengeology.org/textbook/16-energy-and-mineral-resources/" rel="noreferrer">
              chapter 16: Energy and mineral resources
            </a>{' '}
            and{' '}
            <a className={link} href="https://opengeology.org/textbook/15-global-climate-change/" rel="noreferrer">
              chapter 15: Global climate change
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Slope_stability_analysis" rel="noreferrer">
              Slope stability analysis
            </a>{' '}
            on Wikipedia, and the{' '}
            <a className={link} href="https://www.usgs.gov/programs/landslide-hazards" rel="noreferrer">
              USGS Landslide Hazards Program
            </a>
            .
          </li>
        </ul>
      </section>
    </div>
  )
}
