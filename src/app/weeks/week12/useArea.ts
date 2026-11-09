import { useEffect, useState } from 'react'
import { gridOf, loadArea, type Area, type AreaId } from '@/data/terrain/schema'
import type { Grid } from '@/engine/topo'

/** One bundled area and its grid, loaded with the pane. */
export function useArea(id: AreaId): { area: Area | null; grid: Grid | null; error: string | null } {
  const [area, setArea] = useState<Area | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    setArea(null)
    loadArea(id)
      .then((a) => !cancelled && setArea(a))
      .catch((e) => !cancelled && setError(String(e)))
    return () => {
      cancelled = true
    }
  }, [id])
  return { area, grid: area ? gridOf(area) : null, error }
}
