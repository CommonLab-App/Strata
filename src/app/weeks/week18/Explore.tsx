import { useEffect, useState } from 'react'
import { DataFooter } from '@/app/week/DataFooter'
import { Button } from '@/components/ui/button'
import { loadMoonCraters, type Catalogue } from '@/data/craters/schema'
import type { Crater } from '@/engine/craters'
import { PLANETS, type PlanetId } from '@/map/planets'
import { PlanetGlobe } from './PlanetGlobe'

const THRESHOLDS = [20, 50, 100]

/** Week 18: the globe as the Moon or Mars, with the Moon's larger craters from a published catalogue. */
export function Explore() {
  const [planet, setPlanet] = useState<PlanetId>('moon')
  const [minDiameter, setMinDiameter] = useState(50)
  const [showCraters, setShowCraters] = useState(true)
  const [moon, setMoon] = useState<{ catalogue: Catalogue; craters: Crater[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    loadMoonCraters()
      .then(setMoon)
      .catch((e) => setError(String(e)))
  }, [])
  const craters = planet === 'moon' && showCraters && moon ? moon.craters : []
  return (
    <div className="grid max-w-prose gap-4">
      <p className="text-muted-foreground">
        The same tools, another world. The Moon has no air, water or plate tectonics, so almost every landform on it
        is an impact crater or a lava plain, and the number of craters on a surface is its clock: old ground has
        collected more. Mars has craters too, but also volcanoes, canyons, dunes and dry channels that the Earth
        topics have prepared you to read.
      </p>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="World">
        {(Object.keys(PLANETS) as PlanetId[]).map((id) => (
          <Button key={id} size="sm" variant={id === planet ? 'default' : 'outline'} aria-pressed={id === planet} onClick={() => setPlanet(id)}>
            {PLANETS[id].name}
          </Button>
        ))}
        {planet === 'moon' && (
          <>
            <Button size="sm" variant={showCraters ? 'default' : 'outline'} aria-pressed={showCraters} onClick={() => setShowCraters((v) => !v)}>
              Craters
            </Button>
            <span className="ml-2 text-sm text-muted-foreground">at least</span>
            {THRESHOLDS.map((d) => (
              <Button key={d} size="sm" variant={d === minDiameter ? 'default' : 'outline'} aria-pressed={d === minDiameter} onClick={() => setMinDiameter(d)}>
                {d} km
              </Button>
            ))}
          </>
        )}
      </div>
      <p className="text-sm">
        {PLANETS[planet].name} in the{' '}
        <a href={PLANETS[planet].page} className="underline underline-offset-4" rel="noreferrer">
          NASA Trek
        </a>{' '}
        global mosaic.
        {planet === 'moon' && moon && showCraters && ` ${craters.filter((c) => c.diameter >= minDiameter).length.toLocaleString()} catalogued craters at least ${minDiameter} km across are marked.`}
      </p>
      <p className="text-sm text-muted-foreground" role="status">
        {planet === 'moon' && !moon && !error ? 'Loading the crater catalogue…' : ''}
      </p>
      <PlanetGlobe key={planet} planet={planet} craters={craters} minDiameter={minDiameter}>
        <p className="text-xs text-muted-foreground">The mosaic tiles are equirectangular and are stretched onto the globe, so shapes near the poles are squeezed; counting is done in the mid-latitudes.</p>
      </PlanetGlobe>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          The catalogue could not load: {error}
        </p>
      )}
      {moon && <DataFooter snapshot={{ fetched_at: moon.catalogue.fetched, source_url: moon.catalogue.url, data: null }} attribution={moon.catalogue.source} />}
    </div>
  )
}
