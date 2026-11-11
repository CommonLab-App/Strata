/**
 * Profile curves for the four volcano shapes the Model tab draws and turns (docs/specs/models.md). Pure: radius
 * against height, in units of the base half-width, from the flank slopes a textbook gives. The SVG cross-section
 * and the Three.js lathe both read `profile` and `height`, so the two always agree.
 */
export type VolcanoType = 'shield' | 'strato' | 'cinder' | 'caldera'

/** The flank slope each profile is built from: shields 2 to 10°, stratovolcanoes about 30° near the top, cinder cones at the angle of repose. */
export const SLOPE_DEG: Record<VolcanoType, number> = { shield: 6, strato: 30, cinder: 33, caldera: 30 }

const tan = (deg: number) => Math.tan((deg * Math.PI) / 180)

/** Summit radius as a fraction of the base half-width: a shield is a broad dome, a cone ends in a small crater. */
const SUMMIT = { shield: 0.35, strato: 0.08, cinder: 0.12 } as const
/** The stratovolcano flank is concave: radius falls as height^Q, so the flank steepens toward the summit. */
const STRATO_Q = 0.75
/** A caldera is a stratovolcano cut off at this fraction of its height; the rim sits at RIM of the caldera's own height, with the equal-radius wall above it. */
const CALDERA_CUT = 0.57
const CALDERA_RIM = 0.75

const STRATO_HEIGHT = STRATO_Q * (1 - SUMMIT.strato) * tan(SLOPE_DEG.strato)

/** Height of the edifice as a fraction of its base half-width. */
export const height = (type: VolcanoType): number => {
  switch (type) {
    case 'shield':
      return (1 - SUMMIT.shield) * tan(SLOPE_DEG.shield)
    case 'strato':
      return STRATO_HEIGHT
    case 'cinder':
      return (1 - SUMMIT.cinder) * tan(SLOPE_DEG.cinder)
    case 'caldera':
      return (CALDERA_CUT * STRATO_HEIGHT) / CALDERA_RIM
  }
}

/** Radius of the stratovolcano at a fraction t of its height. */
const strato = (t: number) => 1 - (1 - SUMMIT.strato) * Math.pow(t, STRATO_Q)

/**
 * Radius (0..1 of the base half-width) at n evenly spaced heights from the base (index 0, radius 1) to the summit
 * (index n - 1); monotone non-increasing. Shield: a convex dome that keeps a broad summit. Stratovolcano: a concave
 * flank, 30° at the summit. Cinder cone: a straight flank at the angle of repose ending at a small crater. Caldera:
 * the stratovolcano with its top gone, the last quarter of the heights at the rim's radius.
 */
export const profile = (type: VolcanoType, n = 24): number[] =>
  Array.from({ length: n }, (_, i) => {
    const t = n > 1 ? i / (n - 1) : 1
    switch (type) {
      case 'shield':
        return 1 - (1 - SUMMIT.shield) * (2 * t - t * t)
      case 'strato':
        return strato(t)
      case 'cinder':
        return 1 - (1 - SUMMIT.cinder) * t
      case 'caldera':
        return strato((Math.min(t, CALDERA_RIM) * height('caldera')) / STRATO_HEIGHT)
    }
  })
