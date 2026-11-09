import { greatCircle, pole, project, type Line, type Plane } from '@/engine/structure'

const R = 150
const C = 160

/** An equal-angle lower-hemisphere stereonet with planes as great circles, their poles, and marked lines. */
export function Stereonet({ planes, lines = [], labels = true }: { planes: { plane: Plane; colour: string; label?: string }[]; lines?: { line: Line; colour: string; label?: string }[]; labels?: boolean }) {
  const pt = (l: Line) => {
    const [x, y] = project(l)
    return [C + x * R, C - y * R] as const
  }
  return (
    <svg viewBox={`0 0 ${2 * C} ${2 * C}`} role="img" aria-label="Stereonet, lower hemisphere, north at the top" className="w-full max-w-sm text-[10px]">
      <circle cx={C} cy={C} r={R} fill="none" stroke="currentColor" strokeWidth={1.5} />
      <line x1={C} x2={C} y1={C - 4} y2={C + 4} stroke="currentColor" />
      <line x1={C - 4} x2={C + 4} y1={C} y2={C} stroke="currentColor" />
      {[0, 90, 180, 270].map((a) => (
        <text key={a} x={C + (R + 7) * Math.sin((a * Math.PI) / 180)} y={C - (R + 7) * Math.cos((a * Math.PI) / 180) + 3} textAnchor="middle" fill="currentColor">
          {['N', 'E', 'S', 'W'][a / 90]}
        </text>
      ))}
      {planes.map(({ plane, colour, label }, i) => {
        const gc = greatCircle(plane, 72).map(pt)
        const p = pt(pole(plane))
        return (
          <g key={i}>
            <polyline fill="none" stroke={colour} strokeWidth={2} points={gc.map(([x, y]) => `${x},${y}`).join(' ')} />
            <circle cx={p[0]} cy={p[1]} r={3.5} fill={colour} />
            {labels && label && (
              <text x={p[0] + 5} y={p[1] - 5} fill={colour} fontWeight={600}>
                {label}
              </text>
            )}
          </g>
        )
      })}
      {lines.map(({ line, colour, label }, i) => {
        const p = pt(line)
        return (
          <g key={`l${i}`}>
            <rect x={p[0] - 4} y={p[1] - 4} width={8} height={8} fill={colour} transform={`rotate(45 ${p[0]} ${p[1]})`} />
            {labels && label && (
              <text x={p[0] + 6} y={p[1] + 10} fill={colour} fontWeight={600}>
                {label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
