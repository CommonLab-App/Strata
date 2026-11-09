// Fetches the Smithsonian Global Volcanism Program Holocene volcano and eruption tables (WFS, GeoJSON) into
// data/volcanoes/ and records provenance.    node scripts/fetch-gvp.mjs
// The service sends no CORS header, so the browser cannot call it; the app reads this bundle instead. The GVP's
// prose summaries, photos, country and region fields are left out: the card links to the GVP page for those.
import { writeFileSync } from 'node:fs'

const WFS = 'https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=2.0.0&request=GetFeature&outputFormat=json&typeName=GVP-VOTW:'
const get = async (layer) => {
  const res = await fetch(WFS + layer, { headers: { 'user-agent': 'StrataLab/0.1 (open-source geology learning app; +https://stratalab.app)' } })
  if (!res.ok) throw new Error(`${layer} ${res.status}`)
  return res.json()
}
const [volcanoes, eruptions] = await Promise.all([get('Smithsonian_VOTW_Holocene_Volcanoes'), get('Smithsonian_VOTW_Holocene_Eruptions')])

const byVolcano = new Map()
for (const { properties: e } of eruptions.features) {
  if (e.StartDateYear === null || e.StartDateYear === undefined) continue
  const list = byVolcano.get(e.Volcano_Number) ?? []
  // [start year, VEI or null, confirmed]
  list.push([e.StartDateYear, e.ExplosivityIndexMax ?? null, e.Activity_Type === 'Confirmed Eruption'])
  byVolcano.set(e.Volcano_Number, list)
}
const round = (x, d) => (x === null || x === undefined ? null : Math.round(x * 10 ** d) / 10 ** d)
const rows = volcanoes.features
  .map(({ properties: p }) => ({
    number: p.Volcano_Number,
    name: p.Volcano_Name,
    type: p.Primary_Volcano_Type,
    lat: round(p.Latitude, 3),
    lon: round(p.Longitude, 3),
    elevation: p.Elevation ?? null,
    setting: p.Tectonic_Setting ?? null,
    rock: p.Major_Rock_Type && !/^No Data/.test(p.Major_Rock_Type) ? p.Major_Rock_Type : null,
    lastEruption: p.Last_Eruption_Year ?? null,
    eruptions: (byVolcano.get(p.Volcano_Number) ?? []).sort((a, b) => a[0] - b[0]),
  }))
  .sort((a, b) => a.number - b.number)

const fetched = new Date().toISOString().slice(0, 10)
writeFileSync('data/volcanoes/holocene.json', JSON.stringify(rows))
writeFileSync(
  'data/volcanoes/index.json',
  JSON.stringify(
    {
      holocene: {
        title: 'Volcanoes of the World, Holocene volcanoes and eruptions',
        source: 'Global Volcanism Program, Smithsonian Institution',
        urls: ['Smithsonian_VOTW_Holocene_Volcanoes', 'Smithsonian_VOTW_Holocene_Eruptions'].map((l) => WFS + l),
        pageUrl: 'https://volcano.si.edu/volcano.cfm?vn=',
        licence: 'pending: see docs/DATA-SOURCES.md',
        fetched,
        volcanoes: rows.length,
        eruptions: rows.reduce((n, r) => n + r.eruptions.length, 0),
        eruption: '[start year, VEI max or null, confirmed]',
      },
    },
    null,
    2,
  ) + '\n',
)
console.log(`${rows.length} volcanoes, ${rows.reduce((n, r) => n + r.eruptions.length, 0)} dated eruptions`)
