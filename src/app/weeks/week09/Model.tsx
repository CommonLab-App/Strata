import type { ReactNode } from 'react'
import { arrow, block, hatch, Label, MATERIAL, mix, OUTLINE, Patterns, type Bed } from '@/app/models/draw'
import { ModelTab, type Variant } from '@/app/models/ModelTab'

/*
 * Faults as looping block diagrams (docs/specs/models.md). One slab of five beds, 100 high and 50 deep in cabinet
 * projection, cut by a fault plane. For the dipping faults the hanging wall slides along the plane as a
 * before-to-after loop (normal: down, reverse: up); the strike-slip blocks slide past each other along strike as
 * a steady loop. The beds follow the brand hero block, top down: sandstone, shale, limestone, mudstone, greensand.
 */

const TOP = 108
const H = 100
const BED = 20
const LEFT = 10
const RIGHT = 280
const D = 50
const OX = D * 0.62
const OY = D * -0.36
const DUR = '8s'
/** How far the hanging wall moves, in viewBox units: mdl-rise and mdl-sink translate by 10. */
const THROW = 10

const BEDS: { fill: string; bed?: Bed }[] = [
  { fill: MATERIAL.sandstone, bed: 'sandstone' },
  { fill: MATERIAL.shale, bed: 'shale' },
  { fill: MATERIAL.limestone, bed: 'limestone' },
  { fill: MATERIAL.mudstone },
  { fill: MATERIAL.greensand, bed: 'greensand' },
]
/** The marker bed is the shale, second from the top. */
const MARKER = 1
/** The bare fault plane where it is exposed: pale, with slickenlines in Shale-deep, as the brand hero block. */
const FAULT_FACE = mix(MATERIAL.shale, MATERIAL.chalk, 0.42)

type Edge = (y: number) => number
const pts = (p: [number, number][]) => p.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(' ')

/**
 * A block of the five beds whose front face runs between the edges l(y) and r(y), with its top face and, if `side`,
 * its right side face. The marker bed is its own part so it can be picked out; the outlines go on last.
 * `extra` lengthens the bottom bed (the reverse hanging wall starts below the base and rises to it).
 */
const Block = ({ part, top = TOP, l, r, side = true, extra = 0 }: { part: string; top?: number; l: Edge; r: Edge; side?: boolean; extra?: number }) => {
  const bottom = top + H + extra
  const b = block(l(top), top, r(top) - l(top), H + extra, D)
  const bands = BEDS.map((bed, i) => {
    const y0 = top + BED * i
    const y1 = i === BEDS.length - 1 ? bottom : y0 + BED
    return { ...bed, front: pts([[l(y0), y0], [r(y0), y0], [r(y1), y1], [l(y1), y1]]), side: block(r(y0) - 1, y0, 1, y1 - y0, D).side }
  })
  const face = ({ fill, bed, front, side: s }: (typeof bands)[number], key: number) => (
    <g key={key}>
      <polygon points={front} fill={fill} />
      {bed && <polygon points={front} fill={hatch('fl', bed)} />}
      {side && <polygon points={s} fill={b.sideFill(fill)} />}
    </g>
  )
  const front = pts([[l(top), top], [r(top), top], [r(bottom), bottom], [l(bottom), bottom]])
  return (
    <>
      <g data-part={part}>
        {bands.map((band, i) => i !== MARKER && face(band, i))}
        <polygon points={b.top} fill={b.topFill(MATERIAL.sandstone)} />
      </g>
      <g data-part="marker">{face(bands[MARKER]!, MARKER)}</g>
      <g data-part={part}>
        <polygon points={front} {...OUTLINE} />
        <polygon points={b.top} {...OUTLINE} />
        {side && <polygon points={b.side} {...OUTLINE} />}
      </g>
    </>
  )
}

/** The fault plane on the front face and its trace across the top, from (xTop, TOP) to (xBot, TOP + H). */
const Fault = ({ xTop, xBot }: { xTop: number; xBot: number }) => (
  <g data-part="fault">
    <line x1={xTop} y1={TOP} x2={xBot} y2={TOP + H} stroke={MATERIAL.basement} strokeWidth="2.6" />
    <line x1={xTop} y1={TOP} x2={xTop + OX} y2={TOP + OY} stroke={MATERIAL.basement} strokeWidth="2.6" />
  </g>
)

/** Half-arrows either side of a dipping fault: the hanging wall's (right of the plane) and the footwall's, opposed. */
const Slip = ({ xTop, xBot, hangingDown }: { xTop: number; xBot: number; hangingDown: boolean }) => {
  const len = Math.hypot(xBot - xTop, H)
  const d = [(xBot - xTop) / len, H / len] as const // down the dip
  const n = [d[1], -d[0]] as const // across the plane, toward the hanging wall
  const m = [(xTop + xBot) / 2, TOP + H / 2] as const
  const s = hangingDown ? 1 : -1
  const one = (cx: number, cy: number, sign: number) => arrow(cx - 11 * sign * d[0], cy - 11 * sign * d[1], cx + 11 * sign * d[0], cy + 11 * sign * d[1])
  return (
    <g data-part="slip" fill={MATERIAL.basement} stroke={MATERIAL.basement} strokeWidth="2.4" strokeLinecap="round">
      <path d={one(m[0] + 9 * n[0] + 8 * d[0], m[1] + 9 * n[1] + 8 * d[1], s)} />
      <path d={one(m[0] - 9 * n[0] - 8 * d[0], m[1] - 9 * n[1] - 8 * d[1], -s)} />
    </g>
  )
}

/**
 * The hanging wall's moving frame. The keyframes translate straight up or down; wrapping them in a skew and its
 * inverse turns that into a slide along the dip, so the block keeps touching the plane and the fault line stays put.
 * The ground clip hides the part of the block that goes below the base.
 */
const Hanging = ({ dipRun, anim, clip, children }: { dipRun: number; anim: 'mdl-rise' | 'mdl-sink'; clip: string; children: ReactNode }) => {
  const skew = (Math.atan(dipRun / H) * 180) / Math.PI
  return (
    <g clipPath={`url(#${clip})`}>
      <g transform={`skewX(${+skew.toFixed(3)})`}>
        <g className="mdl" style={{ animationName: anim, animationDuration: DUR }}>
          <g transform={`skewX(${+(-skew).toFixed(3)})`}>{children}</g>
        </g>
      </g>
    </g>
  )
}

/** Everything below the base of the slab is cut away: the front base line, then the side face's base going back. */
const Ground = ({ id }: { id: string }) => (
  <defs>
    <clipPath id={id}>
      <polygon points={pts([[0, 0], [400, 0], [400, TOP + H + ((400 - RIGHT) * OY) / OX], [RIGHT, TOP + H], [0, TOP + H]])} />
    </clipPath>
  </defs>
)

const Svg = ({ caption, children }: { caption: string; children: ReactNode }) => (
  <svg viewBox="0 0 400 260" role="img" aria-label={caption}>
    <Patterns prefix="fl" />
    {children}
  </svg>
)

const edge = (xTop: number, xBot: number): Edge => (y) => xTop + ((y - TOP) * (xBot - xTop)) / H

// Normal: the plane dips about 60 degrees to the left; the hanging wall is the block on the right.
const N_TOP = 170
const N_BOT = N_TOP - H / Math.tan((60 * Math.PI) / 180)
const normalEdge = edge(N_TOP, N_BOT)

const normal: Variant = {
  id: 'normal',
  label: 'Normal',
  caption: 'The crust is being stretched. The fault dips steeply, and the block above it, the hanging wall, slides down the plane, so the marker bed ends up lower on that side and a scarp is left where the footwall stands bare.',
  parts: [
    { id: 'hanging-wall', label: 'Hanging wall', text: 'The block that lies above the fault plane. In a normal fault it drops down the plane as the crust stretches.' },
    { id: 'footwall', label: 'Footwall', text: 'The block that lies beneath the fault plane. It stays put, and the upper part of the plane is bared as the hanging wall drops away from it.' },
    { id: 'fault', label: 'Fault plane', text: 'The surface along which the blocks slip. Here it dips at about sixty degrees, the usual steep angle of a normal fault.' },
    { id: 'marker', label: 'Marker bed', text: 'A bed that was continuous before the slip. The mismatch of its two halves across the fault measures the throw.' },
    { id: 'slip', label: 'Slip direction', text: 'The half-arrows give the movement of each block relative to the other: hanging wall down, footwall up.' },
  ],
  Scene: () => {
    const dx = ((N_BOT - N_TOP) * THROW) / H
    const scarp = pts([[N_TOP, TOP], [N_TOP + dx, TOP + THROW], [N_TOP + dx + OX, TOP + THROW + OY], [N_TOP + OX, TOP + OY]])
    return (
      <Svg caption={normal.caption}>
        <Ground id="fl-n-ground" />
        <Block part="footwall" l={() => LEFT} r={normalEdge} side={false} />
        <g data-part="footwall" className="mdl" style={{ animationName: 'mdl-fade-in', animationDuration: DUR }}>
          <polygon points={scarp} fill={FAULT_FACE} />
          {[0.2, 0.4, 0.6, 0.8].map((k) => (
            <line key={k} x1={N_TOP + OX * k} y1={TOP + OY * k} x2={N_TOP + dx + OX * k} y2={TOP + THROW + OY * k} stroke={MATERIAL.shaleDeep} strokeWidth="1.1" opacity="0.75" />
          ))}
          <polygon points={scarp} fill="none" stroke={MATERIAL.basement} strokeWidth="1" opacity="0.6" />
        </g>
        <Hanging dipRun={N_BOT - N_TOP} anim="mdl-sink" clip="fl-n-ground">
          <Block part="hanging-wall" l={normalEdge} r={() => RIGHT} />
        </Hanging>
        <Fault xTop={N_TOP} xBot={N_BOT} />
        <Slip xTop={N_TOP} xBot={N_BOT} hangingDown />
        <Label x={80} y={99} lx={80} ly={56} part="footwall" anchor="middle">
          Footwall
        </Label>
        <Label x={N_TOP + OX / 2} y={TOP + OY / 2} lx={N_TOP + OX / 2} ly={56} part="fault" anchor="middle">
          Fault plane
        </Label>
        <Label x={245} y={99} lx={398} ly={56} part="hanging-wall" anchor="end">
          Hanging wall
        </Label>
        <Label x={296} y={130} lx={398} ly={150} part="marker" anchor="end">
          Marker bed
        </Label>
      </Svg>
    )
  },
}

// Reverse: the plane dips about 30 degrees to the left; the hanging wall on the right rides up it.
const R_TOP = 195
const R_BOT = R_TOP - H / Math.tan((32 * Math.PI) / 180)
const reverseEdge = edge(R_TOP, R_BOT)

const reverse: Variant = {
  id: 'reverse',
  label: 'Reverse (thrust)',
  caption: 'The crust is being squeezed. The fault dips gently, and the hanging wall rides up and over the footwall, so the marker bed ends up higher on that side and the beds take up less width than before.',
  parts: [
    { id: 'hanging-wall', label: 'Hanging wall', text: 'The block that lies above the fault plane. In a reverse fault it is pushed up the plane, over the footwall, as the crust shortens.' },
    { id: 'footwall', label: 'Footwall', text: 'The block beneath the fault plane. The hanging wall slides up over it, so older beds come to rest on younger ones.' },
    { id: 'fault', label: 'Fault plane', text: 'The surface along which the blocks slip. A reverse fault this gentle, dipping at about thirty degrees, is called a thrust.' },
    { id: 'marker', label: 'Marker bed', text: 'A bed that was continuous before the slip. Its two halves no longer line up, and the mismatch measures the throw.' },
    { id: 'slip', label: 'Slip direction', text: 'The half-arrows give the movement of each block relative to the other: hanging wall up, footwall down.' },
  ],
  Scene: () => (
    <Svg caption={reverse.caption}>
      <Ground id="fl-r-ground" />
      <Block part="footwall" l={() => LEFT} r={reverseEdge} side={false} />
      <Hanging dipRun={R_BOT - R_TOP} anim="mdl-rise" clip="fl-r-ground">
        <Block part="hanging-wall" l={reverseEdge} r={() => RIGHT} extra={THROW} />
      </Hanging>
      <Fault xTop={R_TOP} xBot={R_BOT} />
      <Slip xTop={R_TOP} xBot={R_BOT} hangingDown={false} />
      <Label x={80} y={99} lx={80} ly={56} part="footwall" anchor="middle">
        Footwall
      </Label>
      <Label x={R_TOP + OX / 2} y={TOP + OY / 2} lx={R_TOP + OX / 2} ly={56} part="fault" anchor="middle">
        Fault plane
      </Label>
      <Label x={250} y={99} lx={398} ly={56} part="hanging-wall" anchor="end">
        Hanging wall
      </Label>
      <Label x={296} y={130} lx={398} ly={150} part="marker" anchor="end">
        Marker bed
      </Label>
    </Svg>
  ),
}

// Strike-slip: a vertical plane striking into the block at x = F. The far block starts one slip back along strike,
// so the stream on top is already offset; the loop slides the blocks a little further past and back.
const F = 150
const SHIFT = 12
const SX = SHIFT * 0.62
const SY = SHIFT * -0.36
/** A point on a top face: x along the front, t back along the depth, offset by the block's own start depth. */
const top = (x: number, t: number, back = 0): [number, number] => [x + (t + back) * 0.62, TOP - (t + back) * 0.36]
/** The strip of fault plane between the two front faces, long enough for the loop's widest gap. */
const STRIP = 27
const strip = pts([[F, TOP], top(F, STRIP), [top(F, STRIP)[0], top(F, STRIP)[1] + H], [F, TOP + H]])
const along = (cx: number, cy: number, fore: boolean) => {
  const [ux, uy] = fore ? [-0.865, 0.502] : [0.865, -0.502]
  return arrow(cx - 11 * ux, cy - 11 * uy, cx + 11 * ux, cy + 11 * uy)
}

const strikeSlip: Variant = {
  id: 'strike-slip',
  label: 'Strike-slip',
  caption: 'The fault is vertical and the blocks slide past each other sideways, with no up or down movement. The beds still match across the fault on the front face, but a stream crossing it on top is offset a little more with every slip.',
  parts: [
    { id: 'block-near', label: 'Near block', text: 'The block in front of the fault plane. It slides toward the viewer, along the strike of the plane.' },
    { id: 'block-far', label: 'Far block', text: 'The block behind the fault plane. It slides away from the viewer, the opposite way to its neighbour.' },
    { id: 'fault', label: 'Fault plane', text: 'A vertical surface. The blocks move along its strike rather than up or down its dip, so the beds are not thrown.' },
    { id: 'marker', label: 'Offset stream', text: 'A stream that once ran straight across the fault. Its two halves are now out of line by the amount of slip.' },
    { id: 'slip', label: 'Slip direction', text: 'The half-arrows show horizontal movement in opposite directions on the two sides of the fault.' },
  ],
  Scene: () => (
    <Svg caption={strikeSlip.caption}>
      <g className="mdl" style={{ animationName: 'mdl-slide-fore', animationDuration: DUR }}>
        <Block part="block-near" l={() => LEFT} r={() => F} side={false} />
        <g data-part="fault">
          <polygon points={strip} fill={FAULT_FACE} />
          {[25, 50, 75].map((y) => (
            <line key={y} x1={F} y1={TOP + y} x2={top(F, STRIP)[0]} y2={top(F, STRIP)[1] + y} stroke={MATERIAL.shaleDeep} strokeWidth="1.1" opacity="0.75" />
          ))}
          <polygon points={strip} fill="none" stroke={MATERIAL.basement} strokeWidth="1" opacity="0.6" />
          <line x1={F} y1={TOP} x2={F + OX} y2={TOP + OY} stroke={MATERIAL.basement} strokeWidth="2.6" />
        </g>
        <path d={`M${top(LEFT, 30).join(' ')} Q${top(100, 40).join(' ')} ${top(F, 45).join(' ')}`} fill="none" stroke={MATERIAL.water} strokeWidth="3" strokeLinecap="round" data-part="marker" />
        <path d={along(...top(120, 16), true)} fill={MATERIAL.basement} stroke={MATERIAL.basement} strokeWidth="2.4" strokeLinecap="round" data-part="slip" />
      </g>
      <g className="mdl" style={{ animationName: 'mdl-slide-back', animationDuration: DUR }}>
        <Block part="block-far" top={TOP + SY} l={() => F + SX} r={() => RIGHT + SX} />
        <g data-part="fault">
          <line x1={F + SX} y1={TOP + SY} x2={F + SX + OX} y2={TOP + SY + OY} stroke={MATERIAL.basement} strokeWidth="2.6" />
        </g>
        <path d={`M${top(F, 45, SHIFT).join(' ')} Q${top(220, 40, SHIFT).join(' ')} ${top(RIGHT, 48, SHIFT).join(' ')}`} fill="none" stroke={MATERIAL.water} strokeWidth="3" strokeLinecap="round" data-part="marker" />
        <path d={along(...top(185, 16, SHIFT), false)} fill={MATERIAL.basement} stroke={MATERIAL.basement} strokeWidth="2.4" strokeLinecap="round" data-part="slip" />
      </g>
      <Label x={70} y={TOP + H + 2} lx={70} ly={238} part="block-near" anchor="middle">
        Near block
      </Label>
      <Label x={F + 5} y={TOP + H - 8} lx={F + 5} ly={238} part="fault" anchor="middle">
        Fault plane
      </Label>
      <Label x={250} y={95} lx={398} ly={56} part="block-far" anchor="end">
        Far block
      </Label>
      <Label x={top(70, 36)[0]} y={top(70, 36)[1]} lx={60} ly={56} part="marker" anchor="middle">
        Offset stream
      </Label>
    </Svg>
  ),
}

export const VARIANTS: Variant[] = [normal, reverse, strikeSlip]

/** The fault models: a looping block diagram per fault type. */
export const Model = () => <ModelTab lead="Each fault type as a looping block diagram. The beds are offset across the fault plane, and the half-arrows give the sense of slip. Tap a part of the drawing, or a chip, for what it is." variants={VARIANTS} />
