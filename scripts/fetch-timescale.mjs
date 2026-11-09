// Bundles the international geologic time scale (eras and periods) from Macrostrat's definitions API, CC BY 4.0.
import { mkdirSync, writeFileSync } from 'node:fs'

const API = 'https://macrostrat.org/api/v2/defs/intervals'
const OUT = 'data/timescale'
mkdirSync(OUT, { recursive: true })
const index = { source: 'Macrostrat, international geologic time scale intervals', url: API, licence: 'CC BY 4.0 (as stated in the API response)', fetched: new Date().toISOString().slice(0, 10), scales: {} }
for (const scale of ['eras', 'periods']) {
  const url = `${API}?timescale=international%20${scale}`
  const { success } = await (await fetch(url, { headers: { 'User-Agent': 'StrataLab/0.1 (open-source geology learning app; +https://stratalab.app)' } })).json()
  const rows = success.data.map((r) => ({ name: r.name, abbrev: r.abbrev, startMa: r.b_age, endMa: r.t_age, colour: r.color })).sort((a, b) => a.endMa - b.endMa)
  writeFileSync(`${OUT}/${scale}.json`, JSON.stringify(rows, null, 2) + '\n')
  index.scales[scale] = { url, licence: success.license, count: rows.length }
  console.log(`${scale}: ${rows.length} intervals`)
}
writeFileSync(`${OUT}/index.json`, JSON.stringify(index, null, 2) + '\n')
