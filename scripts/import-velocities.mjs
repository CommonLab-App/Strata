// Normalizes a PBO-format GNSS velocity file (EarthScope/GAGE .vel) into data/gnss/ and records provenance.
//   node scripts/import-velocities.mjs incoming/cwu.final_nam14.20231230.vel
// Keeps one segment per station (the longest observation span), the 4-character code, position, and the north, east and
// up velocities with their uncertainties, in mm/yr. The 16-character station names are dropped on purpose: they can
// carry institution names, which this project keeps out of its data.
import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'

const file = process.argv[2]
if (!file) {
  console.error('usage: import-velocities.mjs <file.vel>')
  process.exit(1)
}
const text = readFileSync(file, 'utf8')
const frame = /Reference Frame\s*:\s*(\S+)/.exec(text)?.[1] ?? 'unknown'
const release = /Release Date\s*:\s*(\d{8})/.exec(text)?.[1] ?? ''
const lines = text.split('\n').filter((l) => /^\s?[A-Z0-9]{4}\s/.test(l) && !l.startsWith('*'))

// Columns counted from the end, because the name field may contain spaces.
const mm = (s) => Math.round(Number(s) * 1000 * 100) / 100
const years = (a, b) => (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) + (Number(b.slice(4, 6)) - Number(a.slice(4, 6))) / 12
const best = new Map()
let segments = 0
let refEpoch = ''
for (const line of lines) {
  const c = line.trim().split(/\s+/)
  if (c.length < 29) continue
  segments++
  const n = c.length
  refEpoch ||= c[n - 28].slice(0, 8)
  const row = {
    station: c[0],
    lat: Math.round(Number(c[n - 23]) * 1e4) / 1e4,
    lon: Math.round((((Number(c[n - 22]) + 540) % 360) - 180) * 1e4) / 1e4,
    vn: mm(c[n - 11]),
    ve: mm(c[n - 10]),
    vu: mm(c[n - 9]),
    sn: mm(c[n - 8]),
    se: mm(c[n - 7]),
    su: mm(c[n - 6]),
    from: c[n - 2].slice(0, 4),
    to: c[n - 1].slice(0, 4),
  }
  const span = years(c[n - 2], c[n - 1])
  const prev = best.get(row.station)
  if (!prev || span > prev.span) best.set(row.station, { span, row })
}
const stations = [...best.values()].map((b) => b.row).sort((a, b) => a.station.localeCompare(b.station))
const id = basename(file).replace(/\.vel$/, '')

writeFileSync(`data/gnss/${id}.json`, JSON.stringify({ frame, epoch: refEpoch, stations }))
let index = {}
try {
  index = JSON.parse(readFileSync('data/gnss/index.json', 'utf8'))
} catch {
  /* first file */
}
index[id] = {
  title: `GAGE/CWU combined GNSS velocities, ${frame} frame`,
  source: 'EarthScope Consortium, GAGE Facility; CWU analysis centre combined solution',
  url: `https://gage-data.earthscope.org/archive/gnss/products/velocity/rel_${/\.\d{2}(\d{6})\.vel$/.exec(basename(file))?.[1] ?? ''}/${basename(file)}`,
  release,
  licence: 'pending: see docs/DATA-SOURCES.md',
  fetched: new Date().toISOString().slice(0, 10),
  segments,
  stations: stations.length,
  rule: 'one row per station: the longest observation span; names dropped',
}
writeFileSync('data/gnss/index.json', JSON.stringify(index, null, 2) + '\n')
console.log(`${segments} segments -> ${stations.length} stations, frame ${frame}, epoch ${refEpoch}`)
