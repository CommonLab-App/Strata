import { useEffect, useRef, type PointerEvent } from 'react'
import { contour, levels, type Grid, type Point } from '@/engine/topo'

const PX = 512

/**
 * A grid drawn as hillshade on a canvas with contours and any marks as SVG on top. Taps report grid coordinates.
 * Pure drawing: the contours come from the engine, the shade from a fixed north-west light.
 */
export function TopoView({ grid, interval, line, stations = [], onTap, title, floodLevel }: { grid: Grid; interval: number; line?: [Point, Point]; stations?: Point[]; onTap?: (p: Point) => void; title: string; floodLevel?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scale = PX / grid.size

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(grid.size, grid.size)
    const flat = grid.heights.flat()
    const lo = Math.min(...flat)
    const hi = Math.max(...flat)
    for (let r = 0; r < grid.size; r++)
      for (let c = 0; c < grid.size; c++) {
        const h = grid.heights[r]![c]!
        const e = grid.heights[r]![Math.min(c + 1, grid.size - 1)]!
        const s = grid.heights[Math.min(r + 1, grid.size - 1)]![c]!
        // Slope toward the light from the north-west brightens; a gentle tint by elevation underneath.
        const shade = Math.max(0, Math.min(1, 0.65 + ((h - e) / grid.dx + (h - s) / grid.dy) * 1.2))
        const t = (h - lo) / Math.max(1, hi - lo)
        const o = (r * grid.size + c) * 4
        if (floodLevel !== undefined && h <= floodLevel) {
          img.data[o] = 70
          img.data[o + 1] = 130
          img.data[o + 2] = 200
        } else {
          img.data[o] = Math.round(shade * (200 + 40 * t))
          img.data[o + 1] = Math.round(shade * (190 + 20 * t))
          img.data[o + 2] = Math.round(shade * (150 + 60 * (1 - t)))
        }
        img.data[o + 3] = 255
      }
    ctx.imageSmoothingEnabled = false
    ctx.putImageData(img, 0, 0)
  }, [grid, floodLevel])

  const tap = (e: PointerEvent<SVGSVGElement>) => {
    if (!onTap) return
    const rect = e.currentTarget.getBoundingClientRect()
    onTap([((e.clientX - rect.left) / rect.width) * grid.size, ((e.clientY - rect.top) / rect.height) * grid.size])
  }
  const lv = levels(grid, interval)
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
      <canvas ref={canvas} width={grid.size} height={grid.size} className="absolute inset-0 size-full" style={{ imageRendering: 'pixelated' }} aria-hidden />
      <svg viewBox={`0 0 ${PX} ${PX}`} role="img" aria-label={title} className={`absolute inset-0 size-full ${onTap ? 'cursor-crosshair' : ''}`} onPointerDown={tap}>
        {lv.map((level, i) =>
          contour(grid, level).map((poly, k) => (
            <polyline key={`${level}-${k}`} fill="none" stroke={i % 5 === 0 ? '#7c2d12' : '#9a3412'} strokeWidth={i % 5 === 0 ? 1.4 : 0.6} strokeOpacity={0.9} points={poly.map((p) => `${p[0] * scale},${p[1] * scale}`).join(' ')} />
          )),
        )}
        {line && <line x1={line[0][0] * scale} y1={line[0][1] * scale} x2={line[1][0] * scale} y2={line[1][1] * scale} stroke="#1d4ed8" strokeWidth={2.5} />}
        {line && ['A', 'B'].map((label, i) => (
          <text key={label} x={line[i]![0] * scale + 6} y={line[i]![1] * scale - 6} fill="#1d4ed8" fontWeight={700} fontSize={16} paintOrder="stroke" stroke="white" strokeWidth={3}>
            {label}
          </text>
        ))}
        {stations.map((s, i) => (
          <g key={i}>
            <circle cx={s[0] * scale} cy={s[1] * scale} r={4} fill="#1d4ed8" stroke="white" strokeWidth={1.5} />
            <text x={s[0] * scale + 6} y={s[1] * scale + 14} fill="#1d4ed8" fontSize={12} paintOrder="stroke" stroke="white" strokeWidth={3}>
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
