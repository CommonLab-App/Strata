import { z } from 'zod'
import type { LatLon } from '../geo'
import { boundaryAnswerOk, midpoint, type BoundaryLine } from './boundaries'
import { MOTION_TOLERANCE, relativeMotion, scoreMotion, type Velocity } from './motion'

/** The week-8 worksheet as the week stores it. Station codes refer to the bundled velocity field. */
export const relativeMotionWorksheetSchema = z.object({
  a: z.string(),
  b: z.string(),
  east: z.number().nullable(),
  north: z.number().nullable(),
  speed: z.number().nullable(),
  azimuth: z.number().nullable(),
  boundary: z.enum(['divergent', 'convergent', 'transform', 'none']).nullable(),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
export type RelativeMotionWorksheet = z.infer<typeof relativeMotionWorksheetSchema>

export const EMPTY_RELATIVE_MOTION: RelativeMotionWorksheet = { a: '', b: '', east: null, north: null, speed: null, azimuth: null, boundary: null, checked: false, score: null }

export const RELATIVE_MOTION_MARKS = 3

export interface RelativeMotionResult {
  speedOk: boolean
  azimuthOk: boolean
  boundaryOk: boolean
  score: number
  expected: ReturnType<typeof relativeMotion>
}

/**
 * Scores the worksheet from the same stations and boundary lines the learner saw: speed within 10 % or 1 mm/yr,
 * azimuth within 10°, boundary type against the nearest PB2002 segment within 200 km of the midpoint.
 */
export function scoreRelativeMotion(ws: RelativeMotionWorksheet, a: LatLon & Velocity, b: LatLon & Velocity, lines: readonly BoundaryLine[]): RelativeMotionResult {
  const expected = relativeMotion(a, b)
  const { speedOk, azimuthOk } = ws.speed !== null && ws.azimuth !== null ? scoreMotion(expected, ws.speed, ws.azimuth, MOTION_TOLERANCE) : { speedOk: false, azimuthOk: false }
  const boundaryOk = ws.boundary !== null && boundaryAnswerOk(midpoint(a, b), lines, ws.boundary)
  return { speedOk, azimuthOk, boundaryOk, score: Number(speedOk) + Number(azimuthOk) + Number(boundaryOk), expected }
}
