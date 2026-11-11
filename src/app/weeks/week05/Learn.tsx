const link = 'underline underline-offset-4'

/** Week 5: what decides how a volcano erupts, and where volcanoes are. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="magma-heading">
        <h2 id="magma-heading" className="mb-1 text-lg font-medium">
          Three properties of a magma
        </h2>
        <p className="mb-2">
          How a volcano erupts follows from its magma. Silica content sets viscosity: silica tetrahedra link into
          chains and networks, so a rhyolite with 70 percent silica is millions of times stiffer than a basalt with
          50. Temperature works the other way, hotter is runnier, and basalts erupt several hundred degrees hotter
          than rhyolites. Dissolved gas, mostly water, supplies the push: as magma rises and the pressure drops, the
          gas comes out of solution and expands, like opening a shaken bottle.
        </p>
        <p>
          Put the three together. Runny, gas-poor magma lets its bubbles escape and pours out as lava. Stiff, gas-rich
          magma holds its bubbles until they tear it apart, and the eruption is a column of ash and pumice. In between
          are bursts of spatter, blasts of blocks and ash, and domes that grow and collapse.
        </p>
      </section>
      <section aria-labelledby="landforms-heading">
        <h2 id="landforms-heading" className="mb-1 text-lg font-medium">
          Landforms and the explosivity index
        </h2>
        <p className="mb-2">
          Fluid basalt builds broad, low shield volcanoes and lava plains. Intermediate magma builds steep
          stratovolcanoes from alternating lava and fragmental layers. When a large body of silica-rich magma erupts
          at once, the roof of the emptied chamber collapses into a caldera many kilometres across. The Model tab shows
          the four edifice shapes in cross-section and as a model you can turn. The Volcanic
          Explosivity Index, VEI, ranks eruptions on a scale of 0 to 8 by the volume of material thrown out, each step
          roughly ten times the last.
        </p>
        <p>
          Most volcanoes sit along plate boundaries: basaltic ones along the ridges where plates separate, and the
          explosive, intermediate ones above subduction zones, where water carried down with the sinking plate lowers
          the melting point of the mantle above it. The rest mark hot spots, where a long-lived plume of hot mantle
          melts through a plate as it passes overhead.
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
            <a className={link} href="https://en.wikipedia.org/wiki/Volcanic_Explosivity_Index" rel="noreferrer">
              Volcanic Explosivity Index
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Types_of_volcanic_eruptions" rel="noreferrer">
              Types of volcanic eruptions
            </a>{' '}
            on Wikipedia.
          </li>
          <li>
            <a className={link} href="https://volcano.si.edu/" rel="noreferrer">
              Global Volcanism Program
            </a>
            , whose database the Explore pane draws.
          </li>
        </ul>
      </section>
    </div>
  )
}
