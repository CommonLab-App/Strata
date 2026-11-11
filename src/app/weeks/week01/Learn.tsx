const link = 'underline underline-offset-4'

/** Week 1: Earth as a system, and how geologists reason. Short, in our own words, with the reading linked rather than copied. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="system-heading">
        <h2 id="system-heading" className="mb-1 text-lg font-medium">
          Earth as a system
        </h2>
        <p className="mb-2">
          Geology treats Earth as a set of linked parts: the solid rock of the geosphere, the water of the hydrosphere,
          the air of the atmosphere and the life of the biosphere. Energy moves through all of them. Heat from inside
          Earth drives plate motion, earthquakes and volcanoes; energy from the Sun drives weather, rivers, ice and the
          wearing down of what the interior builds up.
        </p>
        <p>
          Nothing in the system stands still, but much of it moves slowly: millimetres a year for a plate, a grain at
          a time for a river. The time scale is the hard part. Earth is about 4.6 billion years old, and most of what a
          geologist reads in rock took longer to form than there have been people.
        </p>
      </section>

      <section aria-labelledby="reasoning-heading">
        <h2 id="reasoning-heading" className="mb-1 text-lg font-medium">
          How geologists reason
        </h2>
        <p className="mb-2">
          A geologist rarely sees the event, only what it left. So the method is to observe carefully, separate what is
          seen from what it might mean, and then test the explanation against more observations. Two habits make this
          work. The first is to keep observation and interpretation apart: "a layer of sand two metres thick" is an
          observation; "a beach" is an interpretation of it. The second is the working assumption that the processes
          running today ran in the past too, so a modern river or beach can be read as a guide to an ancient one.
        </p>
        <p>
          The Explore pane shows today's earthquakes as the USGS records them, minutes after they happen. Watching
          where they fall, and where they do not, is the first observation of the course. In the Lab you will run the
          method yourself on a small model of sand and water.
        </p>
      </section>

      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/1-understanding-science/" rel="noreferrer">
              An Introduction to Geology, chapter 1: Understanding science
            </a>{' '}
            (open textbook).
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Earth_system_science" rel="noreferrer">
              Earth system science
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Uniformitarianism" rel="noreferrer">
              Uniformitarianism
            </a>{' '}
            on Wikipedia.
          </li>
          <li>
            <a className={link} href="https://www.usgs.gov/programs/earthquake-hazards/science-earthquakes" rel="noreferrer">
              The science of earthquakes
            </a>{' '}
            from the USGS Earthquake Hazards Program.
          </li>
        </ul>
      </section>
    </div>
  )
}
