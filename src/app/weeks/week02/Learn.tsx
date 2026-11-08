const link = 'underline underline-offset-4'

/** Week 2: what a mineral is, how atoms bond and pack, and why that fixes the properties a bench can test. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="mineral-heading">
        <h2 id="mineral-heading" className="mb-1 text-lg font-medium">
          What counts as a mineral
        </h2>
        <p className="mb-2">
          A mineral is a naturally formed solid with a definite chemical make-up and an ordered arrangement of atoms,
          a crystal structure. Each part of that sentence excludes something: glass is not ordered, coal is not of
          definite composition, and a lab-grown ruby, however perfect, is not natural. Ice is a mineral; the water it
          melts into is not.
        </p>
        <p>
          About six thousand minerals are known. A few dozen make up nearly all of the crust, and those are the ones a
          first course learns to recognise. Rocks are built from them, so every rock question comes back to minerals.
        </p>
      </section>

      <section aria-labelledby="bonds-heading">
        <h2 id="bonds-heading" className="mb-1 text-lg font-medium">
          Atoms, bonds and packing
        </h2>
        <p className="mb-2">
          Atoms in a mineral are held by ionic bonds, where charged ions attract; by covalent bonds, where atoms share
          electrons; and in a few cases by metallic bonds. The kind of bond and how the atoms pack decide what you can
          measure at a bench. Halite's sodium and chlorine alternate in a cubic grid with equal bonds in three
          directions, so it breaks into cubes and dissolves readily. Graphite's carbon sits in strong sheets held
          together weakly, so it flakes and feels greasy. Diamond's carbon bonds equally in all directions, and it is
          the hardest mineral known.
        </p>
        <p>
          The crystal viewer in the Explore pane draws these structures from measured data. Turn halite and look for
          the cubes; turn quartz and look for the silicon atoms, each surrounded by four oxygens.
        </p>
      </section>

      <section aria-labelledby="properties-heading">
        <h2 id="properties-heading" className="mb-1 text-lg font-medium">
          The properties a bench can test
        </h2>
        <p className="mb-2">
          Hardness is resistance to scratching, ranked on Mohs' scale from talc at 1 to diamond at 10; a fingernail is
          about 2.5, a copper coin 3.5, glass and a steel blade about 5.5. Streak is the colour of the powder, found by
          dragging the mineral across unglazed porcelain; it is steadier than the colour of the specimen. Luster is how
          the surface returns light: metallic or not, and if not, glassy, pearly, greasy, dull. Cleavage is the
          tendency to break along flat planes set by the structure; count the directions and judge how clean the
          planes are. Fracture is any other kind of break.
        </p>
        <p>
          Colour is the first thing you notice and the least reliable. Quartz comes in every colour; fluorite is
          purple, green, yellow and clear. Use colour to suggest, never to decide.
        </p>
      </section>

      <section aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="mb-1 text-lg font-medium">
          Reading
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <a className={link} href="https://opengeology.org/textbook/3-minerals/" rel="noreferrer">
              An Introduction to Geology, chapter 3: Minerals
            </a>{' '}
            (open textbook).
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Mohs_scale" rel="noreferrer">
              Mohs scale
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Cleavage_(crystal)" rel="noreferrer">
              Cleavage
            </a>{' '}
            on Wikipedia.
          </li>
          <li>
            <a className={link} href="https://www.mindat.org/" rel="noreferrer">
              Mindat
            </a>{' '}
            for any mineral's properties and photographs.
          </li>
        </ul>
      </section>
    </div>
  )
}
