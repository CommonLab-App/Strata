import type { WeekContent } from '@/app/week/WeekPage'

/**
 * A week that is planned but not built: the plan from docs/PLAN.md shown in place of its content. Learn carries a
 * short orientation and the reading; Explore and Lab say what will be there and where the data will come from.
 * Nothing saves and the self-check is empty, so Home shows these weeks as drafts. Replace an entry here with a
 * folder under src/app/weeks/ when the week is built, and move its number out of DRAFT in weeks.ts.
 */
export interface WeekPlan {
  /** Two or three sentences on what the week is about; concepts only, no places or events. */
  orientation: string
  /** The explorer or tool the week will use and what it will show. */
  explore: string
  /** The lab worksheet: what the learner will do and what the checker will recompute. */
  lab: string
  /** Public sources the Explore pane will draw on, as the About page will credit them. */
  sources: { label: string; href: string }[]
  reading: { label: string; href: string }[]
}

const link = 'underline underline-offset-4'

const OG = 'https://opengeology.org/textbook'
const og = (slug: string, label: string) => ({ label: `An Introduction to Geology, chapter ${slug.split('-')[0]}: ${label}`, href: `${OG}/${slug}/` })
const wp = (slug: string, label: string) => ({ label: `${label} on Wikipedia`, href: `https://en.wikipedia.org/wiki/${slug}` })

export const PLANS: Record<number, WeekPlan> = {
  5: {
    orientation:
      'How a volcano erupts follows from its magma: silica content sets viscosity, dissolved water and carbon dioxide set the push, and temperature sets how far the melt can travel before it freezes. Runny basalt builds shields and lava plains; sticky, gas-rich rhyolite and andesite build steep cones and explode. The same rules explain why most volcanoes sit along plate boundaries, and which kind of boundary makes which kind of volcano.',
    explore: 'The Volcano Lab sliders for silica, water and temperature, with the predicted eruption style, and a globe layer of Holocene volcanoes drawn over the plate boundaries so the pattern can be seen rather than told.',
    lab: 'Set the three sliders to match a described magma, predict the eruption style, then check it against the model; a second part asks which boundary type sits under a chosen volcano, scored from the bundled boundary lines.',
    sources: [
      { label: 'Global Volcanism Program, Smithsonian Institution', href: 'https://volcano.si.edu/' },
      { label: 'PB2002 plate boundaries (Bird, 2003)', href: 'https://github.com/fraxen/tectonicplates' },
    ],
    reading: [og('4-igneous-processes-and-volcanoes', 'Igneous processes and volcanoes'), wp('Volcanic_Explosivity_Index', 'Volcanic Explosivity Index')],
  },
  8: {
    orientation:
      'The lithosphere is broken into plates that move a few centimetres a year, about as fast as fingernails grow. Where plates pull apart new crust is made, where they converge one sinks or both crumple, and where they slide past each other the ground tears. The evidence was once fossils and matching coastlines; today satellite positioning measures the motion directly, station by station.',
    explore: 'The Plate Motion Explorer: GNSS station velocities drawn as arrows on the globe over the plate boundaries, with a pick-two-stations tool that reports their relative motion.',
    lab: 'Pick two stations on either side of a boundary, read the relative speed and direction, and name the boundary type; the checker recomputes both from the same bundled velocities and boundary lines.',
    sources: [
      { label: 'EarthScope Consortium GNSS velocities', href: 'https://www.earthscope.org/' },
      { label: 'PB2002 plate boundaries (Bird, 2003)', href: 'https://github.com/fraxen/tectonicplates' },
    ],
    reading: [og('2-plate-tectonics', 'Plate tectonics'), wp('Plate_tectonics', 'Plate tectonics')],
  },
  9: {
    orientation:
      'An earthquake is rock breaking along a fault and the waves that break sends out. P waves compress and arrive first; S waves shear and arrive later, so the gap between them grows with distance. Three stations and a travel-time table place the epicentre. The same waves, bent and blocked as they cross the planet, are how we know Earth has a liquid outer core.',
    explore: 'The Seismic Viewer: three seismograms from a teaching earthquake to scrub, with P and S picks, and a globe that draws the distance circle from each station as the picks are made.',
    lab: 'Pick P and S on three records, convert each gap to a distance with the travel-time table, and place the epicentre where the circles meet; the checker locates it from the same picks and tolerances.',
    sources: [
      { label: 'USGS Earthquake Hazards Program', href: 'https://earthquake.usgs.gov/' },
      { label: 'EarthScope seismic data services', href: 'https://ds.iris.edu/' },
    ],
    reading: [og('9-crustal-deformation-and-earthquakes', 'Crustal deformation and earthquakes'), wp('Seismic_wave', 'Seismic wave')],
  },
  10: {
    orientation:
      'Before any rock had a date in years, geologists put events in order. Younger beds lie on older ones, a feature that cuts another is younger than it, and a gap in the record, an unconformity, means time passed with nothing kept or something removed. Those few rules turn a cross-section into a story told in sequence.',
    explore: 'The Geologic Time Builder: a drawn cross-section whose beds, intrusions, faults and unconformities can be dragged into order, and a globe that moves a chosen point back through time with plate reconstructions.',
    lab: 'Order the events in a cross-section and name each unconformity type; the checker compares the sequence to the one the section was generated from.',
    sources: [{ label: 'GPlates Web Service (EarthByte)', href: 'https://gwsdoc.gplates.org/' }],
    reading: [og('7-geologic-time', 'Geologic time'), wp('Relative_dating', 'Relative dating')],
  },
  11: {
    orientation:
      'Radioactive atoms decay at a rate nothing changes, so the ratio of parent to daughter in a crystal is a clock started when it formed. Each half-life halves the parent; count the halvings and the age follows. Different isotopes suit different ages, and the dated ash beds and intrusions pin the relative time scale to years.',
    explore: 'The Time Builder with a half-life slider: watch parent and daughter atoms trade places, read the age off the curve, and place dated units on the geologic time scale.',
    lab: 'Date three samples from their parent-daughter ratios with the right isotope for each, then build a short time scale from them; the checker recomputes the ages from the same ratios.',
    sources: [{ label: 'Macrostrat', href: 'https://macrostrat.org/' }],
    reading: [og('7-geologic-time', 'Geologic time'), wp('Radiometric_dating', 'Radiometric dating')],
  },
  12: {
    orientation:
      'A topographic map draws the shape of the land with contour lines of equal elevation: close together on steep ground, far apart on flat, bending upstream where they cross a valley. A geologic map adds what rock lies under the surface and how it is tilted, written as strike and dip. From the two a cross-section can be drawn and the structure read.',
    explore: 'The Map and Topo Workshop: a real elevation tile with contours drawn at a chosen interval, a profile tool, and strike-and-dip symbols that can be placed and read.',
    lab: 'Draw a profile along a line, read elevations and gradient, place strike-and-dip symbols on a mapped bed and sketch the cross-section; the checker recomputes the profile from the same elevation data.',
    sources: [{ label: 'USGS 3D Elevation Program', href: 'https://www.usgs.gov/3d-elevation-program' }],
    reading: [{ label: 'USGS topographic map symbols', href: 'https://pubs.usgs.gov/gip/TopographicMapSymbols/topomapsymbols.pdf' }, wp('Strike_and_dip', 'Strike and dip')],
  },
  13: {
    orientation:
      'Streams carry water and sediment downhill, cutting valleys, building floodplains and deltas, and shifting course over time. Discharge is the volume passing a point each second; a hydrograph plots it against time, and a flood is the part of the record that climbs above the banks. The record from a gauge is the stream describing itself.',
    explore: 'The Water Explorer for rivers: a live gauge picked on the globe with its current discharge and recent hydrograph, and a stream-table sandbox to shape a channel.',
    lab: 'Read a hydrograph: find peak discharge, lag time and the flood stage crossing; the checker recomputes each from the same cached gauge record.',
    sources: [{ label: 'USGS Water Services', href: 'https://waterservices.usgs.gov/' }],
    reading: [og('11-water', 'Water'), wp('Hydrograph', 'Hydrograph')],
  },
  14: {
    orientation:
      'Below the water table every pore is full. Groundwater moves slowly through rock and sediment, faster where the material is permeable and the slope of the water table is steep, which is Darcy’s law. Pumping draws the table down into a cone around the well; in limestone, dissolving water opens caves and sinkholes and the landscape is called karst.',
    explore: 'The Water Explorer for wells: live well levels picked on the globe, and a Darcy sandbox with sliders for permeability, gradient and area.',
    lab: 'Contour a water table from well levels, draw the flow direction, and size a cone of depression for a given pumping rate; the checker recomputes from the same well data and sandbox inputs.',
    sources: [{ label: 'USGS Water Services', href: 'https://waterservices.usgs.gov/' }],
    reading: [og('11-water', 'Water'), wp('Darcy%27s_law', 'Darcy’s law')],
  },
  15: {
    orientation:
      'Ice, wind and waves each leave a signature. Glaciers carve U-shaped valleys and leave moraines and erratics; wind sorts sand into dunes and polishes stone; waves cut cliffs, build beaches and move sand along the shore. Sea level has risen and fallen by more than a hundred metres as ice sheets grew and shrank, and the coast records it.',
    explore: 'The Surface Sandbox in glacier, wind and wave modes, and paired elevation models of glaciated and unglaciated valleys to compare.',
    lab: 'Identify landforms on elevation models and run a sea-level change scenario on a coastal profile; the checker compares picks against the labelled features in the same tiles.',
    sources: [{ label: 'USGS 3D Elevation Program', href: 'https://www.usgs.gov/3d-elevation-program' }],
    reading: [og('14-glaciers', 'Glaciers'), og('13-deserts', 'Deserts'), og('12-coastlines', 'Coastlines')],
  },
  16: {
    orientation:
      'Slopes fail when the pull of gravity along the slope beats the strength holding the material together; water adds weight and lifts grains apart, roots bind, and steepness sets the odds. The rocks and fluids we take from the ground are a geology of their own, and the climate record in ice, sediment and rock is read with the same tools as the rest of the course.',
    explore: 'The Resources and Hazards overlay: a slope-stability sandbox with sliders for angle, water and vegetation, and map layers of landslide inventories and resource districts from public sources.',
    lab: 'Find the failure angle for given material, water and vegetation settings and explain each slider’s effect; the checker recomputes the factor of safety from the same inputs.',
    sources: [{ label: 'USGS Landslide Hazards Program', href: 'https://www.usgs.gov/programs/landslide-hazards' }],
    reading: [og('10-mass-wasting', 'Mass wasting'), og('16-energy-and-mineral-resources', 'Energy and mineral resources'), og('15-global-climate-change', 'Global climate change')],
  },
  17: {
    orientation:
      'Where plates converge the crust shortens: layers fold into anticlines and synclines, break along thrust and normal and strike-slip faults, and stack into mountains. Reading these structures is geometry, and a stereonet is the geometer’s tool for plotting planes and lines on a sphere.',
    explore: 'The Map Workshop in three dimensions: block models of folds and faults to rotate and slice, and a basic stereonet.',
    lab: 'Build a block model from a map pattern, name the structure, and plot two planes on the stereonet; the checker compares the model and plot against the generating structure.',
    sources: [{ label: 'USGS 3D Elevation Program', href: 'https://www.usgs.gov/3d-elevation-program' }],
    reading: [og('9-crustal-deformation-and-earthquakes', 'Crustal deformation and earthquakes'), wp('Stereographic_projection', 'Stereographic projection')],
  },
  18: {
    orientation:
      'The same processes shape other worlds with different ingredients: basalt plains and shield volcanoes, dunes, dry river channels and ice. Where there is no rock to sample, surfaces are dated by counting craters, since older ground has collected more. The week closes by setting the whole course side by side with another planet.',
    explore: 'The globe with elevation models of the Moon and Mars in place of Earth, for the same layer tools to run on.',
    lab: 'Count craters above a size threshold in two regions and rank their ages; the checker counts the same catalogued craters in the same boxes.',
    sources: [{ label: 'USGS Astrogeology Science Center', href: 'https://www.usgs.gov/centers/astrogeology-science-center' }],
    reading: [wp('Planetary_geology', 'Planetary geology'), wp('Crater_counting', 'Crater counting')],
  },
}

const Links = ({ items }: { items: { label: string; href: string }[] }) => (
  <ul className="list-disc pl-5">
    {items.map((item) => (
      <li key={item.href}>
        <a className={link} href={item.href} rel="noreferrer">
          {item.label}
        </a>
      </li>
    ))}
  </ul>
)

const Draft = ({ children }: { children: string }) => (
  <p role="status" className="max-w-prose rounded-md border border-dashed p-3 text-sm text-muted-foreground">
    {children}
  </p>
)

/** The four tabs of a planned week, built from its plan. */
export function scaffoldWeek(plan: WeekPlan): WeekContent {
  return {
    Learn: () => (
      <div className="grid max-w-prose gap-6">
        <Draft>This week is planned, not built: the text below is an outline for review and will grow into the lesson.</Draft>
        <section aria-labelledby="orientation-heading">
          <h2 id="orientation-heading" className="mb-1 text-lg font-medium">
            This week
          </h2>
          <p>{plan.orientation}</p>
        </section>
        <section aria-labelledby="reading-heading">
          <h2 id="reading-heading" className="mb-1 text-lg font-medium">
            Reading
          </h2>
          <Links items={plan.reading} />
        </section>
      </div>
    ),
    Explore: () => (
      <div className="grid max-w-prose gap-6">
        <Draft>The explorer for this topic is not built yet. Here is what it will do and where its data will come from.</Draft>
        <p>{plan.explore}</p>
        <section aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="mb-1 text-lg font-medium">
            Data sources
          </h2>
          <Links items={plan.sources} />
        </section>
      </div>
    ),
    Lab: () => (
      <div className="grid max-w-prose gap-6">
        <Draft>The lab for this topic is not built yet; nothing here saves. Here is the worksheet as planned.</Draft>
        <p>{plan.lab}</p>
      </div>
    ),
    questions: [],
  }
}

/** A planned week with some tabs already built: the scaffold with those tabs replaced. */
export function plannedWeek(week: number, built: Partial<WeekContent> = {}): WeekContent {
  const plan = PLANS[week]
  if (!plan) throw new Error(`week ${week} has no plan`)
  return { ...scaffoldWeek(plan), ...built }
}
