// Bundles the Moon's larger craters for week 18 from the Robbins (2018) lunar crater database (USGS Astrogeology,
// a 96 MB zip holding a 1.3 million-row CSV). Only craters at or above MIN_KM are kept, as [lat, lon, diameter].
// Usage: node scripts/fetch-craters.mjs [path to the extracted CSV]   (downloads and unzips when no path is given)
import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

const ZIP_URL = 'https://astrogeology.usgs.gov/ckan/dataset/f89f5478-b69a-486c-b9b5-30d7b0c5ad2b/resource/c4f25cc2-4f8a-4207-a845-5e176da3ac5a/download/lunar_crater_database_robbins_2018'
const PAGE = 'https://astrogeology.usgs.gov/search/map/Moon/Research/Craters/lunar_crater_database_robbins_2018'
const MIN_KM = 20
const OUT = 'data/craters'

let csv = process.argv[2]
if (!csv) {
  const dir = join(tmpdir(), 'robbins2018')
  mkdirSync(dir, { recursive: true })
  const zip = join(dir, 'robbins2018.zip')
  if (!existsSync(zip)) {
    console.log('downloading 96 MB…')
    writeFileSync(zip, Buffer.from(await (await fetch(ZIP_URL)).arrayBuffer()))
  }
  execFileSync('unzip', ['-o', '-q', zip, '-d', dir])
  csv = join(dir, 'lunar_crater_database_robbins_2018_bundle', 'data', 'lunar_crater_database_robbins_2018.csv')
}

const craters = []
let header = null
for await (const line of createInterface({ input: createReadStream(csv) })) {
  const cols = line.split(',')
  if (!header) {
    header = Object.fromEntries(cols.map((c, i) => [c, i]))
    continue
  }
  const d = Number(cols[header.DIAM_CIRC_IMG])
  if (!(d >= MIN_KM)) continue
  const lat = Number(cols[header.LAT_CIRC_IMG])
  let lon = Number(cols[header.LON_CIRC_IMG])
  if (lon > 180) lon -= 360
  craters.push([Math.round(lat * 100) / 100, Math.round(lon * 100) / 100, Math.round(d * 10) / 10])
}
craters.sort((a, b) => b[2] - a[2])
mkdirSync(OUT, { recursive: true })
writeFileSync(`${OUT}/moon.json`, JSON.stringify({ source: 'Robbins (2018) lunar crater database, USGS Astrogeology Science Center', url: PAGE, licence: 'US government work (USGS); cite Robbins, S. J. (2018), J. Geophys. Res. Planets', fetched: new Date().toISOString().slice(0, 10), minDiameterKm: MIN_KM, craters }))
console.log(`${craters.length} craters at least ${MIN_KM} km across -> ${OUT}/moon.json`)
