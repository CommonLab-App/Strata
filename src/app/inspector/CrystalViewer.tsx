import { lazy, Suspense, useEffect, useState } from 'react'
import { useAppState } from '@/app/AppState'
import { settled } from '@/app/settled'
import { Button } from '@/components/ui/button'
import type { Cif } from '@/engine/crystal/cif'
import type { CrystalOptions } from './scene/CrystalScene'
import { ELEMENT_COLOUR } from './elementColours'

const CrystalScene = lazy(() => import('./scene/CrystalScene'))
const cifFiles = import.meta.glob('../../../data/cif/*.cif', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>

/** Loads one structure file lazily; the Three.js chunk comes with it, after the page has painted. */
export function CrystalViewer({ cifId, provenance }: { cifId: string; provenance: { cod: string; url: string; spaceGroup: string | null; formula: string | null } }) {
  const { reducedMotion } = useAppState()
  const [cif, setCif] = useState<Cif | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<CrystalOptions>({ repeat: 1, showBonds: true, showCell: true, polyhedra: false })

  useEffect(() => {
    let cancelled = false
    settled()
      .then(async () => {
        const load = cifFiles[`../../../data/cif/${cifId}.cif`]
        if (!load) throw new Error(`no structure file for ${cifId}`)
        const [{ parseCif }, text] = await Promise.all([import('@/engine/crystal/cif'), load()])
        if (!cancelled) setCif(parseCif(text))
      })
      .catch((e) => !cancelled && setError(String(e)))
    return () => {
      cancelled = true
    }
  }, [cifId])

  const elements = cif ? [...new Set(cif.sites.map((s) => s.element))] : []
  const toggle = (key: keyof CrystalOptions) => setOptions((o) => ({ ...o, [key]: !o[key] }))

  return (
    <section aria-labelledby="crystal-heading" className="grid gap-2">
      <h2 id="crystal-heading" className="text-lg font-medium">
        Crystal structure
      </h2>
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : cif ? (
        <Suspense fallback={<div className="aspect-[4/3] w-full rounded-lg bg-muted" />}>
          <CrystalScene cif={cif} options={options} reducedMotion={reducedMotion} />
        </Suspense>
      ) : (
        <div className="aspect-[4/3] w-full rounded-lg bg-muted" aria-busy="true" />
      )}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Viewer options">
        <Button size="sm" variant={options.repeat === 2 ? 'default' : 'outline'} aria-pressed={options.repeat === 2} onClick={() => setOptions((o) => ({ ...o, repeat: o.repeat === 2 ? 1 : 2 }))}>
          2×2×2
        </Button>
        <Button size="sm" variant={options.showBonds ? 'default' : 'outline'} aria-pressed={options.showBonds} onClick={() => toggle('showBonds')}>
          Bonds
        </Button>
        <Button size="sm" variant={options.showCell ? 'default' : 'outline'} aria-pressed={options.showCell} onClick={() => toggle('showCell')}>
          Unit cell
        </Button>
        {elements.includes('Si') && (
          <Button size="sm" variant={options.polyhedra ? 'default' : 'outline'} aria-pressed={options.polyhedra} onClick={() => toggle('polyhedra')}>
            Tetrahedra
          </Button>
        )}
      </div>
      {elements.length > 0 && (
        <ul className="flex flex-wrap gap-3 text-sm" aria-label="Elements">
          {elements.map((el) => (
            <li key={el} className="flex items-center gap-1">
              <span className="inline-block size-3 rounded-full" style={{ background: ELEMENT_COLOUR[el] ?? '#999' }} aria-hidden="true" />
              {el}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        Structure from the{' '}
        <a className="underline underline-offset-4" href={provenance.url} rel="noreferrer">
          Crystallography Open Database, entry {provenance.cod}
        </a>
        {provenance.spaceGroup && <>, space group {provenance.spaceGroup}</>}
        {provenance.formula && <>, cell content {provenance.formula}</>}. Drag to orbit, scroll to zoom.
      </p>
    </section>
  )
}
