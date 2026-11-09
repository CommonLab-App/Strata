/** Hydrograph reading and the stream-table rule for week 13. Times are ISO strings; discharge in the record's unit. */
export type Series = [string, number][]

export interface HydrographStats {
  peak: { time: string; value: number }
  /** Last trough before the peak: where the rise began. */
  riseStart: { time: string; value: number }
  /** Hours from the start of the rise to the peak. */
  riseHours: number
  min: number
  mean: number
}

export function hydrograph(values: Series): HydrographStats | null {
  if (values.length < 3) return null
  let peakI = 0
  for (let i = 1; i < values.length; i++) if (values[i]![1] > values[peakI]![1]) peakI = i
  let troughI = peakI
  for (let i = peakI - 1; i >= 0; i--) {
    if (values[i]![1] < values[troughI]![1]) troughI = i
    else if (values[troughI]![1] < values[peakI]![1] * 0.5) break
  }
  const t = (i: number) => Date.parse(values[i]![0])
  const all = values.map((v) => v[1])
  return {
    peak: { time: values[peakI]![0], value: values[peakI]![1] },
    riseStart: { time: values[troughI]![0], value: values[troughI]![1] },
    riseHours: (t(peakI) - t(troughI)) / 3.6e6,
    min: Math.min(...all),
    mean: all.reduce((a, b) => a + b, 0) / all.length,
  }
}

/** Hourly means of a finer record, to keep a copy small. */
export function hourly(values: Series): Series {
  const buckets = new Map<string, number[]>()
  for (const [time, v] of values) {
    const key = time.slice(0, 13) + ':00:00.000Z'
    buckets.set(key, [...(buckets.get(key) ?? []), v])
  }
  return [...buckets.entries()].map(([time, vs]) => [time, Math.round((vs.reduce((a, b) => a + b, 0) / vs.length) * 100) / 100])
}

export const HYDRO_TOLERANCE = { peakRelative: 0.02, timeHours: 1, riseHours: 3 }

/**
 * Leopold and Wolman (1957): channels are braided above the line S = 0.06 Q^-0.44 (Q bankfull in cubic feet per
 * second) and meandering below it; very low slopes with little sediment stay straight. The straight threshold here
 * is the usual textbook sinuosity cut rendered as a slope, a teaching simplification the reviewers may change.
 */
export type Pattern = 'straight' | 'meandering' | 'braided'
export const braidedSlope = (q: number) => 0.06 * q ** -0.44
export function pattern(slope: number, q: number): Pattern {
  if (slope > braidedSlope(q)) return 'braided'
  return slope < braidedSlope(q) / 20 ? 'straight' : 'meandering'
}
