import eras from '@data/timescale/eras.json'
import periods from '@data/timescale/periods.json'

const W = 640
const OLDEST = 4031

/**
 * The international time scale as two bars, eras over periods, linear in time, with markers for given ages. Linear
 * so that the Phanerozoic's narrowness against the Precambrian is felt; the period labels only fit from the
 * Cambrian on, so they are listed below the bar.
 */
export function TimeScale({ markers = [] }: { markers?: { ma: number; label: string }[] }) {
  const x = (ma: number) => W - (ma / OLDEST) * W
  return (
    <figure className="m-0 grid gap-1">
      <svg viewBox={`0 0 ${W} 70`} role="img" aria-label="Geologic time scale, oldest on the left, today on the right" className="w-full text-[9px]">
        {eras.map((e) => (
          <rect key={e.name} x={x(e.startMa)} y={0} width={x(e.endMa) - x(e.startMa)} height={22} fill={e.colour} stroke="white" strokeWidth={0.5}>
            <title>
              {e.name}, {e.startMa} to {e.endMa} Ma
            </title>
          </rect>
        ))}
        {periods.map((p) => (
          <rect key={p.name} x={x(p.startMa)} y={24} width={x(p.endMa) - x(p.startMa)} height={22} fill={p.colour} stroke="white" strokeWidth={0.5}>
            <title>
              {p.name}, {p.startMa} to {p.endMa} Ma
            </title>
          </rect>
        ))}
        {markers.map((m) => (
          <g key={m.label}>
            <line x1={x(m.ma)} x2={x(m.ma)} y1={0} y2={52} stroke="#111" strokeWidth={1.5} />
            <text x={Math.min(x(m.ma) + 2, W - 40)} y={62} fill="currentColor">
              {m.label}
            </text>
          </g>
        ))}
        <text x={0} y={68} fill="currentColor">
          {OLDEST} Ma
        </text>
        <text x={W} y={68} textAnchor="end" fill="currentColor">
          today
        </text>
      </svg>
      <figcaption className="text-xs text-muted-foreground">
        Eras above, periods below, from the international scale (Macrostrat, CC BY 4.0). Periods from the Cambrian on, youngest first:{' '}
        {periods
          .filter((p) => p.startMa <= 540)
          .map((p) => `${p.name} ${p.endMa}–${p.startMa}`)
          .join('; ')}{' '}
        Ma.
      </figcaption>
    </figure>
  )
}
