import { headContours } from '@/engine/groundwater'
import type { Grid } from '@/engine/topo'
import type { Well } from '@/engine/groundwater'

const PX = 480

/** Well heads as labelled dots, head contours from the interpolated table, and a marked point, in map metres. */
export function WaterTableView({ grid, extent, wells, interval, point, flowAzimuth }: { grid: Grid; extent: number; wells: readonly Well[]; interval: number; point?: { x: number; y: number }; flowAzimuth?: number }) {
  const sx = (x: number) => (x / extent) * PX
  const sy = (y: number) => PX - (y / extent) * PX
  const contours = headContours(grid, interval)
  return (
    <svg viewBox={`0 0 ${PX} ${PX}`} role="img" aria-label="Map of wells with water-table contours" className="w-full rounded-lg border bg-background text-[10px]">
      {contours.map(({ level, lines }) =>
        lines.map((poly, k) => (
          <g key={`${level}-${k}`}>
            <polyline fill="none" stroke="#1d4ed8" strokeWidth={1} points={poly.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')} />
            {poly[0] && (
              <text x={sx(poly[0][0]) + 2} y={sy(poly[0][1]) - 2} fill="#1d4ed8" paintOrder="stroke" stroke="white" strokeWidth={2}>
                {level}
              </text>
            )}
          </g>
        )),
      )}
      {wells.map((w, i) => (
        <g key={i}>
          <circle cx={sx(w.x)} cy={sy(w.y)} r={4} fill="#111" />
          <text x={sx(w.x) + 6} y={sy(w.y) + 4} fill="#111" paintOrder="stroke" stroke="white" strokeWidth={2}>
            {w.head.toFixed(1)} m
          </text>
        </g>
      ))}
      {point && (
        <g>
          <circle cx={sx(point.x)} cy={sy(point.y)} r={6} fill="none" stroke="#dc2626" strokeWidth={2} />
          <text x={sx(point.x) + 8} y={sy(point.y) - 6} fill="#dc2626" fontWeight={700} paintOrder="stroke" stroke="white" strokeWidth={2}>
            P
          </text>
          {flowAzimuth !== undefined && <line x1={sx(point.x)} y1={sy(point.y)} x2={sx(point.x) + 30 * Math.sin((flowAzimuth * Math.PI) / 180)} y2={sy(point.y) - 30 * Math.cos((flowAzimuth * Math.PI) / 180)} stroke="#dc2626" strokeWidth={2} markerEnd="url(#arrow)" />}
        </g>
      )}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
        </marker>
      </defs>
      <text x={4} y={PX - 4} fill="currentColor">
        {extent} m across; north up
      </text>
    </svg>
  )
}
