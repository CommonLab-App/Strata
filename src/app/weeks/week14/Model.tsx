import { arrow, block, hatch, Label, MATERIAL, mix, OUTLINE, Patterns } from '@/app/models/draw'
import { ModelTab, type Variant } from '@/app/models/ModelTab'

/*
 * Groundwater as looping block diagrams (docs/specs/models.md): an artesian cross-section with three wells, the
 * zones below the surface, and a karst block. Water is MATERIAL.water; moving water is a dashed stroke whose
 * dashes travel (`mdl-flow`); the water-table rise is a before-to-after loop.
 */

const P = (p: [number, number][]) => p.map(([x, y]) => `${+x.toFixed(1)},${+y.toFixed(1)}`).join(' ')

/** A dashed water stroke whose dashes travel along the path: flow. */
const Flow = ({ d, width = 2.4, seconds = 3, opacity = 1 }: { d: string; width?: number; seconds?: number; opacity?: number }) => (
  <path d={d} fill="none" stroke={MATERIAL.water} strokeWidth={width} strokeDasharray="6 6" strokeLinecap="round" opacity={opacity} className="mdl" style={{ animationName: 'mdl-flow', animationDuration: `${seconds}s` }} />
)

const Head = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => <path d={arrow(x1, y1, x2, y2)} fill={MATERIAL.water} stroke={MATERIAL.water} strokeWidth="2" strokeLinejoin="round" />

const Svg = ({ caption, children }: { caption: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 400 260" role="img" aria-label={caption}>
    <Patterns prefix="gw" />
    {children}
  </svg>
)

/* ---------- Artesian cross-section ---------- */

// Depth 34 in cabinet projection; the front face is bounded above by the ground profile: a hill on the left, a
// low shoulder, a gentle plain and a lake dish on the right.
const AD = 34
const AOX = AD * 0.62
const AOY = AD * -0.36
const AX1 = 258
const ABOT = 236
const GROUND: [number, number][] = [[10, 60], [100, 92], [108, 84], [120, 79], [150, 79], [170, 86], [195, 108], [207, 112], [217, 124], [237, 124], [247, 112], [AX1, 110]]
const FACE = `${P(GROUND)} ${AX1},${ABOT} 10,${ABOT}`
const TOPFACE = `${P(GROUND)} ${P([...GROUND].reverse().map(([x, y]) => [x + AOX, y + AOY]))}`
const SIDE = P([[AX1, 110], [AX1 + AOX, 110 + AOY], [AX1 + AOX, ABOT + AOY], [AX1, ABOT]])

// Bed boundaries: one curve, steep under the hill and flattening under the plain, shifted by y. Each drops 140
// across the width, so at the right edge a boundary sits at y + 140. The confined aquifer reaches the surface on the
// hill (x 10 to 55); the unconfined aquifer begins where the upper confining layer dips below the shoulder (x 95).
const DROP = 140
const bed = (y: number) => `M10 ${y} Q115 ${y + 128} ${AX1} ${y + DROP}`
const band = (ya: number, yb: number) => `${bed(ya)} L${AX1} ${yb + DROP} Q115 ${yb + 128} 10 ${yb} Z`
const B1 = 10 // base of the unconfined aquifer, top of the upper confining layer
const B2 = 28 // top of the confined aquifer
const B3 = 64 // base of the confined aquifer
const B4 = 82 // top of the bedrock
const sideBand = (ya: number, yb: number) => P([[AX1, ya], [AX1 + AOX, ya + AOY], [AX1 + AOX, yb + AOY], [AX1, yb]])
const aside = block(0, 0, 1, 1, 1)

// The water table: a few units below the shoulder, meeting the lake at its surface (y 116); the saturated overlay
// is drawn 10 lower and rises to it.
const WATER_TABLE = 'M106 90 Q140 90 210.3 116'
const SATURATED = `M106 100 Q140 100 210.3 126 L243.7 126 L${AX1} 127 L${AX1} ${B1 + DROP} Q115 ${B1 + 128} 10 ${B1} Z`
const LAKE_FRONT = P([[210.3, 116], [217, 124], [237, 124], [243.7, 116]])
const LAKE_TOP = P([[210.3, 116], [243.7, 116], [243.7 + AOX, 116 + AOY], [210.3 + AOX, 116 + AOY]])
const POTENTIOMETRIC = `M40 74 L${AX1} 104` // 90 at the artesian well (ground 82); 103 at the flowing well (ground 112)

const Well = ({ x, top, bottom, water, part, children }: { x: number; top: number; bottom: number; water: number; part: string; children?: React.ReactNode }) => (
  <g data-part={part}>
    <rect x={x - 2.5} y={top} width={5} height={bottom - top} fill={MATERIAL.chalk} stroke={MATERIAL.basement} strokeWidth="1.2" />
    <rect x={x - 1.5} y={water} width={3} height={bottom - water} fill={MATERIAL.water} />
    <rect x={x - 5} y={top - 3} width={10} height={3} fill={MATERIAL.basement} />
    {children}
  </g>
)

const artesian: Variant = {
  id: 'artesian',
  label: 'Artesian cross-section',
  caption: 'Rain on the high ground soaks into the tilted beds. In the unconfined aquifer the water table rises a little and flow moves down-gradient toward the lake; the confined aquifer below carries water under its confining layer, so a well into it fills above the aquifer, and flows at the surface where the potentiometric surface stands above the ground.',
  parts: [
    { id: 'recharge', label: 'Recharge', text: 'Rain falling on the high ground where the aquifers reach the surface. It soaks in and feeds both the water table and the confined aquifer.' },
    { id: 'unconfined', label: 'Unconfined aquifer', text: 'Sandstone open to the surface, so rain reaches it directly. Its water table is free to rise and fall.' },
    { id: 'water-table', label: 'Water table', text: 'The top of the saturated zone in the unconfined aquifer. It follows the land surface in a subdued way and meets the lake at its surface.' },
    { id: 'confining', label: 'Confining layer', text: 'Mudstone that holds water but barely passes it. One seals the confined aquifer above and another seals it below.' },
    { id: 'confined', label: 'Confined aquifer', text: 'Sandstone sealed between two confining layers. It is recharged only where it reaches the surface on the high ground, and its water is under pressure downslope.' },
    { id: 'potentiometric', label: 'Potentiometric surface', text: 'The level to which water in the confined aquifer would rise in a well. It slopes down from the recharge area and runs above the ground on the low side.' },
    { id: 'well-table', label: 'Water-table well', text: 'A well into the unconfined aquifer. Water stands in it at the water table.' },
    { id: 'well-artesian', label: 'Non-flowing artesian well', text: 'A well through the confining layer into the confined aquifer. Water rises above the aquifer but stops below the ground, because the potentiometric surface is below the surface here.' },
    { id: 'well-flowing', label: 'Flowing artesian well', text: 'A well into the confined aquifer where the potentiometric surface is above the ground. Water rises to the surface and flows out on its own.' },
  ],
  Scene: () => (
    <Svg caption={artesian.caption}>
      <defs>
        <clipPath id="gw-face">
          <polygon points={FACE} />
        </clipPath>
        <clipPath id="gw-unconfined">
          <path d={band(-400, B1)} />
        </clipPath>
      </defs>
      {/* top and side faces */}
      <polygon points={TOPFACE} fill={aside.topFill(MATERIAL.sandstone)} />
      <g data-part="unconfined">
        <polygon points={sideBand(110, B1 + DROP)} fill={aside.sideFill(MATERIAL.sandstone)} />
      </g>
      <g data-part="confining">
        <polygon points={sideBand(B1 + DROP, B2 + DROP)} fill={aside.sideFill(MATERIAL.mudstone)} />
        <polygon points={sideBand(B3 + DROP, B4 + DROP)} fill={aside.sideFill(MATERIAL.mudstone)} />
      </g>
      <g data-part="confined">
        <polygon points={sideBand(B2 + DROP, B3 + DROP)} fill={aside.sideFill(MATERIAL.sandstone)} />
      </g>
      <polygon points={sideBand(B4 + DROP, ABOT)} fill={aside.sideFill(MATERIAL.limestone)} />
      {/* front face: the beds */}
      <g clipPath="url(#gw-face)">
        <g data-part="unconfined">
          <path d={band(-400, B1)} fill={MATERIAL.sandstone} />
          <path d={band(-400, B1)} fill={hatch('gw', 'sandstone')} />
        </g>
        <g data-part="confining">
          <path d={band(B1, B2)} fill={MATERIAL.mudstone} />
          <path d={band(B3, B4)} fill={MATERIAL.mudstone} />
        </g>
        <g data-part="confined">
          <path d={band(B2, B3)} fill={MATERIAL.sandstone} />
          <path d={band(B2, B3)} fill={hatch('gw', 'sandstone')} />
          <Flow d={bed(46)} seconds={4} />
          <Head x1={238} y1={183.8} x2={250} y2={185.2} />
        </g>
        <path d={band(B4, 400)} fill={MATERIAL.limestone} />
        <path d={band(B4, 400)} fill={hatch('gw', 'limestone')} />
        {/* the saturated part of the unconfined aquifer, drawn 10 below the water table and rising to it */}
        <g clipPath="url(#gw-unconfined)" data-part="water-table">
          <path d={SATURATED} fill={MATERIAL.water} opacity="0.35" className="mdl" style={{ animationName: 'mdl-rise', animationDuration: '10s' }} />
        </g>
        <g data-part="unconfined">
          <Flow d="M114 100 Q160 108 212 121" width={2} />
          <Head x1={205} y1={119.4} x2={213} y2={121.3} />
        </g>
        {[B1, B2, B3, B4].map((y) => (
          <path key={y} d={bed(y)} {...OUTLINE} strokeWidth="1.2" />
        ))}
      </g>
      <g data-part="water-table">
        <path d={WATER_TABLE} fill="none" stroke={MATERIAL.water} strokeWidth="2" strokeDasharray="4 3" />
        <path d={`M243.7 116 L${AX1} 117`} fill="none" stroke={MATERIAL.water} strokeWidth="2" strokeDasharray="4 3" />
        <polygon points={LAKE_FRONT} fill={MATERIAL.water} />
        <polygon points={LAKE_TOP} fill={MATERIAL.water} opacity="0.85" />
      </g>
      <Flow d="M262 104 Q270 102 278 99" width={2.4} opacity={0.8} />
      {/* outlines */}
      <polygon points={FACE} {...OUTLINE} />
      <polygon points={TOPFACE} {...OUTLINE} />
      <polygon points={SIDE} {...OUTLINE} />
      {[B1, B2, B3, B4].map((y) => (
        <line key={y} x1={AX1} y1={y + DROP} x2={AX1 + AOX} y2={y + DROP + AOY} {...OUTLINE} strokeWidth="1.2" />
      ))}
      {/* potentiometric surface: the level water in the confined aquifer would rise to */}
      <g data-part="potentiometric">
        <path d={POTENTIOMETRIC} fill="none" stroke={MATERIAL.shaleDeep} strokeWidth="2" strokeDasharray="5 4" />
      </g>
      {/* rain on the recharge area, and an arrow into the aquifer outcrop */}
      <g data-part="recharge">
        {[[16, 60, 1.8], [26, 64, 2.4], [36, 67, 2.1], [46, 71, 2.7]].map(([x, y, s]) => (
          <line key={x} x1={x} y1={y! - 6} x2={x} y2={y} stroke={MATERIAL.water} strokeWidth="2" strokeLinecap="round" className="mdl" style={{ animationName: 'mdl-fall', animationDuration: `${s}s` }} />
        ))}
        <path d={arrow(48, 77, 48, 93)} fill={MATERIAL.water} stroke={MATERIAL.water} strokeWidth="2" strokeLinejoin="round" />
      </g>
      {/* wells: water stands at the water table, at the potentiometric surface, or overflows */}
      <Well x={132} top={76} bottom={112} water={92.7} part="well-table" />
      <Well x={158} top={76} bottom={172} water={90.2} part="well-artesian" />
      <Well x={250} top={107} bottom={196} water={107} part="well-flowing">
        <ellipse cx={250} cy={111.5} rx={8} ry={2.2} fill={MATERIAL.water} />
        {[[244, 97, 2], [250, 94, 1.6], [256, 97, 2.3]].map(([x, y, s]) => (
          <line key={x} x1={250} y1={105} x2={x} y2={y} stroke={MATERIAL.water} strokeWidth="2" strokeLinecap="round" className="mdl" style={{ animationName: 'mdl-pulse', animationDuration: `${s}s` }} />
        ))}
      </Well>
      {/* labels */}
      <Label x={40} y={40} lx={56} ly={14} part="recharge">
        Recharge
      </Label>
      <Label x={134} y={74} lx={152} ly={40} part="well-table" anchor="end">
        Water-table well
      </Label>
      <Label x={160} y={74} lx={170} ly={14} part="well-artesian">
        Artesian well
      </Label>
      <Label x={184} y={106.6} lx={276} ly={14} part="water-table">
        Water table
      </Label>
      <Label x={230} y={100} lx={398} ly={56} part="potentiometric" anchor="end">
        Potentiometric surface
      </Label>
      <Label x={254} y={108} lx={290} ly={96} part="well-flowing">
        Flowing well
      </Label>
      <Label x={268} y={124} lx={398} ly={132} part="unconfined" anchor="end">
        Unconfined
      </Label>
      <Label x={268} y={153} lx={398} ly={162} part="confining" anchor="end">
        Aquitard
      </Label>
      <Label x={268} y={180} lx={398} ly={196} part="confined" anchor="end">
        Confined
      </Label>
    </Svg>
  ),
}

/* ---------- Infiltration zones ---------- */

const Z = block(30, 60, 230, 170, 40)
const ZOX = 40 * 0.62
const ZOY = 40 * -0.36
const ZX1 = 260
const SOIL_BASE = 72
const WT_L = 140
const WT_R = 150
const PALE = mix(MATERIAL.sandstone, MATERIAL.chalk, 0.45)
const WET = mix(MATERIAL.sandstone, MATERIAL.water, 0.35)
const zSide = (ya: number, yb: number) => P([[ZX1, ya], [ZX1 + ZOX, ya + ZOY], [ZX1 + ZOX, yb + ZOY], [ZX1, yb]])

const zones: Variant = {
  id: 'zones',
  label: 'Infiltration zones',
  caption: 'Rain soaks down through the topsoil and the unsaturated zone, where pores hold both air and water. Below the water table every pore is full, and that groundwater moves slowly sideways down the slope of the water table.',
  parts: [
    { id: 'topsoil', label: 'Topsoil', text: 'The thin surface layer of weathered material and roots. Rain enters the ground through it.' },
    { id: 'unsaturated', label: 'Unsaturated zone', text: 'The zone between the surface and the water table. Its pores hold air as well as water, and water moves down through it under gravity.' },
    { id: 'water-table', label: 'Water table', text: 'The surface below which every pore is full of water. It slopes gently, and groundwater moves in the direction of that slope.' },
    { id: 'saturated', label: 'Saturated zone', text: 'The zone below the water table, with every pore and crack full of water. It is the part of the ground that wells draw on.' },
    { id: 'flow', label: 'Groundwater flow', text: 'Groundwater moving through the saturated zone. It moves slowly, from metres a day in gravel to centimetres a year in clay, down the slope of the water table.' },
  ],
  Scene: () => (
    <Svg caption={zones.caption}>
      <polygon points={Z.top} fill={Z.topFill(MATERIAL.soil)} />
      <g data-part="topsoil">
        <polygon points={P([[30, 60], [ZX1, 60], [ZX1, SOIL_BASE], [30, SOIL_BASE]])} fill={MATERIAL.soil} />
        <polygon points={zSide(60, SOIL_BASE)} fill={Z.sideFill(MATERIAL.soil)} />
      </g>
      <g data-part="unsaturated">
        <polygon points={P([[30, SOIL_BASE], [ZX1, SOIL_BASE], [ZX1, WT_R], [30, WT_L]])} fill={PALE} />
        <polygon points={P([[30, SOIL_BASE], [ZX1, SOIL_BASE], [ZX1, WT_R], [30, WT_L]])} fill={hatch('gw', 'sandstone')} />
        <polygon points={zSide(SOIL_BASE, WT_R)} fill={Z.sideFill(PALE)} />
        {[[65, 4], [110, 5], [155, 4.5], [200, 5.5], [88, 6], [178, 3.5], [232, 4.8]].map(([x, s], i) => (
          <path key={x} d={arrow(x!, i < 4 ? 82 : 100, x!, i < 4 ? 100 : 118)} fill={MATERIAL.water} stroke={MATERIAL.water} strokeWidth="1.6" strokeLinejoin="round" className="mdl" style={{ animationName: 'mdl-sink', animationDuration: `${s}s` }} />
        ))}
      </g>
      <g data-part="saturated">
        <polygon points={P([[30, WT_L], [ZX1, WT_R], [ZX1, 230], [30, 230]])} fill={WET} />
        <polygon points={P([[30, WT_L], [ZX1, WT_R], [ZX1, 230], [30, 230]])} fill={hatch('gw', 'sandstone')} />
        <polygon points={zSide(WT_R, 230)} fill={Z.sideFill(WET)} />
      </g>
      <g data-part="water-table">
        <line x1={30} y1={WT_L} x2={ZX1} y2={WT_R} stroke={MATERIAL.water} strokeWidth="2.2" strokeDasharray="4 3" />
        <line x1={ZX1} y1={WT_R} x2={ZX1 + ZOX} y2={WT_R + ZOY} stroke={MATERIAL.water} strokeWidth="2.2" strokeDasharray="4 3" />
      </g>
      <g data-part="flow">
        <Flow d="M48 174 L232 181" />
        <Head x1={228} y1={180.9} x2={244} y2={181.5} />
        <Flow d="M48 206 L205 211.5" width={2} seconds={3.6} opacity={0.8} />
        <Head x1={201} y1={211.4} x2={216} y2={212} />
      </g>
      {/* rain over the top face */}
      {[[80, 1.9], [110, 2.5], [140, 2.2], [170, 2.8], [200, 2.0]].map(([x, s]) => (
        <line key={x} x1={x} y1={44} x2={x} y2={50} stroke={MATERIAL.water} strokeWidth="2" strokeLinecap="round" className="mdl" style={{ animationName: 'mdl-fall', animationDuration: `${s}s` }} />
      ))}
      <polygon points={Z.front} {...OUTLINE} />
      <polygon points={Z.top} {...OUTLINE} />
      <polygon points={Z.side} {...OUTLINE} />
      <line x1={30} y1={SOIL_BASE} x2={ZX1} y2={SOIL_BASE} {...OUTLINE} strokeWidth="1.2" />
      <line x1={ZX1} y1={SOIL_BASE} x2={ZX1 + ZOX} y2={SOIL_BASE + ZOY} {...OUTLINE} strokeWidth="1.2" />
      <Label x={272} y={58} lx={398} ly={66} part="topsoil" anchor="end">
        Topsoil
      </Label>
      <Label x={272} y={100} lx={398} ly={108} part="unsaturated" anchor="end">
        Unsaturated
      </Label>
      <Label x={272} y={141} lx={398} ly={150} part="water-table" anchor="end">
        Water table
      </Label>
      <Label x={272} y={190} lx={398} ly={196} part="saturated" anchor="end">
        Saturated
      </Label>
      <Label x={190} y={183} lx={190} ly={252} part="flow" anchor="middle">
        Groundwater flow
      </Label>
    </Svg>
  ),
}

/* ---------- Karst ---------- */

const KD = 46
const KOX = KD * 0.62
const KOY = KD * -0.36
const K_FACE = P([[30, 70], [200, 70], [236, 160], [280, 160], [280, 230], [30, 230]])
const K_PLATEAU = P([[30, 70], [200, 70], [200 + KOX, 70 + KOY], [30 + KOX, 70 + KOY]])
const K_SLOPE = P([[200, 70], [236, 160], [236 + KOX, 160 + KOY], [200 + KOX, 70 + KOY]])
const K_FLOOR = P([[236, 160], [280, 160], [280 + KOX, 160 + KOY], [236 + KOX, 160 + KOY]])
const K_SIDE = P([[280, 160], [280 + KOX, 160 + KOY], [280 + KOX, 230 + KOY], [280, 230]])
const kb = block(0, 0, 1, 1, 1)
const CAVE = 'M108 150 Q140 134 175 142 Q212 132 242 150 L242 164 Q205 172 170 166 Q135 172 108 160 Z'
const CAVE_FILL = mix(MATERIAL.limestone, MATERIAL.basement, 0.5)

const Sinkhole = ({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) => (
  <g data-part="sinkhole">
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={mix(MATERIAL.limestone, MATERIAL.basement, 0.3)} stroke={MATERIAL.basement} strokeWidth="1" opacity="0.9" />
    <ellipse cx={cx} cy={cy + ry * 0.3} rx={rx * 0.55} ry={ry * 0.5} fill={mix(MATERIAL.limestone, MATERIAL.basement, 0.6)} />
  </g>
)

const karst: Variant = {
  id: 'karst',
  label: 'Karst',
  caption: 'Water that picked up carbon dioxide in the soil dissolves limestone along its joints. A stream sinks into a sinkhole, runs through a cave along the water table, and returns to the surface as a spring in the valley.',
  parts: [
    { id: 'sinkhole', label: 'Sinkhole', text: 'A dish in the surface where the roof of a cavity has fallen in or soil has washed down into it. Surface water drains into it.' },
    { id: 'sinking-stream', label: 'Sinking stream', text: 'A surface stream that loses its water into a sinkhole and continues underground down a shaft.' },
    { id: 'cave', label: 'Cave', text: 'A passage opened by solution along joints and bedding planes. The largest passages form at the water table, where flow is strongest.' },
    { id: 'water-table', label: 'Water table', text: 'The top of the saturated zone. In karst, water moves fast along it through open conduits rather than slowly through pores.' },
    { id: 'spring', label: 'Spring', text: 'Where the cave meets the valley side and its water returns to the surface. The valley stream starts here.' },
  ],
  Scene: () => (
    <Svg caption={karst.caption}>
      <defs>
        <clipPath id="gw-karst-face">
          <polygon points={K_FACE} />
        </clipPath>
        <clipPath id="gw-cave">
          <path d={CAVE} />
        </clipPath>
        {/* the brick hatch turned 45 degrees reads as jointed rock rather than a built wall */}
        <pattern id="gw-karst-limestone" href="#gw-limestone" patternTransform="rotate(45)" />
      </defs>
      <polygon points={K_FACE} fill={MATERIAL.limestone} />
      <polygon points={K_FACE} fill="url(#gw-karst-limestone)" />
      <polygon points={K_PLATEAU} fill={kb.topFill(MATERIAL.limestone)} />
      <polygon points={K_SLOPE} fill={mix(MATERIAL.limestone, MATERIAL.basement, 0.12)} />
      <polygon points={K_FLOOR} fill={kb.topFill(MATERIAL.limestone)} />
      <polygon points={K_SIDE} fill={kb.sideFill(MATERIAL.limestone)} />
      {/* the cave at the water table, water filling its lower half and flowing to the right */}
      <g clipPath="url(#gw-karst-face)">
        <g data-part="cave">
          <path d={CAVE} fill={CAVE_FILL} />
          <g clipPath="url(#gw-cave)">
            <polygon points={P([[30, 150], [242, 157], [242, 200], [30, 200]])} fill={MATERIAL.water} />
          </g>
          <path d={CAVE} fill="none" stroke={MATERIAL.basement} strokeWidth="1.2" opacity="0.8" />
          <Flow d="M118 148 Q170 162 236 158" width={2.2} />
        </g>
      </g>
      <g data-part="sinking-stream">
        <rect x={117} y={70} width={6} height={74} fill={CAVE_FILL} />
        <Flow d="M120 76 L120 142" width={2} seconds={2.4} />
        <path d="M66 54 Q95 57 112 64" fill="none" stroke={MATERIAL.water} strokeWidth="3.4" strokeLinecap="round" opacity="0.6" />
        <Flow d="M66 54 Q95 57 112 64" width={2} seconds={2.4} />
      </g>
      <g data-part="water-table">
        <line x1={30} y1={148} x2={236} y2={156} stroke={MATERIAL.water} strokeWidth="2.2" strokeDasharray="4 3" />
        <line x1={280} y1={157} x2={280 + KOX} y2={157 + KOY} stroke={MATERIAL.water} strokeWidth="2.2" strokeDasharray="4 3" />
      </g>
      <Sinkhole cx={85} cy={66} rx={10} ry={4} />
      <Sinkhole cx={160} cy={59} rx={9} ry={3.5} />
      <Sinkhole cx={120} cy={67} rx={13} ry={5} />
      <g data-part="spring">
        <ellipse cx={235} cy={157} rx={4} ry={3} fill={MATERIAL.water} />
        <path d="M237 158 Q262 154 296 149" fill="none" stroke={MATERIAL.water} strokeWidth="3.4" strokeLinecap="round" opacity="0.6" />
        <Flow d="M237 158 Q262 154 296 149" width={2} />
      </g>
      <polygon points={K_FACE} {...OUTLINE} />
      <polygon points={K_PLATEAU} {...OUTLINE} />
      <polygon points={K_SLOPE} {...OUTLINE} />
      <polygon points={K_FLOOR} {...OUTLINE} />
      <polygon points={K_SIDE} {...OUTLINE} />
      <Label x={80} y={62} lx={50} ly={16} part="sinkhole">
        Sinkhole
      </Label>
      <Label x={100} y={60} lx={130} ly={36} part="sinking-stream">
        Sinking stream
      </Label>
      <Label x={170} y={166} lx={170} ly={252} part="cave" anchor="middle">
        Cave
      </Label>
      <Label x={237} y={155} lx={300} ly={118} part="spring">
        Spring
      </Label>
      <Label x={300} y={145.3} lx={398} ly={150} part="water-table" anchor="end">
        Water table
      </Label>
    </Svg>
  ),
}

export const VARIANTS: Variant[] = [artesian, zones, karst]

/** The groundwater models: an artesian section with three wells, the zones below the surface, and a karst block. */
export const Model = () => <ModelTab lead="Groundwater as looping diagrams: a cross-section with three wells, the zones below the surface, and a karst block. Tap a part of the drawing, or a chip, for what it is." variants={VARIANTS} />
