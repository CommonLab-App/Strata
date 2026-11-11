import { lazy, Suspense, useEffect, useState } from 'react'
import { settled } from '@/app/settled'
import type { VolcanoType } from '@/engine/volcano/shape'

const VolcanoScene = lazy(() => import('./scene/VolcanoScene'))

const TYPES: Record<string, VolcanoType> = { shield: 'shield', strato: 'strato', cinder: 'cinder', caldera: 'caldera' }

const Placeholder = () => (
  <div className="grid aspect-[4/3] w-full place-items-center rounded-lg bg-muted text-sm text-muted-foreground" aria-busy="true">
    Loading the model…
  </div>
)

/** The volcano model you can turn, under the week-5 drawing: the Three.js chunk loads only after the page has painted. */
export function VolcanoTurntable({ variant }: { variant: string }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    settled().then(() => !cancelled && setReady(true))
    return () => {
      cancelled = true
    }
  }, [])
  const type = TYPES[variant] ?? 'shield'
  return (
    <div className="grid gap-1">
      {ready ? (
        <Suspense fallback={<Placeholder />}>
          <VolcanoScene type={type} />
        </Suspense>
      ) : (
        <Placeholder />
      )}
      <p className="text-xs text-muted-foreground">Turn the model: drag.</p>
    </div>
  )
}
