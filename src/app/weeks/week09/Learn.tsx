const link = 'underline underline-offset-4'

/** Week 9: faults and waves, locating an earthquake, and what the waves reveal of the interior. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="waves-heading">
        <h2 id="waves-heading" className="mb-1 text-lg font-medium">
          Faults and waves
        </h2>
        <p className="mb-2">
          Rock under stress bends, stores energy, and finally breaks along a fault; the sudden slip is an earthquake. The
          Model tab shows each fault type as a looping block diagram.
          The point where the break starts is the focus, and the spot on the surface above it is the epicentre. The
          slip sends out waves of two kinds through the body of the Earth. P waves push and pull along their path and
          travel fastest. S waves shake from side to side, travel slower, and cannot pass through liquid. Surface
          waves follow, slowest and often largest.
        </p>
        <p>
          A seismometer records all of them in order. Because P leads S by more the farther they travel, the gap
          between the two arrivals is a distance. One station gives a circle of possible epicentres; three stations
          give three circles, and the earthquake is where they meet.
        </p>
      </section>
      <section aria-labelledby="interior-heading">
        <h2 id="interior-heading" className="mb-1 text-lg font-medium">
          The interior from its shadows
        </h2>
        <p className="mb-2">
          Waves speed up with depth and bend as they go, so they arrive earlier than a straight path would allow. On
          the far side of the planet from a large earthquake there is a band where no S waves arrive at all: the
          outer core is liquid and stops them. P waves bend sharply at the core and leave a shadow of their own, and
          faint arrivals inside it show a solid inner core. Magnitude, meanwhile, is read from the size of the waves
          corrected for distance; each unit is about thirty times the energy of the one below.
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
            <a className={link} href="https://www.usgs.gov/programs/earthquake-hazards/science-earthquakes" rel="noreferrer">
              The science of earthquakes
            </a>{' '}
            from the USGS.
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Seismic_wave" rel="noreferrer">
              Seismic wave
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Shadow_zone" rel="noreferrer">
              Shadow zone
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
