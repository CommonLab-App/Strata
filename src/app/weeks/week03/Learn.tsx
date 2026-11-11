const link = 'underline underline-offset-4'

/** Week 3: the silicate families by how their tetrahedra link, the rock-forming minerals, and reading a key. */
export function Learn() {
  return (
    <div className="grid max-w-prose gap-6">
      <section aria-labelledby="tetrahedron-heading">
        <h2 id="tetrahedron-heading" className="mb-1 text-lg font-medium">
          One building block
        </h2>
        <p className="mb-2">
          Oxygen and silicon make up about three quarters of the crust by weight, and nearly every common mineral is a
          silicate: silicon atoms each bonded to four oxygens in a tetrahedron, a four-faced pyramid. The tetrahedra
          share oxygens with their neighbours in a handful of patterns, and the pattern sets the family.
        </p>
        <p>
          Isolated tetrahedra, linked only through other metal ions, give olivine and garnet: hard, no cleavage, glassy.
          Single chains give the pyroxenes such as augite, double chains the amphiboles such as hornblende; both cleave
          in two directions, near 90° for pyroxenes and at 56° and 124° for amphiboles. Sheets give the micas and clays,
          with one perfect cleavage. Frameworks, every oxygen shared, give quartz and the feldspars: hard, and either
          no cleavage (quartz) or two good cleavages (feldspar).
        </p>
      </section>

      <section aria-labelledby="rockforming-heading">
        <h2 id="rockforming-heading" className="mb-1 text-lg font-medium">
          The rock-forming minerals
        </h2>
        <p className="mb-2">
          Feldspars are the most abundant minerals in the crust, in two groups: potassium feldspar, often pink, and
          plagioclase, from sodium-rich to calcium-rich, often white or grey with fine parallel striations on a
          cleavage face. Quartz is next. Then the dark minerals: biotite, hornblende, augite and olivine, richer in iron
          and magnesium as the list goes on. The non-silicates that matter most are the carbonates calcite and dolomite,
          the sulfides pyrite and galena, the oxides magnetite and hematite, and the evaporites halite and gypsum.
        </p>
        <p>
          Which of these a rock holds, and in what proportion, is most of what a rock name means. The igneous rocks topic starts there.
        </p>
      </section>

      <section aria-labelledby="key-heading">
        <h2 id="key-heading" className="mb-1 text-lg font-medium">
          Working a key
        </h2>
        <p className="mb-2">
          A mineral key asks the questions in a useful order. Metallic or not? Harder than glass or softer? What
          streak? How many cleavage directions? Each answer removes candidates. The diagnostic tests come last and
          settle the near ties: calcite fizzes in dilute acid and dolomite only when powdered, magnetite pulls a
          magnet, halite tastes of salt, and galena and barite are heavier in the hand than they look.
        </p>
        <p>
          The lab scores you on two things: the name, and whether the tests you ran were enough to be sure of it. A
          right guess from colour alone is still a guess.
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
            </a>
            , the silicate section.
          </li>
          <li>
            <a className={link} href="https://en.wikipedia.org/wiki/Silicate_mineral" rel="noreferrer">
              Silicate minerals
            </a>{' '}
            and{' '}
            <a className={link} href="https://en.wikipedia.org/wiki/Feldspar" rel="noreferrer">
              Feldspar
            </a>{' '}
            on Wikipedia.
          </li>
          <li>
            <a className={link} href="https://webmineral.com/" rel="noreferrer">
              webmineral
            </a>{' '}
            for structures and data by mineral.
          </li>
        </ul>
      </section>
    </div>
  )
}
