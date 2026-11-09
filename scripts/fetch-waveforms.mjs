// Bundles teaching earthquakes for the week-9 epicentre lab: for each of the largest shallow events of recent years
// in the USGS catalogue, three broadband stations 200 to 1500 km away with open vertical records in the EarthScope
// archive. Each record is fetched once as GeoCSV, block-averaged to 1 Hz, scaled to its largest value and saved with
// provenance. Reference picks are the two-layer model's predicted arrivals (src/engine/seismic/travelTime.ts) at the
// catalogue distance; reviewers may replace them by hand in the JSON.
// Usage: node scripts/fetch-waveforms.mjs [events wanted, default 4]
import { mkdirSync, writeFileSync } from 'node:fs'

const WANT = Number(process.argv[2] ?? 4)
const UA = 'StrataLab/0.1 (open-source geology learning app; +https://stratalab.app)'
const USGS = 'https://earthquake.usgs.gov/fdsnws/event/1/query'
const FDSN = 'https://service.earthscope.org/fdsnws'
const OUT = 'data/seismograms'
const WINDOW_S = 480 // after the origin; the slowest S of the model at 1500 km arrives near 340 s
const LEAD_S = 30
const R = 6371

// Mirrors src/engine/seismic/travelTime.ts (two-layer crust and mantle, surface focus).
const MODEL = { crustKm: 35, vp: 6.1, vs: 3.5, vpn: 8.0, vsn: 4.5 }
const firstArrival = (km, v, vn) => Math.min(km / v, km / vn + 2 * MODEL.crustKm * Math.sqrt(1 / v ** 2 - 1 / vn ** 2))
const predicted = (km) => ({ p: firstArrival(km, MODEL.vp, MODEL.vpn), s: firstArrival(km, MODEL.vs, MODEL.vsn) })

const rad = (d) => (d * Math.PI) / 180
const distanceKm = (a, b) => {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
const azimuth = (a, b) => {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat))
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

const get = async (url) => {
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.text()
}

const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, '')

async function stationsNear(ev, t0, t1) {
  const url = `${FDSN}/station/1/query?level=channel&cha=BHZ&latitude=${ev.lat}&longitude=${ev.lon}&minradius=1.8&maxradius=13.5&starttime=${t0}&endtime=${t1}&includerestricted=false&format=text`
  const text = await get(url)
  const seen = new Map()
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue
    const [net, sta, loc, , lat, lon] = line.split('|')
    const key = `${net}.${sta}`
    const s = { net, sta, loc, lat: Number(lat), lon: Number(lon) }
    s.km = distanceKm(ev, s)
    s.az = azimuth(ev, s)
    // Prefer the primary location code; the service lists every epoch, so keep one per station.
    if (!seen.has(key) || (loc === '00' && seen.get(key).loc !== '00')) seen.set(key, s)
  }
  return [...seen.values()].filter((s) => s.km >= 200 && s.km <= 1500)
}

async function trace(s, originMs) {
  const start = iso(originMs - LEAD_S * 1000)
  const end = iso(originMs + WINDOW_S * 1000)
  const url = `${FDSN}/dataselect/1/query?net=${s.net}&sta=${s.sta}&loc=${s.loc || '--'}&cha=BHZ&starttime=${start}&endtime=${end}&format=geocsv`
  const text = await get(url)
  const rows = []
  let rate = 0
  for (const line of text.split('\n')) {
    if (line.startsWith('# sample_rate_hz')) rate = Number(line.split(':')[1])
    if (!line || line.startsWith('#') || line.startsWith('Time')) continue
    const [t, v] = line.split(',')
    rows.push([Date.parse(t.trim()), Number(v)])
  }
  if (rows.length < rate * (WINDOW_S + LEAD_S) * 0.9) throw new Error(`gappy record ${s.net}.${s.sta}: ${rows.length} samples`)
  const first = rows[0][0]
  const mean = rows.reduce((a, r) => a + r[1], 0) / rows.length
  const seconds = Math.floor(rows.length / rate)
  const samples = []
  for (let i = 0; i < seconds; i++) {
    const block = rows.slice(i * rate, (i + 1) * rate)
    samples.push(block.reduce((a, r) => a + r[1] - mean, 0) / block.length)
  }
  const peak = Math.max(...samples.map(Math.abs)) || 1
  return { start: new Date(first).toISOString(), hz: 1, samples: samples.map((v) => Math.round((v / peak) * 1000) / 1000), request: url, offsetS: (originMs - first) / 1000 }
}

mkdirSync(OUT, { recursive: true })
const catalogue = JSON.parse(await get(`${USGS}?format=geojson&minmagnitude=6&maxmagnitude=7.6&maxdepth=40&starttime=2023-01-01&endtime=2025-12-31&orderby=magnitude&limit=40`))
const index = { source: 'USGS Earthquake Hazards Program (catalogue); EarthScope Consortium FDSN station and dataselect services (waveforms)', licence: 'USGS: public domain. Waveforms: see docs/DATA-SOURCES.md', fetched: new Date().toISOString().slice(0, 10), model: MODEL, events: [] }
for (const f of catalogue.features) {
  if (index.events.length >= WANT) break
  const [lon, lat, depth] = f.geometry.coordinates
  const ev = { id: f.id, time: new Date(f.properties.time).toISOString(), lat, lon, depthKm: depth, mag: f.properties.mag, place: f.properties.place, url: f.properties.url }
  try {
    const stations = await stationsNear(ev, iso(f.properties.time - LEAD_S * 1000), iso(f.properties.time + WINDOW_S * 1000))
    if (stations.length < 3) {
      console.log(`skip ${ev.id} M${ev.mag}: ${stations.length} stations in range`)
      continue
    }
    // Three stations spread in azimuth: the best-separated triple among the closest fifteen, by distance.
    stations.sort((a, b) => a.km - b.km)
    const pool = stations.slice(0, 15)
    const picked = []
    for (const s of pool) {
      if (picked.every((p) => Math.min(Math.abs(p.az - s.az), 360 - Math.abs(p.az - s.az)) > 60)) {
        try {
          const t = await trace(s, f.properties.time)
          picked.push({ ...s, ...t })
        } catch (e) {
          console.log(`  no record ${s.net}.${s.sta}: ${e.message}`)
        }
      }
      if (picked.length === 3) break
    }
    if (picked.length < 3) {
      console.log(`skip ${ev.id} M${ev.mag}: only ${picked.length} usable records`)
      continue
    }
    const out = {
      event: ev,
      stations: picked.map((s) => {
        const { p, s: sArr } = predicted(s.km)
        return { net: s.net, sta: s.sta, loc: s.loc, lat: s.lat, lon: s.lon, km: Math.round(s.km * 10) / 10, azimuth: Math.round(s.az), start: s.start, hz: s.hz, samples: s.samples, refP: Math.round((p + s.offsetS) * 10) / 10, refS: Math.round((sArr + s.offsetS) * 10) / 10, request: s.request }
      }),
    }
    writeFileSync(`${OUT}/${ev.id}.json`, JSON.stringify(out))
    index.events.push({ id: ev.id, mag: ev.mag, time: ev.time, stations: out.stations.map((s) => `${s.net}.${s.sta} ${s.km} km`) })
    console.log(`saved ${ev.id} M${ev.mag}: ${out.stations.map((s) => `${s.net}.${s.sta} ${s.km} km az ${s.azimuth}`).join(', ')}`)
  } catch (e) {
    console.log(`skip ${ev.id}: ${e.message}`)
  }
}
writeFileSync(`${OUT}/index.json`, JSON.stringify(index, null, 2) + '\n')
console.log(`${index.events.length} events in ${OUT}`)
