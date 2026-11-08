const link = 'underline underline-offset-4'

/** Week 4: magma, how it cools, and how igneous rocks are named by texture and composition. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="magma-heading">
        <h2 id="magma-heading" className="mb-1 text-lg font-medium">
          Magma and where it comes from
        </h2>
        <p className="mb-2">
          Rock melts when it gets hot enough, when the pressure on it drops, or when water is added to it. Each
          happens in a particular place: hot spots and rifts lower the pressure on rising mantle, subduction zones
          carry water down into it. The melt is less dense than the rock around it and rises. If it stops and cools
          underground it is called intrusive, or plutonic; if it reaches the surface as lava or ash it is extrusive,
          or volcanic.
        </p>
        <p>
          Melting is partial. The first melt to form from mantle rock is richer in silica than its source, and as a
          magma cools the first crystals to form are poorer in silica than the melt, so what is left grows richer still.
          Bowen's reaction series, in the Explore pane, is the order those crystals appear.
        </p>
      </section>
      <section aria-labelledby="naming-heading">
        <h2 id="naming-heading" className="mb-1 text-lg font-medium">
          Two questions name a rock
        </h2>
        <p className="mb-2">
          How fast did it cool? Slow cooling underground grows crystals you can see, a phaneritic texture; fast cooling
          at the surface leaves crystals too small to see, aphanitic; quenching makes glass; escaping gas leaves holes,
          vesicles; and an explosive eruption deposits fragments, a pyroclastic rock. What was it made of? Felsic magma
          is rich in silica and makes light-coloured rocks of quartz and feldspar; mafic magma is poorer in silica and
          richer in iron and magnesium, making dark rocks of pyroxene, olivine and calcium-rich plagioclase;
          intermediate sits between; ultramafic is almost all olivine and pyroxene.
        </p>
        <p>
          Put the two on a grid and every common igneous rock has a cell. Granite and rhyolite are the same magma
          cooled slowly and fast; so are gabbro and basalt. The percentage of dark minerals, the colour index, is the
          quickest field estimate of composition.
        </p>
      </section>
      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/4-igneous-processes-and-volcanoes/" rel="noreferrer">
              An Introduction to Geology, chapter 4: Igneous processes and volcanoes
            </a>
            .
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Bowen%27s_reaction_series" rel="noreferrer">
              Bowen's reaction series
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Igneous_rock" rel="noreferrer">
              Igneous rock
            </a>{' '}
            on Wikipedia.
          </li>
        </ul>
      </section>
    </div>
  )
}
