import { block, DEPTH, hatch, Label, MATERIAL, mix, OUTLINE, Patterns } from '@/app/models/draw'
import { ModelTab, type Variant } from '@/app/models/ModelTab'

/*
 * Streams as looping block diagrams (docs/specs/models.md). Zones: a staircase of three blocks descending left to
 * right with the water running the whole way, each step's right face showing the valley in cross-section. Patterns:
 * one deep block each with the channel network drawn on its top face in plan, every channel flowing to one outlet.
 * Water is a dashed stroke whose dashes travel from source to mouth (mdl-flow), so every channel path is drawn
 * from its head downstream.
 */

type Pt = [number, number] | [number, number, number]
/** A point on a block whose front face holds (x, y), moved d units back into the drawing. */
const at = (x: number, y: number, d: number, lift = 0): Pt => [x + DEPTH.dx * d, y + DEPTH.dy * d - lift]
const f = (n: number) => +n.toFixed(1)
const pts = (ps: Pt[]) => ps.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')
const poly = (ps: Pt[]) => ps.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('')

const FLOW = { animationName: 'mdl-flow', animationDuration: '3s' } as const

/** Flowing water: a dashed stroke whose dashes travel along the path. */
/** A channel: a faint solid line so the network reads as one, with the travelling dashes on top. */
const Water = ({ d, w = 2.4 }: { d: string; w?: number }) => (
  <g>
    <path d={d} fill="none" stroke={MATERIAL.water} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
    <path d={d} fill="none" stroke={MATERIAL.water} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" className="mdl mdl-flow" style={FLOW} />
  </g>
)

const Svg = ({ caption, children }: { caption: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 400 260" role="img" aria-label={caption}>
    <Patterns prefix="st" />
    {children}
  </svg>
)

/* ---------- Stream zones ---------- */

const G = 240
const ZD = 56
const B1 = { x: 6, w: 104, top: 90 }
const B2 = { x: 110, w: 96, top: 135 }
const B3 = { x: 206, w: 114, top: 172 }
const SEA = { x: 320, w: 32, top: 178 }
const CRUST = MATERIAL.crust
const TOPC = block(0, 0, 1, 1, 1).topFill(CRUST)
const SIDEC = block(0, 0, 1, 1, 1).sideFill(CRUST)

/** A meander bend from (xa, y0) to (xb, y0) bulging `a` units back (sign 1) or toward the viewer (sign -1). */
const bend = (xa: number, xb: number, y0: number, a: number, sign: 1 | -1) => {
  const ox = sign * DEPTH.dx * a * 1.33
  const oy = sign * DEPTH.dy * a * 1.33
  return `C${f(xa - 6 + ox)} ${f(y0 + oy)} ${f(xb + 6 + ox)} ${f(y0 + oy)} ${f(xb)} ${f(y0)}`
}

const ZonesScene = () => {
  // Block 1, the headwaters: a V notch at its right face, mid-depth, and the two facets of the valley on its top.
  const b1 = block(B1.x, B1.top, B1.w, G - B1.top, ZD)
  const r1 = B1.x + B1.w
  const src = at(B1.x + 20, B1.top, ZD / 2)
  const rimL = at(r1, B1.top, 16)
  const rimR = at(r1, B1.top, 40)
  const apex = at(r1, B1.top, ZD / 2, -16)
  const side1 = [[r1, B1.top] as Pt, rimL, apex, rimR, at(r1, B1.top, ZD), at(r1, B2.top, ZD), [r1, B2.top] as Pt]
  // Block 2, the transfer zone: a wider, flat-floored valley deepening toward its right face.
  const b2 = block(B2.x, B2.top, B2.w, G - B2.top, ZD)
  const r2 = B2.x + B2.w
  const DEEP = 11
  const nearRimL = at(B2.x, B2.top, 14)
  const nearRimR = at(r2, B2.top, 14)
  const nearFloorL = at(B2.x, B2.top, 22)
  const nearFloorR = at(r2, B2.top, 22, -DEEP)
  const farFloorL = at(B2.x, B2.top, 34)
  const farFloorR = at(r2, B2.top, 34, -DEEP)
  const farRimL = at(B2.x, B2.top, 42)
  const farRimR = at(r2, B2.top, 42)
  const side2 = [[r2, B2.top] as Pt, nearRimR, nearFloorR, farFloorR, farRimR, at(r2, B2.top, ZD), at(r2, B3.top, ZD), [r2, B3.top] as Pt]
  const fall1 = at(B1.x + B1.w, B2.top, ZD / 2)
  const floor2 = at(r2, B2.top, ZD / 2, -DEEP)
  const fall2 = at(r2, B3.top, ZD / 2)
  // Block 3, the floodplain, and the sea beyond it.
  const b3 = block(B3.x, B3.top, B3.w, G - B3.top, ZD)
  const sea = block(SEA.x, SEA.top, SEA.w, G - SEA.top, ZD)
  const y0 = fall2[1]
  const shore = at(SEA.x, B3.top, ZD / 2)
  const mouth = at(SEA.x, SEA.top, ZD / 2)
  const along = (p: Pt, k: number): Pt => [p[0] + 0.865 * k, p[1] - 0.502 * k]
  const fanA = along(mouth, -11)
  const fanB = along(mouth, 11)
  const upstream = `${poly([src])}Q${f(src[0] + 42)} ${f(src[1] + 4)} ${f(apex[0])} ${f(apex[1])}${poly([fall1, floor2, fall2]).replace(/^M/, 'L')}L${f(fall2[0] + 6)} ${y0}${bend(fall2[0] + 6, fall2[0] + 34, y0, 16, 1)}L${f(fall2[0] + 36)} ${y0}`
  const xa = fall2[0] + 36
  const xb = xa + 34
  const loop = `M${f(xa)} ${y0}${bend(xa, xb, y0, 18, -1)}`
  const downstream = `M${f(xb)} ${y0}L${f(xb + 2)} ${y0}${bend(xb + 2, xb + 30, y0, 13, 1)}L${f(shore[0])} ${f(shore[1])}L${f(mouth[0])} ${f(mouth[1])}`
  return (
    <Svg caption={zones.caption}>
      <g data-part="floodplain">
        <polygon points={b3.front} fill={CRUST} />
        <polygon points={b3.front} fill={hatch('st', 'sandstone')} />
        <polygon points={b3.top} fill={MATERIAL.vegetation} />
        <polygon points={b3.side} fill={SIDEC} />
        <polygon points={b3.front} {...OUTLINE} />
        <polygon points={b3.top} {...OUTLINE} />
        <polygon points={b3.side} {...OUTLINE} />
      </g>
      <g>
        <polygon points={sea.front} fill={MATERIAL.water} />
        <polygon points={sea.top} fill={sea.topFill(MATERIAL.water)} />
        <polygon points={sea.side} fill={sea.sideFill(MATERIAL.water)} />
        <polygon points={sea.front} {...OUTLINE} />
        <polygon points={sea.top} {...OUTLINE} />
        <polygon points={sea.side} {...OUTLINE} />
      </g>
      <g data-part="transfer">
        <polygon points={b2.front} fill={CRUST} />
        <polygon points={b2.front} fill={hatch('st', 'sandstone')} />
        <polygon points={b2.top} fill={TOPC} />
        <polygon points={pts([nearRimL, nearRimR, nearFloorR, nearFloorL])} fill={SIDEC} />
        <polygon points={pts([nearFloorL, nearFloorR, farFloorR, farFloorL])} fill={MATERIAL.vegetation} />
        <polygon points={pts([farFloorL, farFloorR, farRimR, farRimL])} fill={CRUST} />
        <polygon points={pts(side2)} fill={SIDEC} />
        <polygon points={b2.front} {...OUTLINE} />
        <polygon points={b2.top} {...OUTLINE} />
        <polygon points={pts(side2)} {...OUTLINE} />
        <polyline points={pts([nearRimL, nearRimR])} {...OUTLINE} strokeWidth={0.8} />
        <polyline points={pts([farRimL, farRimR])} {...OUTLINE} strokeWidth={0.8} />
      </g>
      <g data-part="headwaters">
        <polygon points={b1.front} fill={CRUST} />
        <polygon points={b1.front} fill={hatch('st', 'sandstone')} />
        <polygon points={b1.top} fill={TOPC} />
        <polygon points={pts([src, rimL, apex])} fill={SIDEC} />
        <polygon points={pts([src, apex, rimR])} fill={CRUST} />
        <polygon points={pts(side1)} fill={SIDEC} />
        <polygon points={b1.front} {...OUTLINE} />
        <polygon points={b1.top} {...OUTLINE} />
        <polygon points={pts(side1)} {...OUTLINE} />
        <polyline points={pts([src, rimL])} {...OUTLINE} strokeWidth={0.8} />
        <polyline points={pts([src, rimR])} {...OUTLINE} strokeWidth={0.8} />
      </g>
      <Water d={upstream} />
      <Water d={downstream} />
      <g data-part="meander" className="mdl mdl-grow-down" style={{ animationName: 'mdl-grow', animationDuration: '10s' }}>
        <path d={`${loop}Z`} fill={MATERIAL.debris} opacity="0.6" />
        <Water d={loop} />
      </g>
      <g data-part="delta">
        <path d={`M${f(fanA[0])} ${f(fanA[1])}C${f(fanA[0] + 22)} ${f(fanA[1] + 2)} ${f(fanB[0] + 22)} ${f(fanB[1] - 2)} ${f(fanB[0])} ${f(fanB[1])}Z`} fill={MATERIAL.debris} stroke={MATERIAL.basement} strokeWidth="0.8" opacity="0.9" />
        <Water d={`M${f(mouth[0])} ${f(mouth[1])}L${f(mouth[0] + 15)} ${f(mouth[1] + 3)}`} w={1.6} />
        <Water d={`M${f(mouth[0])} ${f(mouth[1])}L${f(mouth[0] + 17)} ${f(mouth[1] - 3)}`} w={1.6} />
      </g>
      <Label x={at(B1.x + 44, B1.top, 40)[0]} y={at(B1.x + 44, B1.top, 40)[1]} lx={58} ly={40} part="headwaters" anchor="middle">
        Headwaters
      </Label>
      <Label x={at(B2.x + 60, B2.top, 48)[0]} y={at(B2.x + 60, B2.top, 48)[1]} lx={205} ly={62} part="transfer" anchor="middle">
        Transfer zone
      </Label>
      <Label x={B3.x + 50} y={B3.top - 2} lx={398} ly={118} part="floodplain" anchor="end">
        Floodplain
      </Label>
      <Label x={mouth[0] + 18} y={mouth[1]} lx={398} ly={146} part="delta" anchor="end">
        Delta
      </Label>
      <Label x={(xa + xb) / 2 + 2} y={y0 + 9} lx={(xa + xb) / 2 + 2} ly={252} part="meander" anchor="middle">
        Meander bend
      </Label>
    </Svg>
  )
}

const zones: Variant = {
  id: 'zones',
  label: 'Stream zones',
  caption: 'A stream descends through three zones: steep headwaters that cut a narrow valley, a transfer zone that carries the sediment through a wider valley, and a low depositional zone where it meanders across a floodplain and drops its load in a delta at the sea. One bend swings outward as the current erodes its outer bank.',
  parts: [
    { id: 'headwaters', label: 'Headwaters', text: 'The steep upper zone, where the stream cuts down fastest and most of its sediment is produced. The valley is a narrow V in cross-section.' },
    { id: 'transfer', label: 'Transfer zone', text: 'The middle zone, where the stream carries the sediment through with little net gain or loss. The valley is wider and has a narrow flat floor.' },
    { id: 'floodplain', label: 'Floodplain', text: 'The low zone, where the gradient is gentle and the stream swings from side to side across a flat plain built from its own flood deposits.' },
    { id: 'delta', label: 'Delta', text: 'Where the stream meets still water it slows and drops its load, building a fan of sediment outward into the sea through channels that split and shift.' },
    { id: 'meander', label: 'Meander bend', text: 'A bend in the channel. Water moves fastest on the outside of the bend and erodes that bank, while sediment settles on the inside, so the bend grows outward over time.' },
  ],
  Scene: ZonesScene,
}

/* ---------- Drainage patterns: one deep block each, the network drawn in plan on its top face ---------- */

const PX = 20
const PY = 160
const PW = 270
const PH = 50
const PD = 150
/** A point on the pattern block's top face: u along the front edge (0..270), d back into the drawing (0..150). */
const top = (u: number, d: number, lift = 0): Pt => at(PX + u, PY, d, lift)
const topPath = (ps: Pt[]) => poly(ps.map(([u, d, lift]) => top(u, d, lift)))

/** The block under every pattern: front and side faces, then the top face as the tappable `pattern` region. */
const PatternBlock = ({ facesPart, children }: { facesPart?: string; children?: React.ReactNode }) => {
  const b = block(PX, PY, PW, PH, PD)
  return (
    <>
      <g data-part={facesPart}>
        <polygon points={b.front} fill={CRUST} />
        <polygon points={b.front} fill={hatch('st', 'sandstone')} />
        <polygon points={b.side} fill={SIDEC} />
        <polygon points={b.front} {...OUTLINE} />
        <polygon points={b.side} {...OUTLINE} />
      </g>
      <g data-part="pattern">
        <polygon points={b.top} fill={TOPC} />
        <polygon points={b.top} {...OUTLINE} />
      </g>
      {children}
    </>
  )
}

type Net = { pts: Pt[]; w?: number }
const Network = ({ net }: { net: Net[] }) => (
  <g data-part="channels">
    {net.map((c, i) => (
      <Water key={i} d={topPath(c.pts)} w={c.w ?? 2} />
    ))}
  </g>
)

/** Tree-like: every tributary enters the next stream at an acute angle pointing downstream; outlet at the front edge. */
const DENDRITIC: Net[] = [
  { w: 3.4, pts: [[172, 148], [160, 115], [145, 75], [130, 35], [120, 0]] },
  { w: 2.6, pts: [[28, 138], [60, 110], [100, 90], [145, 75]] },
  { pts: [[15, 100], [68, 106]] },
  { pts: [[55, 146], [85, 97]] },
  { w: 2.6, pts: [[255, 133], [215, 125], [190, 118], [160, 115]] },
  { pts: [[240, 100], [205, 122]] },
  { pts: [[262, 146], [228, 128]] },
  { w: 2.6, pts: [[250, 60], [210, 55], [175, 60], [137, 55]] },
  { pts: [[235, 20], [220, 56]] },
  { pts: [[190, 25], [177, 60]] },
  { w: 2.6, pts: [[20, 30], [60, 25], [95, 35], [126, 20]] },
  { pts: [[45, 60], [75, 29]] },
  { pts: [[10, 5], [50, 26]] },
  { pts: [[140, 150], [169, 140]] },
]

const dendritic: Variant = {
  id: 'dendritic',
  label: 'Dendritic',
  caption: 'On rock that erodes evenly in every direction, tributaries join at acute angles like the branches of a tree. Every channel flows toward the single outlet at the front of the block.',
  parts: [
    { id: 'channels', label: 'Channels', text: 'The stream channels, drawn from their heads to the outlet. Each tributary enters the next larger stream pointing downstream.' },
    { id: 'pattern', label: 'Dendritic pattern', text: 'The branching arrangement seen from above. It forms where nothing in the rock steers the water, so each channel takes the steepest way down.' },
    { id: 'bedrock', label: 'Bedrock', text: 'Uniform rock with no strong joints or layering. It wears away at the same rate in every direction, which is why the channels branch freely.' },
  ],
  Scene: () => (
    <Svg caption={dendritic.caption}>
      <PatternBlock facesPart="bedrock">
        <Network net={DENDRITIC} />
      </PatternBlock>
      <Label x={top(248, 100)[0]} y={top(248, 100)[1]} lx={398} ly={96} part="channels" anchor="end">
        Channels
      </Label>
      <Label x={top(40, 128)[0]} y={top(40, 128)[1]} lx={70} ly={46} part="pattern" anchor="middle">
        Dendritic pattern
      </Label>
      <Label x={150} y={PY + PH - 6} lx={150} ly={240} part="bedrock" anchor="middle">
        Bedrock
      </Label>
    </Svg>
  ),
}

/** Right-angle bends along two joint sets: lines along the front edge every 15 back, and into the block every 30 across. */
const RECTANGULAR: Net[] = [
  { w: 3.4, pts: [[250, 135], [250, 90], [190, 90], [190, 45], [100, 45], [100, 0]] },
  { w: 2.6, pts: [[40, 135], [40, 45], [100, 45]] },
  { w: 2.6, pts: [[130, 135], [130, 75], [190, 75]] },
  { w: 2.6, pts: [[250, 60], [190, 60]] },
  { w: 2.6, pts: [[40, 15], [100, 15]] },
  { w: 2.6, pts: [[160, 135], [160, 120], [250, 120]] },
  { pts: [[10, 75], [40, 75]] },
  { pts: [[100, 105], [130, 105]] },
  { pts: [[220, 140], [220, 120]] },
  { pts: [[70, 105], [40, 105]] },
  { pts: [[220, 30], [190, 30]] },
]

const JOINTS_U = [40, 70, 100, 130, 160, 190, 220, 250]
const JOINTS_D = [15, 30, 45, 60, 75, 90, 105, 120, 135]

const rectangular: Variant = {
  id: 'rectangular',
  label: 'Rectangular',
  caption: 'On rock broken by two sets of joints at right angles, streams follow the joints and turn sharp corners. Tributaries meet the main stream at right angles.',
  parts: [
    { id: 'channels', label: 'Channels', text: 'The channels, each following a joint and turning at a right angle where it crosses from one joint set to the other.' },
    { id: 'pattern', label: 'Rectangular pattern', text: 'The grid-like arrangement seen from above. Its corners record the two joint sets in the rock beneath.' },
    { id: 'joints', label: 'Joints', text: 'Joints are fractures along which the rock is weakest, so running water follows them. Two sets cross at right angles here.' },
  ],
  Scene: () => (
    <Svg caption={rectangular.caption}>
      <PatternBlock>
        <g data-part="joints">
          {JOINTS_U.map((u) => (
            <path key={`u${u}`} d={topPath([[u, 0], [u, PD]])} stroke={MATERIAL.basement} strokeWidth="0.7" opacity="0.22" />
          ))}
          {JOINTS_D.map((d) => (
            <path key={`d${d}`} d={topPath([[0, d], [PW, d]])} stroke={MATERIAL.basement} strokeWidth="0.7" opacity="0.22" />
          ))}
        </g>
        <Network net={RECTANGULAR} />
      </PatternBlock>
      <Label x={top(250, 135)[0]} y={top(250, 135)[1]} lx={398} ly={94} part="channels" anchor="end">
        Channels
      </Label>
      <Label x={top(220, 148)[0]} y={top(220, 148)[1]} lx={398} ly={66} part="joints" anchor="end">
        Joints
      </Label>
      <Label x={top(60, 125)[0]} y={top(60, 125)[1]} lx={80} ly={46} part="pattern" anchor="middle">
        Rectangular pattern
      </Label>
    </Svg>
  ),
}

/** Spokes from a low cone's summit: each stream runs straight down a flank and on across the plain. */
const CONE = { u: 135, d: 75, r: 52, h: 40, ext: 18 }
const coneBase = (deg: number): Pt => {
  const t = (deg * Math.PI) / 180
  return top(CONE.u + CONE.r * Math.cos(t), CONE.d + CONE.r * Math.sin(t))
}
const coneBeyond = (deg: number): Pt => {
  const t = (deg * Math.PI) / 180
  return top(CONE.u + (CONE.r + CONE.ext) * Math.cos(t), CONE.d + (CONE.r + CONE.ext) * Math.sin(t))
}
const APEX = top(CONE.u, CONE.d, CONE.h)
const FRONT_ARC: Pt[] = Array.from({ length: 13 }, (_, i) => coneBase(-i * 15))
const RADIAL_DEG = [20, 65, 115, 160, 200, 245, 290, 335]

const radial: Variant = {
  id: 'radial',
  label: 'Radial',
  caption: 'Streams run outward from the summit of a cone in every direction, like the spokes of a wheel. The pattern forms on volcanoes and on domes of uplifted rock.',
  parts: [
    { id: 'channels', label: 'Channels', text: 'The channels, each running straight down a flank from near the summit and continuing onto the plain beyond the base of the cone.' },
    { id: 'pattern', label: 'Radial pattern', text: 'The spoke-like arrangement seen from above. It forms wherever the land slopes away from a single high point.' },
    { id: 'cone', label: 'Cone', text: 'A low cone of ash and lava. Its summit is the highest point, so every slope on it leads away from the centre.' },
  ],
  Scene: () => (
    <Svg caption={radial.caption}>
      <PatternBlock>
        <g data-part="channels">
          {RADIAL_DEG.filter((deg) => Math.sin((deg * Math.PI) / 180) > 0).map((deg) => (
            <Water key={deg} d={poly([coneBase(deg), coneBeyond(deg)])} w={2.2} />
          ))}
        </g>
        <g data-part="cone">
          <polygon points={pts([APEX, ...FRONT_ARC])} fill={MATERIAL.ash} />
          <polygon points={pts([APEX, ...FRONT_ARC.slice(6)])} fill={mix(MATERIAL.ash, MATERIAL.basement, 0.18)} />
          <polygon points={pts([APEX, ...FRONT_ARC])} {...OUTLINE} strokeWidth={1.2} />
        </g>
        <g data-part="channels">
          {RADIAL_DEG.filter((deg) => Math.sin((deg * Math.PI) / 180) < 0).map((deg) => {
            const b = coneBase(deg)
            const start: Pt = [APEX[0] + (b[0] - APEX[0]) * 0.12, APEX[1] + (b[1] - APEX[1]) * 0.12]
            return <Water key={deg} d={poly([start, b, coneBeyond(deg)])} w={2.2} />
          })}
        </g>
      </PatternBlock>
      <Label x={coneBeyond(20)[0]} y={coneBeyond(20)[1]} lx={398} ly={94} part="channels" anchor="end">
        Channels
      </Label>
      <Label x={APEX[0]} y={APEX[1] - 2} lx={APEX[0] + 50} ly={58} part="cone">
        Cone
      </Label>
      <Label x={top(30, 130)[0]} y={top(30, 130)[1]} lx={64} ly={46} part="pattern" anchor="middle">
        Radial pattern
      </Label>
    </Svg>
  ),
}

/** A long low ridge along the front edge at depth d from u0 to u1, as its back and front flanks. */
const RIDGE = { half: 8, h: 8 }
const ridge = (d: number, u0: number, u1: number, taper = 20) => ({
  back: pts([top(u0, d), top(u0 + taper, d, RIDGE.h), top(u1 - taper, d, RIDGE.h), top(u1, d), top(u1 - taper, d + RIDGE.half), top(u0 + taper, d + RIDGE.half)]),
  front: pts([top(u0, d), top(u0 + taper, d - RIDGE.half), top(u1 - taper, d - RIDGE.half), top(u1, d), top(u1 - taper, d, RIDGE.h), top(u0 + taper, d, RIDGE.h)]),
})
const RIDGES = [ridge(134, 5, 265), ridge(80, 5, 112, 8), ridge(80, 128, 265, 8), ridge(26, 5, 265)]
const VALLEY_A = 112
const VALLEY_B = 58
const GAP = 120
/** Flank tributaries: from part-way up a ridge flank (lifted) straight to the valley stream. */
const flank = (us: number[], dFrom: number, dTo: number): Net[] => us.map((u) => ({ pts: [[u, dFrom, 6], [u, dTo]] }))
const TRELLIS: Net[] = [
  { w: 3.4, pts: [[258, VALLEY_A], [GAP, VALLEY_A], [GAP, VALLEY_B], [0, VALLEY_B]] },
  { w: 2.6, pts: [[10, VALLEY_A], [GAP, VALLEY_A]] },
  { w: 2.6, pts: [[258, VALLEY_B], [GAP, VALLEY_B]] },
  ...flank([40, 75, 150, 185, 220, 250], 132, VALLEY_A),
  ...flank([55, 92, 165, 205, 240], 82, VALLEY_A),
  ...flank([30, 60, 90, 150, 180, 210, 240], 78, VALLEY_B),
  ...flank([45, 75, 135, 165, 195, 225], 28, VALLEY_B),
]

const trellis: Variant = {
  id: 'trellis',
  label: 'Trellis',
  caption: 'On folded rock, long parallel ridges of resistant beds separate valleys of weaker rock. The main stream runs along a valley, cuts through a ridge at one gap, and short tributaries join it from the ridge flanks at right angles.',
  parts: [
    { id: 'channels', label: 'Channels', text: 'The main stream follows the valleys between the ridges and crosses one ridge through a gap; short tributaries run straight down the flanks into it.' },
    { id: 'pattern', label: 'Trellis pattern', text: 'The trellis-like arrangement seen from above: long parallel streams linked by short ones that meet them at right angles.' },
    { id: 'ridges', label: 'Ridges', text: 'Ridges of resistant rock left standing where tilted beds have been eroded. They confine the streams to the valleys between them.' },
  ],
  Scene: () => (
    <Svg caption={trellis.caption}>
      <PatternBlock>
        <g data-part="ridges">
          {RIDGES.map((r, i) => (
            <g key={i}>
              <polygon points={r.back} fill={block(0, 0, 1, 1, 1).topFill(MATERIAL.sandstone)} />
              <polygon points={r.front} fill={MATERIAL.sandstone} />
              <polygon points={r.back} {...OUTLINE} strokeWidth={0.9} />
              <polygon points={r.front} {...OUTLINE} strokeWidth={0.9} />
            </g>
          ))}
        </g>
        <Network net={TRELLIS} />
      </PatternBlock>
      <Label x={top(258, VALLEY_A)[0]} y={top(258, VALLEY_A)[1]} lx={398} ly={96} part="channels" anchor="end">
        Channels
      </Label>
      <Label x={top(240, 134, RIDGE.h)[0]} y={top(240, 134, RIDGE.h)[1]} lx={330} ly={62} part="ridges" anchor="middle">
        Ridges
      </Label>
      <Label x={top(20, 140)[0]} y={top(20, 140)[1]} lx={64} ly={46} part="pattern" anchor="middle">
        Trellis pattern
      </Label>
    </Svg>
  ),
}

export const VARIANTS: Variant[] = [zones, dendritic, rectangular, radial, trellis]

/** The stream models: the three zones of a stream, then one block per drainage pattern. */
export const Model = () => <ModelTab lead="The three zones of a stream and the four drainage patterns as looping block diagrams. The dashes travel with the current, from source to mouth. Tap a part of the drawing, or a chip, for what it is." variants={VARIANTS} />
