import { velocityFieldSchema, type VelocityField } from '@/data/gnss/schema'
import type { BoundaryLine } from '@/engine/tectonics/boundaries'
import { boundaryLines, type BoundaryFeature } from '@/map/boundaries'

export interface Bundle {
  field: VelocityField
  gnss: { fetched: string; url: string }
  boundaries: BoundaryFeature[]
  lines: BoundaryLine[]
  pb2002: { fetched: string; url: string }
}

/** The week's bundled data, a few hundred kilobytes, loaded with the pane rather than the app. */
export async function loadBundle(): Promise<Bundle> {
  const [field, gnssIndex, pb, pbIndex] = await Promise.all([
    import('@data/gnss/cwu.final_nam14.20231230.json'),
    import('@data/gnss/index.json'),
    import('@data/tectonics/pb2002-boundaries.json'),
    import('@data/tectonics/index.json'),
  ])
  const boundaries = pb.default.features as BoundaryFeature[]
  return {
    field: velocityFieldSchema.parse(field.default),
    gnss: gnssIndex.default['cwu.final_nam14.20231230'],
    boundaries,
    lines: boundaryLines(boundaries),
    pb2002: pbIndex.default['pb2002-boundaries'],
  }
}

export const GNSS_ATTRIBUTION = 'EarthScope Consortium, NSF NGF data archive (CC BY 4.0)'
export const PB2002_ATTRIBUTION = 'Bird (2003) PB2002 boundaries via tectonicplates (ODC-BY 1.0)'
