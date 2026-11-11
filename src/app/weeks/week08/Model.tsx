import { arrow, block, hatch, Label, MATERIAL, OUTLINE, Patterns } from '@/app/models/draw'
import { ModelTab, type Variant } from '@/app/models/ModelTab'

/*
 * Plate boundaries as looping block diagrams (docs/specs/models.md). One slab of lithosphere, 36 deep, over the
 * asthenosphere, in cabinet projection with depth 50. The plates drift as steady loops; what the boundary builds
 * (new crust, a volcano, a range) is a before-to-after loop that holds its end state.
 */

const TOP = 120
const THICK = 36
const BOTTOM = 245
const D = 50
const LEFT = 10
const RIGHT = 262
const MID = 136

/** The asthenosphere block with its top hidden under the plates, and a dashed cell that shows which way it turns. */
const Mantle = ({ cells }: { cells: { cx: number; cy: number; clockwise: boolean }[] }) => {
  const m = block(LEFT, TOP + THICK, RIGHT - LEFT, BOTTOM - TOP - THICK, D)
  return (
    <g data-part="asthenosphere">
      <polygon points={m.front} fill={MATERIAL.mantle} />
      <polygon points={m.side} fill={m.sideFill(MATERIAL.mantle)} />
      <polygon points={m.front} {...OUTLINE} />
      <polygon points={m.side} {...OUTLINE} />
      {cells.map(({ cx, cy, clockwise }) => (
        <path key={cx} d={`M${cx - 26} ${cy} a26 26 0 1 ${clockwise ? 1 : 0} 52 0 a26 26 0 1 ${clockwise ? 1 : 0} -52 0`} fill="none" stroke={MATERIAL.basement} strokeWidth="2.2" strokeDasharray="8 6" strokeLinecap="round" opacity="0.6" className="mdl mdl-flow" style={{ animationDuration: '3s', animationName: 'mdl-flow' }} data-part="flow" />
      ))}
    </g>
  )
}

/** A plate as a slab: front face hatched, top lighter, side darker. */
const Plate = ({ x, w, fill, bed, part }: { x: number; w: number; fill: string; bed?: 'sandstone'; part: string }) => {
  const p = block(x, TOP, w, THICK, D)
  return (
    <g data-part={part}>
      <polygon points={p.front} fill={fill} />
      {bed && <polygon points={p.front} fill={hatch('pt', bed)} />}
      <polygon points={p.top} fill={p.topFill(fill)} />
      <polygon points={p.side} fill={p.sideFill(fill)} />
      <polygon points={p.front} {...OUTLINE} />
      <polygon points={p.top} {...OUTLINE} />
      <polygon points={p.side} {...OUTLINE} />
    </g>
  )
}

const Motion = ({ x1, x2, y = TOP - 9 }: { x1: number; x2: number; y?: number }) => <path d={arrow(x1 + (D * 0.62) / 2, y, x2 + (D * 0.62) / 2, y)} fill={MATERIAL.basement} stroke={MATERIAL.basement} strokeWidth="2.4" strokeLinecap="round" />

const Svg = ({ caption, children }: { caption: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 400 260" role="img" aria-label={caption}>
    <Patterns prefix="pt" />
    {children}
  </svg>
)

const divergent: Variant = {
  id: 'divergent',
  label: 'Divergent',
  caption: 'Two plates pull apart at a ridge. Hot mantle rises into the gap, partly melts, and the melt freezes as new crust along the ridge, so the sea floor on both sides is youngest at the centre.',
  parts: [
    { id: 'lithosphere', label: 'Lithosphere', text: 'The rigid outer shell, crust and uppermost mantle together, that moves as a plate.' },
    { id: 'asthenosphere', label: 'Asthenosphere', text: 'The weak, slowly flowing mantle beneath the plates. It carries them along and rises where they part.' },
    { id: 'flow', label: 'Mantle flow', text: 'The dashed loops turn with the convecting mantle: up beneath the ridge, outward beneath the plates.' },
    { id: 'ridge', label: 'Ridge', text: 'The raised boundary where the plates separate. A valley runs along its crest where the crust drops between the parting plates.' },
    { id: 'magma', label: 'Magma', text: 'Mantle rising under the ridge melts as the pressure on it falls. The melt rises and freezes into new oceanic crust.' },
  ],
  Scene: () => (
    <Svg caption={divergent.caption}>
      <Mantle cells={[{ cx: 85, cy: 200, clockwise: false }, { cx: 215, cy: 200, clockwise: true }]} />
      <g data-part="magma">
        <polygon points={`${MID - 22},${BOTTOM - 10} ${MID + 22},${BOTTOM - 10} ${MID},${TOP + 10}`} fill={MATERIAL.magma} className="mdl" style={{ animationName: 'mdl-pulse', animationDuration: '4s' }} />
      </g>
      <g className="mdl" style={{ animationName: 'mdl-drift-left' }}>
        <Plate x={LEFT} w={MID - LEFT - 6} fill={MATERIAL.oceanCrust} part="lithosphere" />
        <Motion x1={100} x2={60} />
      </g>
      <g className="mdl" style={{ animationName: 'mdl-drift-right' }}>
        <Plate x={MID + 6} w={RIGHT - MID - 6} fill={MATERIAL.oceanCrust} part="lithosphere" />
        <Motion x1={200} x2={240} />
      </g>
      <g data-part="ridge">
        <polygon points={`${MID - 6},${TOP + 8} ${MID + 6},${TOP + 8} ${MID + 6},${TOP + THICK} ${MID - 6},${TOP + THICK}`} fill={MATERIAL.magma} opacity="0.85" className="mdl" style={{ animationName: 'mdl-rise', animationDuration: '6s' }} />
        <line x1={MID - 6} y1={TOP + 8} x2={MID + 6} y2={TOP + 8} stroke={MATERIAL.basement} strokeWidth="1.6" />
      </g>
      <Label x={MID} y={TOP + 2} lx={MID + 16} ly={40} part="ridge" anchor="middle">
        Ridge, with its rift valley
      </Label>
      <Label x={MID} y={BOTTOM - 20} lx={MID} ly={254} part="magma" anchor="middle">
        Rising magma
      </Label>
      <Label x={RIGHT + 24} y={TOP + 4} lx={398} ly={70} part="lithosphere" anchor="end">
        Lithosphere
      </Label>
      <Label x={RIGHT + 28} y={200} lx={398} ly={200} part="asthenosphere" anchor="end">
        Asthenosphere
      </Label>
      <Label x={85} y={174} lx={60} ly={96} part="flow">
        Mantle flow
      </Label>
    </Svg>
  ),
}

const subduction: Variant = {
  id: 'subduction',
  label: 'Convergent, subduction',
  caption: 'An oceanic plate meets a continental one and, being denser, bends down beneath it into the mantle. Water carried down with the slab lowers the melting point of the mantle above it; the melt rises and builds a chain of volcanoes on the overriding plate.',
  parts: [
    { id: 'slab', label: 'Subducting slab', text: 'The oceanic plate, dense and cold, sinking into the mantle at an angle. It is the oldest, heaviest lithosphere in the picture.' },
    { id: 'lithosphere', label: 'Overriding plate', text: 'The continental plate the slab passes under. Its edge is crumpled and uplifted, and the volcanoes grow on it.' },
    { id: 'asthenosphere', label: 'Asthenosphere', text: 'The weak mantle the slab sinks through. It is dragged down with the slab on one side and rises behind the arc on the other.' },
    { id: 'flow', label: 'Mantle flow', text: 'The dashed loop turns with the mantle, dragged down beside the sinking slab and rising again beneath the plate behind the volcanoes.' },
    { id: 'trench', label: 'Trench', text: 'The deep trough where the slab bends down. It is the surface trace of the boundary.' },
    { id: 'magma', label: 'Magma', text: 'Melt from the mantle wedge above the slab, rising through the overriding plate.' },
    { id: 'volcano', label: 'Volcano', text: 'Where the rising magma reaches the surface. A line of them, inland of the trench, marks the depth at which the slab releases its water.' },
  ],
  Scene: () => (
    <Svg caption={subduction.caption}>
      <Mantle cells={[{ cx: 95, cy: 205, clockwise: true }]} />
      <g data-part="slab" className="mdl" style={{ animationName: 'mdl-drift-right' }}>
        <path d={`M${LEFT} ${TOP} L${MID - 20} ${TOP} Q${MID + 40} ${TOP + 12} ${MID + 86} ${BOTTOM} L${MID + 46} ${BOTTOM} Q${MID + 10} ${TOP + 60} ${MID - 40} ${TOP + THICK} L${LEFT} ${TOP + THICK} Z`} fill={MATERIAL.oceanCrust} />
        <polygon points={block(LEFT, TOP, MID - 20 - LEFT, THICK, D).top} fill={block(0, 0, 1, 1, 1).topFill(MATERIAL.oceanCrust)} />
        <path d={`M${LEFT} ${TOP} L${MID - 20} ${TOP} Q${MID + 40} ${TOP + 12} ${MID + 86} ${BOTTOM} L${MID + 46} ${BOTTOM} Q${MID + 10} ${TOP + 60} ${MID - 40} ${TOP + THICK} L${LEFT} ${TOP + THICK} Z`} {...OUTLINE} />
        <polygon points={block(LEFT, TOP, MID - 20 - LEFT, THICK, D).top} {...OUTLINE} />
        <Motion x1={60} x2={100} />
      </g>
      <g data-part="magma">
        <path d={`M${MID + 50} ${TOP + 70} Q${MID + 40} ${TOP + 30} ${MID + 60} ${TOP + 2}`} fill="none" stroke={MATERIAL.magma} strokeWidth="5" strokeLinecap="round" />
        <circle cx={MID + 48} cy={TOP + 62} r="6" fill={MATERIAL.magma} className="mdl" style={{ animationName: 'mdl-rise', animationDuration: '5s' }} />
        <circle cx={MID + 42} cy={TOP + 44} r="4" fill={MATERIAL.magma} className="mdl" style={{ animationName: 'mdl-rise', animationDuration: '7s' }} />
      </g>
      <g className="mdl" style={{ animationName: 'mdl-drift-left' }}>
        <Plate x={MID - 16} w={RIGHT - MID + 16} fill={MATERIAL.crust} bed="sandstone" part="lithosphere" />
        <Motion x1={250} x2={210} />
        <g data-part="volcano">
          <polygon points={`${MID + 34},${TOP} ${MID + 60},${TOP - 42} ${MID + 86},${TOP}`} fill={MATERIAL.ash} className="mdl mdl-grow" style={{ animationName: 'mdl-grow', animationDuration: '9s' }} />
          <polygon points={`${MID + 34},${TOP} ${MID + 60},${TOP - 42} ${MID + 86},${TOP}`} {...OUTLINE} />
          <line x1={MID + 60} y1={TOP} x2={MID + 60} y2={TOP - 36} stroke={MATERIAL.magma} strokeWidth="3" />
        </g>
      </g>
      <g data-part="trench">
        <polygon points={`${MID - 28},${TOP} ${MID - 16},${TOP} ${MID - 16},${TOP + 14} ${MID - 28},${TOP + 8}`} fill={MATERIAL.water} />
      </g>
      <Label x={MID - 22} y={TOP + 4} lx={MID - 40} ly={40} part="trench" anchor="middle">
        Trench
      </Label>
      <Label x={MID + 60} y={TOP - 40} lx={MID + 110} ly={40} part="volcano">
        Volcano
      </Label>
      <Label x={MID + 60} y={BOTTOM - 20} lx={MID + 20} ly={254} part="slab" anchor="middle">
        Sinking slab
      </Label>
      <Label x={RIGHT + 26} y={TOP + 6} lx={398} ly={76} part="lithosphere" anchor="end">
        Overriding plate
      </Label>
      <Label x={RIGHT + 28} y={205} lx={398} ly={205} part="asthenosphere" anchor="end">
        Asthenosphere
      </Label>
      <Label x={MID + 44} y={TOP + 50} lx={MID + 100} ly={TOP + 80} part="magma">
        Magma
      </Label>
    </Svg>
  ),
}

const collision: Variant = {
  id: 'collision',
  label: 'Convergent, collision',
  caption: 'Two continental plates converge. Neither is dense enough to sink far, so the crust between them crumples, stacks up and thickens: a mountain range rises above and a deep root pushes down below.',
  parts: [
    { id: 'lithosphere', label: 'Continental plates', text: 'Both plates carry thick, light continental crust. Each drives toward the other.' },
    { id: 'asthenosphere', label: 'Asthenosphere', text: 'The weak mantle beneath. With no slab sinking into it, the collision is taken up in the crust above.' },
    { id: 'boundary', label: 'Suture', text: 'The line along which the two continents are joined. The ocean that once lay between them has closed.' },
    { id: 'mountains', label: 'Mountain range', text: 'Folded and faulted crust stacked upward as the plates converge. It grows as long as the convergence lasts.' },
    { id: 'root', label: 'Crustal root', text: 'The thickened crust also bulges downward into the mantle, a root several times deeper than the range is high, holding the range up by buoyancy.' },
  ],
  Scene: () => (
    <Svg caption={collision.caption}>
      <Mantle cells={[]} />
      <g className="mdl" style={{ animationName: 'mdl-drift-right' }}>
        <Plate x={LEFT} w={MID - LEFT} fill={MATERIAL.crust} bed="sandstone" part="lithosphere" />
        <Motion x1={50} x2={90} />
      </g>
      <g className="mdl" style={{ animationName: 'mdl-drift-left' }}>
        <Plate x={MID} w={RIGHT - MID} fill={MATERIAL.crust} bed="sandstone" part="lithosphere" />
        <Motion x1={250} x2={210} />
      </g>
      <g data-part="root">
        <polygon points={`${MID - 44},${TOP + THICK} ${MID + 44},${TOP + THICK} ${MID + 14},${TOP + THICK + 46} ${MID - 14},${TOP + THICK + 46}`} fill={MATERIAL.crust} className="mdl mdl-grow-down" style={{ animationName: 'mdl-grow', animationDuration: '9s' }} />
        <polygon points={`${MID - 44},${TOP + THICK} ${MID + 44},${TOP + THICK} ${MID + 14},${TOP + THICK + 46} ${MID - 14},${TOP + THICK + 46}`} fill={hatch('pt', 'sandstone')} className="mdl mdl-grow-down" style={{ animationName: 'mdl-grow', animationDuration: '9s' }} />
      </g>
      <g data-part="mountains" className="mdl mdl-grow" style={{ animationName: 'mdl-grow', animationDuration: '9s' }}>
        <polygon points={`${MID - 56},${TOP} ${MID - 36},${TOP - 30} ${MID - 20},${TOP - 14} ${MID},${TOP - 52} ${MID + 18},${TOP - 22} ${MID + 36},${TOP - 40} ${MID + 56},${TOP}`} fill={MATERIAL.crust} />
        <polygon points={`${MID - 56},${TOP} ${MID - 36},${TOP - 30} ${MID - 20},${TOP - 14} ${MID},${TOP - 52} ${MID + 18},${TOP - 22} ${MID + 36},${TOP - 40} ${MID + 56},${TOP}`} fill={hatch('pt', 'shale')} />
        <polygon points={`${MID - 56},${TOP} ${MID - 36},${TOP - 30} ${MID - 20},${TOP - 14} ${MID},${TOP - 52} ${MID + 18},${TOP - 22} ${MID + 36},${TOP - 40} ${MID + 56},${TOP}`} {...OUTLINE} />
      </g>
      <g data-part="boundary">
        <line x1={MID} y1={TOP} x2={MID} y2={TOP + THICK} stroke={MATERIAL.basement} strokeWidth="2.6" strokeDasharray="4 3" />
      </g>
      <Label x={MID + 2} y={TOP - 50} lx={MID + 60} ly={36} part="mountains">
        Mountain range
      </Label>
      <Label x={MID} y={TOP + 20} lx={MID - 90} ly={60} part="boundary" anchor="middle">
        Suture
      </Label>
      <Label x={MID} y={TOP + THICK + 40} lx={MID} ly={254} part="root" anchor="middle">
        Crustal root
      </Label>
      <Label x={RIGHT + 26} y={TOP + 6} lx={398} ly={80} part="lithosphere" anchor="end">
        Continental plate
      </Label>
      <Label x={RIGHT + 28} y={205} lx={398} ly={205} part="asthenosphere" anchor="end">
        Asthenosphere
      </Label>
    </Svg>
  ),
}

const transform: Variant = {
  id: 'transform',
  label: 'Transform',
  caption: 'Two plates slide past each other along a transform fault. No crust is made or destroyed; the boundary is a near-vertical fault, and anything that crosses it, a stream here, is offset a little more with every slip.',
  parts: [
    { id: 'lithosphere', label: 'Plates', text: 'Two plates moving in opposite directions along the fault. The motion is horizontal, parallel to the boundary.' },
    { id: 'asthenosphere', label: 'Asthenosphere', text: 'The weak mantle beneath. It neither rises nor sinks here; the plates simply shear past each other above it.' },
    { id: 'fault', label: 'Transform fault', text: 'The vertical fault plane along which the plates slip. It runs straight into the block, along the direction of motion.' },
    { id: 'offset', label: 'Offset stream', text: 'A stream that crossed the fault has been displaced: its two halves no longer line up, and the mismatch records the slip.' },
  ],
  Scene: () => (
    <Svg caption={transform.caption}>
      <Mantle cells={[]} />
      <g className="mdl" style={{ animationName: 'mdl-slide-back', animationDuration: '6s' }}>
        <Plate x={LEFT} w={MID - LEFT} fill={MATERIAL.crust} bed="sandstone" part="lithosphere" />
        <path d={arrow(70, TOP - 4, 70 + 36 * 0.62, TOP - 4 - 36 * 0.36)} fill={MATERIAL.basement} stroke={MATERIAL.basement} strokeWidth="2.4" strokeLinecap="round" />
        <path d={`M${LEFT + 40} ${TOP - 2} Q${LEFT + 70} ${TOP - 6} ${MID} ${TOP - 9}`} fill="none" stroke={MATERIAL.water} strokeWidth="3" strokeLinecap="round" data-part="offset" />
      </g>
      <g className="mdl" style={{ animationName: 'mdl-slide-fore', animationDuration: '6s' }}>
        <Plate x={MID} w={RIGHT - MID} fill={MATERIAL.crust} bed="sandstone" part="lithosphere" />
        <path d={arrow(230 + 36 * 0.62, TOP - 4 - 36 * 0.36, 230, TOP - 4)} fill={MATERIAL.basement} stroke={MATERIAL.basement} strokeWidth="2.4" strokeLinecap="round" />
        <path d={`M${MID} ${TOP - 9} Q${MID + 40} ${TOP - 12} ${RIGHT + 10} ${TOP - 14}`} fill="none" stroke={MATERIAL.water} strokeWidth="3" strokeLinecap="round" data-part="offset" />
      </g>
      <g data-part="fault">
        <line x1={MID} y1={TOP} x2={MID + D * 0.62} y2={TOP + D * -0.36} stroke={MATERIAL.basement} strokeWidth="2.6" />
        <line x1={MID} y1={TOP} x2={MID} y2={TOP + THICK} stroke={MATERIAL.basement} strokeWidth="2.6" />
      </g>
      <Label x={MID + 10} y={TOP - 6} lx={MID + 10} ly={40} part="fault" anchor="middle">
        Transform fault
      </Label>
      <Label x={MID - 30} y={TOP - 6} lx={60} ly={60} part="offset">
        Offset stream
      </Label>
      <Label x={RIGHT + 26} y={TOP + 6} lx={398} ly={80} part="lithosphere" anchor="end">
        Plates
      </Label>
      <Label x={RIGHT + 28} y={205} lx={398} ly={205} part="asthenosphere" anchor="end">
        Asthenosphere
      </Label>
    </Svg>
  ),
}

export const VARIANTS: Variant[] = [divergent, subduction, collision, transform]

/** The plate-boundary models: a looping block diagram per boundary type. */
export const Model = () => <ModelTab lead="Each boundary type as a looping block diagram. The arrows give the plates' motion; the dashed loops give the mantle's. Tap a part of the drawing, or a chip, for what it is." variants={VARIANTS} />
