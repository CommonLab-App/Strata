import { COLUMNS, DIKE_COLOUR, LITHOLOGIES, type Section } from '@/engine/strata'

const CW = 10
const W = COLUMNS * CW
const H = 240

/** A section drawn as SVG: beds by lithology colour, dikes dark, faults as lines, erosion surfaces dashed, with labels. */
export function SectionView({ section, title }: { section: Section; title: string }) {
  const tops = section.columns.flatMap((c) => c.rock.map((s) => s.top))
  const bottoms = section.columns.flatMap((c) => c.rock.map((s) => s.bottom))
  const hi = Math.max(1, ...tops) + 0.5
  const lo = Math.min(0, ...bottoms) - 1
  const y = (v: number) => H - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * H
  const colour = (id: string) => LITHOLOGIES[Number(section.events.find((e) => e.id === id)?.label.split(', ')[1] && LITHOLOGIES.findIndex((l) => l.name === section.events.find((e) => e.id === id)?.label.split(', ')[1]))]?.colour ?? '#ccc'
  // One label per bed, at the right edge where the bed exists; dikes and faults labelled at their top.
  const labels: { x: number; y: number; text: string }[] = []
  for (const e of section.events) {
    if (e.kind === 'bed') {
      for (let i = COLUMNS - 1; i >= 0; i--) {
        const seg = section.columns[i]!.rock.find((s) => s.id === e.id)
        if (seg && seg.top - seg.bottom > 0.4) {
          labels.push({ x: i * CW + CW / 2 - 4, y: (y(seg.top) + y(seg.bottom)) / 2 + 3, text: e.label.split(',')[0]!.replace('Bed ', '') })
          break
        }
      }
    }
    if (e.kind === 'dike') {
      const i = section.columns.findIndex((c) => c.dikes.some((d) => d.id === e.id))
      const seg = section.columns[i]?.dikes.find((d) => d.id === e.id)
      if (seg) labels.push({ x: i * CW, y: y(seg.top) - 3, text: e.label.replace('Dike ', 'D') })
    }
  }
  for (const f of section.faults) labels.push({ x: f.x * CW + 2, y: y(f.top) - 3, text: section.events.find((e) => e.id === f.id)?.label.replace('Fault ', 'F') ?? 'F' })
  section.surfaces.forEach((u, k) => labels.push({ x: 2, y: y(u.heights[0]!) - 3, text: `U${k + 1}` }))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="w-full rounded-lg border bg-background text-[9px]">
      {section.columns.map((c, i) =>
        c.rock.map((s) => <rect key={`${i}-${s.id}`} x={i * CW} y={y(s.top)} width={CW + 0.5} height={Math.max(0, y(s.bottom) - y(s.top))} fill={colour(s.id)} />),
      )}
      {section.columns.map((c, i) => c.dikes.map((s) => <rect key={`${i}-${s.id}`} x={i * CW} y={y(s.top)} width={CW + 0.5} height={Math.max(0, y(s.bottom) - y(s.top))} fill={DIKE_COLOUR} />))}
      {section.surfaces.map((u) => (
        <polyline key={u.id} fill="none" stroke="#111" strokeWidth={1.5} strokeDasharray="4 3" points={u.heights.map((h, i) => `${i * CW},${y(h)} ${(i + 1) * CW},${y(h)}`).join(' ')} />
      ))}
      {section.faults.map((f) => (
        <line key={f.id} x1={f.x * CW} x2={f.x * CW} y1={y(f.bottom)} y2={y(f.top)} stroke="#b91c1c" strokeWidth={2} />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} fill="#111" fontWeight={600} paintOrder="stroke" stroke="white" strokeWidth={2}>
          {l.text}
        </text>
      ))}
    </svg>
  )
}
