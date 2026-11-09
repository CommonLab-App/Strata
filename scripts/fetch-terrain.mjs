// Bundles elevation grids for the Map and Topo Workshop (week 12): one zoom-11 Terrarium tile per area from the
// Terrain Tiles on AWS Open Data, decoded here (the tiles carry no CORS header, so a browser cannot read their
// pixels) and saved as a 128 by 128 grid of metres with the tile's bounds. Areas are given as lat, lon; nothing
// else about them is written down.
import { mkdirSync, writeFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

const Z = 11
const OUT = 'data/terrain'
const AREAS = [
  { id: 'area-1', lat: 46.2, lon: -122.19 },
  { id: 'area-2', lat: 40.72, lon: -77.62 },
  { id: 'area-3', lat: 46.86, lon: -121.76 },
  // A coast for the sea-level task: part sea (heights at or below zero), part low land.
  { id: 'area-4', lat: 37.25, lon: -76.0 },
]

const tileOf = (lat, lon, z) => {
  const n = 2 ** z
  const x = Math.floor(((lon + 180) / 360) * n)
  const r = (lat * Math.PI) / 180
  const y = Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n)
  return { x, y }
}
const boundsOf = (x, y, z) => {
  const n = 2 ** z
  const lon = (i) => (i / n) * 360 - 180
  const lat = (j) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * j) / n))) * 180) / Math.PI
  return { west: lon(x), east: lon(x + 1), north: lat(y), south: lat(y + 1) }
}

/** Minimal PNG decoder for 8-bit RGB or RGBA, non-interlaced: enough for Terrarium tiles. */
function decodePng(buf) {
  let pos = 8
  let width = 0
  let height = 0
  let channels = 0
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      const depth = data[8]
      const colour = data[9]
      if (depth !== 8 || data[12] !== 0) throw new Error(`unsupported PNG: depth ${depth}, interlace ${data[12]}`)
      channels = colour === 2 ? 3 : colour === 6 ? 4 : 0
      if (!channels) throw new Error(`unsupported PNG colour type ${colour}`)
    }
    if (type === 'IDAT') idat.push(data)
    pos += 12 + len
  }
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const out = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride)
    const cur = out.subarray(y * stride, (y + 1) * stride)
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0
      const b = prev[i]
      const c = i >= channels ? prev[i - channels] : 0
      let v = line[i]
      if (filter === 1) v += a
      else if (filter === 2) v += b
      else if (filter === 3) v += (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      cur[i] = v & 255
    }
  }
  return { width, height, channels, pixels: out }
}

mkdirSync(OUT, { recursive: true })
const index = { source: 'Terrain Tiles on AWS Open Data (Terrarium encoding), zoom 11', url: 'https://registry.opendata.aws/terrain-tiles/', licence: 'Per the dataset’s source list; see docs/DATA-SOURCES.md', fetched: new Date().toISOString().slice(0, 10), areas: [] }
for (const area of AREAS) {
  const { x, y } = tileOf(area.lat, area.lon, Z)
  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`
  const png = decodePng(Buffer.from(await (await fetch(url)).arrayBuffer()))
  const step = png.width / 128
  const rows = []
  for (let j = 0; j < 128; j++) {
    const row = []
    for (let i = 0; i < 128; i++) {
      const px = Math.floor(i * step)
      const py = Math.floor(j * step)
      const o = (py * png.width + px) * png.channels
      row.push(Math.round(png.pixels[o] * 256 + png.pixels[o + 1] + png.pixels[o + 2] / 256 - 32768))
    }
    rows.push(row)
  }
  const bounds = boundsOf(x, y, Z)
  const flat = rows.flat()
  writeFileSync(`${OUT}/${area.id}.json`, JSON.stringify({ id: area.id, tile: { z: Z, x, y }, bounds, size: 128, heights: rows, url }))
  index.areas.push({ id: area.id, tile: { z: Z, x, y }, bounds, min: Math.min(...flat), max: Math.max(...flat), url })
  console.log(`${area.id}: tile ${Z}/${x}/${y}, ${Math.min(...flat)} to ${Math.max(...flat)} m`)
}
writeFileSync(`${OUT}/index.json`, JSON.stringify(index, null, 2) + '\n')
