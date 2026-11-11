import { arrow, block, hatch, Label, MATERIAL, mix, OUTLINE, Patterns } from '@/app/models/draw'
import { ModelTab, type Variant } from '@/app/models/ModelTab'
import { VolcanoTurntable } from '@/app/models/VolcanoTurntable'
import { height, profile, type VolcanoType } from '@/engine/volcano/shape'

/*
 * The four volcano shapes as cut-away profiles (docs/specs/models.md). The edifice stands on the front edge of a
 * ground block: its right half is the outer skin, its left half is cut open to show the conduit, the chamber and
 * the layers. The outline on both sides is the same curve the turntable beneath is lathed from
 * (src/engine/volcano/shape.ts), so the drawing and the model agree.
 */

const LEFT = 10
const RIGHT = 262
const G = 160
const BOTTOM = 248
const D = 40
const CX = 136
const N = 48
const CHAMBER_Y = G + 54

type Pt = [number, number]
const pt = ([x, y]: Pt) => `${+x.toFixed(1)},${+y.toFixed(1)}`
const pts = (p: Pt[]) => p.map(pt).join(' ')

/** The profile as offsets from the base centre, dy upward, in viewBox units; `ve` stretches the height for the shield. */
const outline = (type: VolcanoType, R: number, ve = 1): Pt[] => {
  const h = height(type) * R * ve
  return profile(type, N).map((r, i) => [r * R, (i / (N - 1)) * h])
}
const top = (o: Pt[]) => o[o.length - 1]![1]
const onRight = ([dx, dy]: Pt, s = 1): Pt => [CX + s * dx, G - s * dy]
const onLeft = ([dx, dy]: Pt, s = 1): Pt => [CX - s * dx, G - s * dy]

/** The right half of the edifice, closed along the axis; `crater` notches the top at the vent. */
const skin = (o: Pt[], crater = 0) => pts([[CX, G], ...o.map((p) => onRight(p)), [CX, G - top(o) + crater]])
/** The cut half, scaled by s about the base centre. */
const cut = (o: Pt[], crater = 0, s = 1) => pts([[CX, G], ...o.map((p) => onLeft(p, s)), [CX, G - s * top(o) + s * crater]])
/** The whole silhouette, for the outline. */
const silhouette = (o: Pt[], crater = 0) => pts([...o.map((p) => onLeft(p)), ...(crater ? [[CX, G - top(o) + crater] as Pt] : []), ...[...o].reverse().map((p) => onRight(p))])
/** A layer in the cut: the band between the profile scaled by s2 (outer) and s1 (inner). */
const shell = (o: Pt[], s2: number, s1: number) => pts([...o.map((p) => onLeft(p, s2)), ...[...o].reverse().map((p) => onLeft(p, s1))])
/** A flow lying on the right flank from profile index iTop down to iBottom, `thick` units proud of the skin. */
const band = (o: Pt[], iTop: number, iBottom: number, thick: number) => {
  const on = o.slice(iBottom, iTop + 1).reverse().map((p) => onRight(p))
  const off = on.map(([x, y]): Pt => [x + thick * 0.3, y - thick]).reverse()
  return pts([...on, ...off])
}

const Svg = ({ caption, children }: { caption: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 400 260" role="img" aria-label={caption}>
    <Patterns prefix="vo" />
    {children}
  </svg>
)

/** The ground block: country rock in front, vegetated top. */
const Ground = () => {
  const g = block(LEFT, G, RIGHT - LEFT, BOTTOM - G, D)
  return (
    <g>
      <polygon points={g.front} fill={MATERIAL.crust} />
      <polygon points={g.front} fill={hatch('vo', 'sandstone')} />
      <polygon points={g.top} fill={MATERIAL.greensand} />
      <polygon points={g.top} fill={hatch('vo', 'greensand')} />
      <polygon points={g.side} fill={g.sideFill(MATERIAL.crust)} />
      <polygon points={g.front} {...OUTLINE} />
      <polygon points={g.top} {...OUTLINE} />
      <polygon points={g.side} {...OUTLINE} />
    </g>
  )
}

const Chamber = ({ rx, ry, children }: { rx: number; ry: number; children?: React.ReactNode }) => (
  <g data-part="chamber">
    {children ?? <ellipse cx={CX} cy={CHAMBER_Y} rx={rx} ry={ry} fill={MATERIAL.magma} className="mdl" style={{ animationName: 'mdl-pulse', animationDuration: '6s' }} />}
    <path d={arrow(CX, CHAMBER_Y + ry - 4, CX, CHAMBER_Y - ry + 6)} fill={MATERIAL.basement} stroke={MATERIAL.basement} strokeWidth="2" strokeLinecap="round" />
  </g>
)

const Conduit = ({ y }: { y: number }) => (
  <g data-part="conduit">
    <rect x={CX - 2.5} y={y} width={5} height={CHAMBER_Y - y} fill={MATERIAL.magma} />
  </g>
)

const Arrow = ({ d }: { d: string }) => <path d={d} fill={MATERIAL.basement} stroke={MATERIAL.basement} strokeWidth="2.2" strokeLinecap="round" />

const ChamberLabel = ({ ry }: { ry: number }) => (
  <Label x={CX} y={CHAMBER_Y + ry} lx={CX} ly={254} part="chamber" anchor="middle">
    Magma chamber
  </Label>
)

const SHIELD_VE = 3
const shieldShape = outline('shield', 120, SHIELD_VE)
const shield: Variant = {
  id: 'shield',
  label: 'Shield volcano',
  caption: 'Runny basalt rises through the conduit and pours out as thin lava flows that run far down the gentle flanks, so hundreds of flows stack into a broad, low dome. The slopes are so gentle that this section is stretched three times vertically; the model you can turn is to scale.',
  parts: [
    { id: 'conduit', label: 'Conduit', text: 'The pipe through which magma rises from the chamber to the vent. In a shield it carries fluid basalt that erupts quietly.' },
    { id: 'chamber', label: 'Magma chamber', text: 'The reservoir of magma beneath the volcano. Each eruption draws it down, and new melt from below refills it.' },
    { id: 'flow', label: 'Lava flow', text: 'A thin sheet of fluid lava running down the flank. Each flow adds one more layer to the pile, and how far it runs sets how broad the shield grows.' },
  ],
  Scene: () => {
    const o = shieldShape
    const yTop = G - top(o)
    const flank = [[CX, yTop] as Pt, ...[...o].reverse().map((p) => onRight(p))]
    return (
      <Svg caption={shield.caption}>
        <Ground />
        <polygon points={cut(o)} fill={MATERIAL.oceanCrust} />
        {[0.88, 0.76, 0.64, 0.52, 0.4, 0.28].map((s) => (
          <polyline key={s} points={pts(o.map((p) => onLeft(p, s)))} fill="none" stroke={mix(MATERIAL.oceanCrust, MATERIAL.chalk, 0.45)} strokeWidth="1" />
        ))}
        <Chamber rx={42} ry={16} />
        <Conduit y={yTop} />
        <polygon points={skin(o)} fill={mix(MATERIAL.oceanCrust, MATERIAL.chalk, 0.3)} />
        <polygon points={silhouette(o)} {...OUTLINE} />
        <g data-part="flow">
          <polygon points={band(o, 16, 0, 3)} fill={MATERIAL.magma} className="mdl" style={{ animationName: 'mdl-fade-in', animationDuration: '8s' }} />
          <polyline points={pts(flank)} fill="none" stroke={MATERIAL.magma} strokeWidth="2.5" strokeDasharray="8 8" strokeLinecap="round" className="mdl" style={{ animationName: 'mdl-flow', animationDuration: '3s' }} />
          <polyline points={pts(flank.slice(0, 30))} fill="none" stroke={MATERIAL.magma} strokeWidth="2.5" strokeDasharray="8 8" strokeLinecap="round" className="mdl" style={{ animationName: 'mdl-flow', animationDuration: '3s', animationDelay: '-1s' }} />
        </g>
        <Label x={CX + 96} y={G - 10} lx={398} ly={112} part="flow" anchor="end">
          Lava flow
        </Label>
        <Label x={CX - 3} y={G - 12} lx={14} ly={84} part="conduit">
          Conduit
        </Label>
        <ChamberLabel ry={16} />
        <text x={286} y={254} fontSize={11} fill="currentColor" opacity={0.7}>
          Vertical scale ×3
        </text>
      </Svg>
    )
  },
}

const stratoShape = outline('strato', 110)
const strato: Variant = {
  id: 'strato',
  label: 'Stratovolcano',
  caption: 'Stiffer, gas-rich magma erupts in turns: a column of ash that settles on the slopes, then a short stubby flow that armours them. Alternating layers of ash and lava build a steep cone whose flank curves up to the summit.',
  parts: [
    { id: 'conduit', label: 'Conduit', text: 'The pipe from the chamber to the vent. Stiff magma rises through it slowly, holding its gas until the top.' },
    { id: 'chamber', label: 'Magma chamber', text: 'The reservoir of intermediate magma beneath the cone. It feeds both the ash eruptions and the flows.' },
    { id: 'ash', label: 'Ash column', text: 'The column of gas, ash and pumice driven up from the vent. The ash settles on the flanks as a loose layer.' },
    { id: 'flow', label: 'Lava flow', text: 'A short, thick lava flow. Stiffer lava stops before it reaches far, so the cone stays steep.' },
    { id: 'layers', label: 'Ash and lava layers', text: 'Alternating beds of ash and lava, each eruption adding a pair. Their stacking is what the name stratovolcano records.' },
  ],
  Scene: () => {
    const o = stratoShape
    const yTop = G - top(o)
    const crater = 4
    const column = `M${CX - 4} ${yTop} L${CX - 6} ${yTop - 36} Q${CX - 44} ${yTop - 44} ${CX - 38} ${yTop - 70} Q${CX - 26} ${yTop - 92} ${CX} ${yTop - 88} Q${CX + 26} ${yTop - 92} ${CX + 38} ${yTop - 70} Q${CX + 44} ${yTop - 44} ${CX + 6} ${yTop - 36} L${CX + 4} ${yTop} Z`
    return (
      <Svg caption={strato.caption}>
        <Ground />
        <g data-part="layers">
          <polygon points={cut(o, crater)} fill={MATERIAL.ash} />
          {[0.94, 0.8, 0.66, 0.52, 0.38].map((s) => (
            <polygon key={s} points={shell(o, s, s - 0.06)} fill={MATERIAL.oceanCrust} />
          ))}
        </g>
        <Chamber rx={42} ry={16} />
        <Conduit y={yTop + crater} />
        <polygon points={skin(o, crater)} fill={mix(MATERIAL.ash, MATERIAL.chalk, 0.3)} />
        <polygon points={silhouette(o, crater)} {...OUTLINE} />
        <g data-part="flow">
          <polygon points={band(o, 41, 22, 4)} fill={MATERIAL.magma} className="mdl" style={{ animationName: 'mdl-fade-in', animationDuration: '8s' }} />
        </g>
        <g data-part="ash" className="mdl" style={{ animationName: 'mdl-rise, mdl-fade-in', animationDuration: '8s, 8s' }}>
          <path d={column} fill={MATERIAL.ash} opacity={0.92} />
          <path d={column} {...OUTLINE} opacity={0.5} />
        </g>
        <Label x={CX + 38} y={yTop - 70} lx={398} ly={40} part="ash" anchor="end">
          Ash column
        </Label>
        <Label x={CX + 54} y={G - 20} lx={398} ly={104} part="flow" anchor="end">
          Lava flow
        </Label>
        <Label x={CX - 3} y={G - 24} lx={14} ly={58} part="conduit">
          Conduit
        </Label>
        <Label x={CX - 56} y={G - 12} lx={14} ly={84} part="layers">
          Layers
        </Label>
        <ChamberLabel ry={16} />
      </Svg>
    )
  },
}

const cinderShape = outline('cinder', 72)
const cinder: Variant = {
  id: 'cinder',
  label: 'Cinder cone',
  caption: 'Gas bursts throw clots of lava from a single vent. They cool in flight into scoria and fall back around the vent, piling as loose fragments at the angle of repose into a small cone with a crater at its top.',
  parts: [
    { id: 'conduit', label: 'Conduit', text: 'The single narrow vent the bursts come from. Everything the cone is made of was thrown out of it.' },
    { id: 'chamber', label: 'Magma chamber', text: 'A small body of gas-rich basalt beneath the vent. Cinder cones are short-lived, and most erupt only once.' },
    { id: 'ash', label: 'Scoria', text: 'Frothy fragments of lava that chilled in flight. Each falls close to the vent and comes to rest on the slope at the angle of repose.' },
    { id: 'rim', label: 'Crater rim', text: 'The crest around the crater, where the fragments land thickest. The crater inside it is the hollow above the vent.' },
  ],
  Scene: () => {
    const o = cinderShape
    const yTop = G - top(o)
    const crater = 7
    const rimX = o[N - 1]![0]
    const rest: Pt[] = [
      ...[44, 38, 31, 24, 16, 8].map((i) => onRight(o[i]!)),
      ...[41, 34, 27, 19, 11, 4].map((i) => onLeft(o[i]!)),
      [CX - 3, yTop + crater - 1],
      [CX + 3, yTop + crater - 2],
    ]
    return (
      <Svg caption={cinder.caption}>
        <Ground />
        <g data-part="ash">
          <polygon points={cut(o, crater)} fill={MATERIAL.ash} />
          <polygon points={cut(o, crater)} fill={hatch('vo', 'sandstone')} />
        </g>
        <Chamber rx={30} ry={12} />
        <Conduit y={yTop + crater} />
        <polygon points={skin(o, crater)} fill={mix(MATERIAL.ash, MATERIAL.chalk, 0.3)} />
        <polygon points={silhouette(o, crater)} {...OUTLINE} />
        <g data-part="rim">
          <line x1={CX - rimX - 6} y1={yTop + 3} x2={CX - rimX + 1} y2={yTop} stroke={MATERIAL.basement} strokeWidth="3" strokeLinecap="round" />
          <line x1={CX + rimX - 1} y1={yTop} x2={CX + rimX + 6} y2={yTop + 3} stroke={MATERIAL.basement} strokeWidth="3" strokeLinecap="round" />
        </g>
        <g data-part="ash">
          {rest.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y - 2.2} r={2.4} fill={MATERIAL.oceanCrust} stroke={MATERIAL.basement} strokeWidth="0.8" className="mdl" style={{ animationName: 'mdl-fall', animationDuration: '6s', animationDelay: `${-0.55 * i}s` }} />
          ))}
        </g>
        <Label x={CX + rimX + 4} y={yTop + 1} lx={398} ly={60} part="rim" anchor="end">
          Crater rim
        </Label>
        <Label x={CX + 52} y={G - 28} lx={398} ly={104} part="ash" anchor="end">
          Scoria
        </Label>
        <Label x={CX - 3} y={G - 20} lx={14} ly={70} part="conduit">
          Conduit
        </Label>
        <ChamberLabel ry={12} />
      </Svg>
    )
  },
}

const calderaShape = outline('caldera', 118)
const caldera: Variant = {
  id: 'caldera',
  label: 'Caldera',
  caption: 'A large eruption drains the magma chamber faster than it can refill. With nothing holding it up, the summit block above the chamber drops along ring faults, leaving a broad floor walled by the stump of the old cone.',
  parts: [
    { id: 'conduit', label: 'Conduit', text: 'The feeder that carried the eruption. After the collapse it is buried under the floor, and later vents open along the ring faults.' },
    { id: 'chamber', label: 'Magma chamber', text: 'The reservoir that empties during the eruption. As it drains, its roof loses its support.' },
    { id: 'rim', label: 'Caldera rim', text: 'The steep wall left standing around the depression. It is the stump of the cone that stood before the collapse.' },
    { id: 'floor', label: 'Floor', text: 'The block of the old summit that dropped into the emptied chamber. It settles as a broad flat floor, often later filled by a lake or new vents.' },
  ],
  Scene: () => {
    const o = calderaShape
    const yTop = G - top(o)
    const rimX = o[N - 1]![0]
    const ry = 14
    const yRimBase = G - o[Math.floor(N * 0.75)]![1]
    // The block that drops: the summit between the ring faults, down to a little below the ground surface.
    const yBlock = G + 10
    return (
      <Svg caption={caldera.caption}>
        <Ground />
        <g>
          <polygon points={cut(o)} fill={MATERIAL.ash} />
          {[0.94, 0.8, 0.66, 0.52].map((s) => (
            <polygon key={s} points={shell(o, s, s - 0.06)} fill={MATERIAL.oceanCrust} />
          ))}
        </g>
        <polygon points={skin(o)} fill={mix(MATERIAL.debris, MATERIAL.chalk, 0.3)} />
        <polygon points={silhouette(o)} {...OUTLINE} />
        <Conduit y={yTop + 4} />
        <rect x={CX - rimX} y={yTop} width={2 * rimX} height={14} fill={mix(MATERIAL.debris, MATERIAL.basement, 0.4)} />
        <Chamber rx={52} ry={ry}>
          <ellipse cx={CX} cy={CHAMBER_Y} rx={52} ry={ry} fill={MATERIAL.magma} className="mdl mdl-shrink" style={{ animationName: 'mdl-shrink', animationDuration: '10s' }} />
        </Chamber>
        <g data-part="floor" className="mdl" style={{ animationName: 'mdl-sink', animationDuration: '10s' }}>
          <rect x={CX - rimX} y={yTop} width={2 * rimX} height={yBlock - yTop} fill={MATERIAL.debris} />
          <rect x={CX - rimX} y={yTop} width={2 * rimX} height={yBlock - yTop} fill={hatch('vo', 'sandstone')} />
          <rect x={CX - rimX} y={yTop} width={2 * rimX} height={yBlock - yTop} {...OUTLINE} />
          <g data-part="conduit">
            <rect x={CX - 2.5} y={yTop + 4} width={5} height={yBlock - yTop - 4} fill={MATERIAL.magma} />
          </g>
        </g>
        <g data-part="rim">
          <line x1={CX - rimX} y1={yRimBase + 2} x2={CX - rimX} y2={yTop - 1} stroke={MATERIAL.basement} strokeWidth="3" strokeLinecap="round" />
          <line x1={CX + rimX} y1={yRimBase + 2} x2={CX + rimX} y2={yTop - 1} stroke={MATERIAL.basement} strokeWidth="3" strokeLinecap="round" />
        </g>
        <Arrow d={arrow(CX - 26, yTop - 24, CX - 26, yTop - 6)} />
        <Arrow d={arrow(CX + 26, yTop - 24, CX + 26, yTop - 6)} />
        <Label x={CX + rimX + 1} y={yTop + 2} lx={398} ly={60} part="rim" anchor="end">
          Caldera rim
        </Label>
        <Label x={CX - 36} y={yTop + 12} lx={14} ly={58} part="floor">
          Floor
        </Label>
        <Label x={CX - 3} y={G - 10} lx={14} ly={84} part="conduit">
          Conduit
        </Label>
        <ChamberLabel ry={ry} />
      </Svg>
    )
  },
}

export const VARIANTS: Variant[] = [shield, strato, cinder, caldera]

/** The volcano models: four cut-away profiles that loop, and beneath them a model of the same shape to turn. */
export const Model = () => <ModelTab lead="Each volcano shape cut open: the right half is the outer skin, the left half shows the conduit, the chamber and the layers inside. Tap a part of the drawing, or a chip, for what it is. The model beneath is the same shape; drag to turn it." variants={VARIANTS} Aside={VolcanoTurntable} />