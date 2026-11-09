import type { RasterTiles } from './types'

/**
 * Global mosaics of the Moon and Mars from NASA's Trek tile services (public domain, NASA/JPL-Caltech/USGS).
 * The services use the WMTS "default028mm" tile matrix, which is a plain equirectangular pyramid: at zoom z the
 * world is 2^(z+1) tiles wide and 2^z tall, so MapLibre's web-mercator scheme does not fit it directly; the globe
 * projection stretches these as a texture well enough for a global view, with the latitude squeeze noted.
 * ponytail: good enough for crater counting at continental scale; a reprojecting proxy is the upgrade if the
 * pane ever needs faithful shapes near the poles.
 */
const TREK = 'https://trek.nasa.gov/tiles'

export const PLANETS = {
  moon: {
    name: 'The Moon',
    tiles: { url: `${TREK}/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`, attribution: 'NASA LRO WAC mosaic via NASA Trek', maxZoom: 7 } satisfies RasterTiles,
    radiusKm: 1737.4,
    page: 'https://trek.nasa.gov/moon/',
  },
  mars: {
    name: 'Mars',
    tiles: { url: `${TREK}/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`, attribution: 'NASA Viking MDIM 2.1 mosaic via NASA Trek', maxZoom: 7 } satisfies RasterTiles,
    radiusKm: 3389.5,
    page: 'https://trek.nasa.gov/mars/',
  },
} as const
export type PlanetId = keyof typeof PLANETS
