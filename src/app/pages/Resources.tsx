import { PageHeader } from '@/app/PageHeader'

const link = 'font-medium underline-offset-4 hover:underline'

/**
 * Where the data comes from and where to go further: public mapping and data services, each with one neutral line.
 * Nothing here is copied from a source; the lines say what a service serves.
 */
const SECTIONS: { title: string; items: { name: string; url: string; what: string }[] }[] = [
  {
    title: 'Geologic and topographic maps',
    items: [
      { name: 'USGS National Map', url: 'https://apps.nationalmap.gov/viewer/', what: 'Topography, elevation, hydrography and imagery for the United States, as an interactive viewer and downloads.' },
      { name: 'USGS National Geologic Map Database', url: 'https://ngmdb.usgs.gov/', what: 'Catalogue and viewer of published geologic maps, with the mapview tool for browsing them in place.' },
      { name: 'Macrostrat', url: 'https://macrostrat.org/', what: 'Geologic map units and stratigraphic columns with ages and lithologies, worldwide, with an open API.' },
      { name: 'OpenTopography', url: 'https://opentopography.org/', what: 'High-resolution elevation data and lidar point clouds, with tools to process them.' },
      { name: 'Esri Living Atlas', url: 'https://livingatlas.arcgis.com/', what: 'A catalogue of ready-to-use map layers, including geology, soils, elevation and imagery.' },
      { name: 'USGS Mineral Resources Online Spatial Data', url: 'https://mrdata.usgs.gov/', what: 'Geologic maps, geochemistry, geophysics and mineral deposit data as map services and downloads.' },
    ],
  },
  {
    title: 'Live Earth',
    items: [
      { name: 'USGS Earthquake Hazards Program', url: 'https://earthquake.usgs.gov/earthquakes/map/', what: 'Recent earthquakes on a map, updated every minute; the source of the quakes on this app\'s globe.' },
      { name: 'USGS Water Data', url: 'https://waterdata.usgs.gov/', what: 'Stream discharge, stage and groundwater levels from gauges, live and historical.' },
      { name: 'Smithsonian Global Volcanism Program', url: 'https://volcano.si.edu/', what: 'A database of volcanoes and their eruptions, with weekly activity reports.' },
      { name: 'EarthScope Consortium', url: 'https://www.earthscope.org/data/', what: 'Seismic and geodetic data, including GPS station velocities that record plate motion.' },
      { name: 'NASA Worldview', url: 'https://worldview.earthdata.nasa.gov/', what: 'Daily satellite imagery of the whole planet, browsable by date and layer.' },
      { name: 'GPlates Web Service', url: 'https://gwsdoc.gplates.org/', what: 'Plate reconstructions: where any point sat on the globe at any time in the past.' },
    ],
  },
  {
    title: 'Minerals and rocks',
    items: [
      { name: 'Mindat', url: 'https://www.mindat.org/', what: 'The largest open database of minerals, with properties, photographs and localities.' },
      { name: 'webmineral', url: 'https://webmineral.com/', what: 'Mineral data sheets with structures, physical properties and X-ray data.' },
      { name: 'Handbook of Mineralogy', url: 'https://handbookofmineralogy.org/', what: 'The Mineralogical Society of America\'s reference sheets, one PDF per mineral.' },
      { name: 'Crystallography Open Database', url: 'https://www.crystallography.net/cod/', what: 'Public-domain crystal structures; the source of the structures in the Mineral Inspector.' },
      { name: 'American Mineralogist Crystal Structure Database', url: 'https://rruff.geo.arizona.edu/AMS/amcsd.php', what: 'Structures published in the mineralogical journals, searchable by mineral.' },
    ],
  },
  {
    title: 'Learning',
    items: [
      { name: 'An Introduction to Geology', url: 'https://opengeology.org/textbook/', what: 'An open textbook for introductory physical geology; the reading this course links to.' },
      { name: 'USGS Education', url: 'https://www.usgs.gov/educational-resources', what: 'Lessons, maps and explainers from the survey.' },
      { name: 'Valence', url: 'https://firetailfab.com/valence/', what: 'This app\'s chemistry sibling: molecules, a periodic table and virtual labs, built the same way.' },
    ],
  },
]

export function Resources() {
  return (
    <>
      <PageHeader title="Maps and data" />
      <p className="mb-6 max-w-prose text-muted-foreground">
        The public services this course draws on and the places to go further. None of them is connected with Strata.
      </p>
      <div className="grid gap-6">
        {SECTIONS.map((section) => (
          <section key={section.title} aria-labelledby={`res-${section.title}`}>
            <h2 id={`res-${section.title}`} className="mb-2 text-lg font-medium">
              {section.title}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {section.items.map((item) => (
                <li key={item.url} className="rounded-lg border bg-card p-3">
                  <a className={link} href={item.url} rel="noreferrer">
                    {item.name}
                  </a>
                  <p className="mt-1 text-sm text-muted-foreground">{item.what}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
