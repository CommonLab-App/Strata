// Fetches the Bird (2003) PB2002 plate boundaries into data/tectonics/ and records provenance in index.json.
//   node scripts/fetch-static.mjs
// Source: github.com/fraxen/tectonicplates (ODC-BY 1.0). The boundaries file has no kind, so each step's STEPCLASS is
// taken from the steps file and consecutive steps of one class on one boundary are merged into a LineString.
import { writeFileSync } from 'node:fs'

const REPO = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master'
const STEPS = `${REPO}/GeoJSON/PB2002_steps.json`
const LICENCE = `${REPO}/LICENSE.md`
const KIND = { OSR: 'divergent', CRB: 'divergent', OTF: 'transform', CTF: 'transform', SUB: 'convergent', OCB: 'convergent', CCB: 'convergent' }

const get = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} ${res.status}`)
  return res.json()
}

const steps = (await get(STEPS)).features
  .map((f) => f.properties)
  .sort((a, b) => a.SEQNUM - b.SEQNUM)

const round = (x) => Math.round(x * 100) / 100
const features = []
let current = null
for (const s of steps) {
  const kind = KIND[s.STEPCLASS]
  if (!kind) throw new Error(`unknown step class ${s.STEPCLASS}`)
  const start = [round(s.STARTLONG), round(s.STARTLAT)]
  const end = [round(s.FINALLONG), round(s.FINALLAT)]
  const joins = current && current.properties.boundary === s.PLATEBOUND && current.properties.kind === kind && same(current.geometry.coordinates.at(-1), start)
  if (joins) current.geometry.coordinates.push(end)
  else {
    current = { type: 'Feature', properties: { boundary: s.PLATEBOUND, kind }, geometry: { type: 'LineString', coordinates: [start, end] } }
    features.push(current)
  }
}
function same(a, b) {
  return Math.abs(a[0] - b[0]) < 0.011 && Math.abs(a[1] - b[1]) < 0.011
}

writeFileSync('data/tectonics/pb2002-boundaries.json', JSON.stringify({ type: 'FeatureCollection', features }))
writeFileSync(
  'data/tectonics/index.json',
  JSON.stringify(
    {
      'pb2002-boundaries': {
        title: 'PB2002 plate boundaries (Bird, 2003)',
        citation: 'Bird, P. (2003) An updated digital model of plate boundaries. Geochemistry, Geophysics, Geosystems 4(3), 1027.',
        url: STEPS,
        licence: 'ODC-BY 1.0',
        licenceUrl: LICENCE,
        fetched: new Date().toISOString().slice(0, 10),
        steps: steps.length,
        features: features.length,
        kinds: Object.fromEntries(Object.keys(KIND).map((k) => [k, KIND[k]])),
      },
    },
    null,
    2,
  ) + '\n',
)
console.log(`${steps.length} steps -> ${features.length} lines`)
