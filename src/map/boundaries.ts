import type { BoundaryLine } from '@/engine/tectonics/boundaries'
import type { BoundaryKind } from '@/engine/tectonics/motion'
import type { LineLayer } from './types'

/** One feature of data/tectonics/pb2002-boundaries.json. */
export interface BoundaryFeature {
  properties: { boundary: string; kind: string }
  geometry: { coordinates: number[][] }
}

export const BOUNDARY_COLOUR: Record<BoundaryKind, string> = { divergent: '#dc2626', convergent: '#2563eb', transform: '#16a34a' }
export const BOUNDARY_LABEL: Record<BoundaryKind, string> = { divergent: 'Divergent (ridge, rift)', convergent: 'Convergent (trench, collision)', transform: 'Transform' }

const kindOf = (f: BoundaryFeature): BoundaryKind => f.properties.kind as BoundaryKind

/** The bundled boundaries as a line layer coloured by kind. */
export const boundaryLayer = (features: BoundaryFeature[]): LineLayer => ({
  id: 'boundaries',
  lines: features.map((f, i) => ({ id: `${f.properties.boundary}-${i}`, coordinates: f.geometry.coordinates as [number, number][], colour: BOUNDARY_COLOUR[kindOf(f)], width: 1.5 })),
})

/** The same features in the engine's shape, for nearestBoundary. */
export const boundaryLines = (features: BoundaryFeature[]): BoundaryLine[] => features.map((f) => ({ kind: kindOf(f), coordinates: f.geometry.coordinates as [number, number][] }))
