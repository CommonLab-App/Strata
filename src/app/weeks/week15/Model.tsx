import type { ReactNode } from 'react'
import { arrow, block, hatch, Label, MATERIAL, mix, OUTLINE, Patterns } from '@/app/models/draw'
import { ModelTab, type Variant } from '@/app/models/ModelTab'

/*
 * Five agents of erosion as before-to-after loops (docs/specs/models.md): each runs from the start of the process
 * to its end state over 10 s, holds it, and cuts back. One slab of bedrock in cabinet projection per scene; what
 * the agent takes away and where it leaves it are the tappable parts.
 */

const LOOP = { animationDuration: '10s' } as const
const SEC = (s: number) => ({ animationDuration: `${s}s` }) as const

const Svg = ({ caption, children }: { caption: string; children: ReactNode }) => (
  <svg viewBox="0 0 400 260" role="img" aria-label={caption}>
    <Patterns prefix="er" />
    {children}
  </svg>
)

/** A bedrock slab: front face hatched, top lighter, side darker, every face outlined. */
const Slab = ({ x, y, w, h, d, fill = MATERIAL.crust, hatched = true }: { x: number; y: number; w: number; h: number; d: number; fill?: string; hatched?: boolean }) => {
  const p = block(x, y, w, h, d)
  return (
    <g>
      <polygon points={p.front} fill={fill} />
      {hatched && <polygon points={p.front} fill={hatch('er', 'sandstone')} />}
      <polygon points={p.top} fill={p.topFill(fill)} />
      <polygon points={p.side} fill={p.sideFill(fill)} />
      <polygon points={p.front} {...OUTLINE} />
      <polygon points={p.top} {...OUTLINE} />
      <polygon points={p.side} {...OUTLINE} />
    </g>
  )
}

const Motion = ({ d, width = 2.4 }: { d: string; width?: number }) => <path d={d} fill={MATERIAL.basement} stroke={MATERIAL.basement} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />

const faces = block(0, 0, 1, 1, 1)
const CRUST_TOP = faces.topFill(MATERIAL.crust)
const CRUST_SIDE = faces.sideFill(MATERIAL.crust)

/* River: a V-shaped trough cut into the slab, running out of the block toward the viewer. The whole trough
   scales down from its back edge, so it starts as a shallow channel on the top face and ends as a deep valley. */
const river: Variant = {
  id: 'river',
  label: 'River cutting a valley',
  caption: 'A river cuts down into its bed while the valley walls above it wear back, so the valley deepens and widens with time. Sediment the river cannot carry settles on the valley floor as a floodplain.',
  parts: [
    { id: 'agent', label: 'River', text: 'The flowing water, with the sand and gravel it drags along, grinds and plucks at the bed and carries the loosened rock downstream.' },
    { id: 'removed', label: 'Valley walls', text: 'The rock cut away from either side of the channel. As the river deepens its bed the walls grow steeper, slump, and are carried off in turn.' },
    { id: 'deposit', label: 'Floodplain', text: 'The flat valley floor built from sediment the river drops when it spills over its banks.' },
  ],
  Scene: () => {
    const left = '96,120 128,185 159,167 127,102'
    const right = '176,120 144,185 175,167 207,102'
    const floor = '128,185 144,185 175,167 159,167'
    return (
      <Svg caption={river.caption}>
        <Slab x={10} y={120} w={252} h={110} d={50} />
        <g className="mdl mdl-grow-down" style={{ ...LOOP, animationName: 'mdl-grow' }}>
          <g data-part="removed">
            <polygon points={left} fill={CRUST_SIDE} />
            <polygon points={right} fill={mix(CRUST_TOP, MATERIAL.basement, 0.08)} />
            <polygon points={left} {...OUTLINE} />
            <polygon points={right} {...OUTLINE} />
          </g>
          <g data-part="deposit">
            <polygon points={floor} fill={MATERIAL.debris} />
            <polygon points={floor} {...OUTLINE} />
          </g>
          <path d="M167 167 L136 185" fill="none" stroke={MATERIAL.water} strokeWidth="4" strokeLinecap="round" strokeDasharray="6 6" className="mdl" style={{ ...SEC(3), animationName: 'mdl-flow' }} data-part="agent" />
        </g>
        <Motion d={arrow(214, 96, 196, 106)} />
        <Label x={112} y={150} lx={30} ly={50} part="removed">
          Valley walls, cut back
        </Label>
        <Label x={136} y={186} lx={136} ly={252} part="agent" anchor="middle">
          River, flowing out toward you
        </Label>
        <Label x={160} y={176} lx={398} ly={176} part="deposit" anchor="end">
          Floodplain
        </Label>
      </Svg>
    )
  },
}

/* Waves: the sea on the left, a cliffed slab on the right. The front slice of the cliff slides under the rest of
   the block and fades, so the cliff face steps back; a stack is left in the sea and a beach gathers at the foot. */
const waves: Variant = {
  id: 'waves',
  label: 'Waves cutting a cliff',
  caption: 'Waves break against the base of a cliff and undercut it, so the face collapses and the cliff retreats inland. A harder part of the cliff is left standing in the sea as a stack, and the broken rock gathers at the cliff foot as a beach.',
  parts: [
    { id: 'agent', label: 'Waves', text: 'Breaking waves hurl water, sand and pebbles at the base of the cliff and pry at its cracks. Their work is concentrated in a narrow band at sea level.' },
    { id: 'removed', label: 'Cliff face', text: 'The slice of rock undercut by the waves. Once its base is cut away it falls, and the cliff face now stands a little further inland.' },
    { id: 'stack', label: 'Stack', text: 'A pillar of more resistant rock left standing in the sea where the cliff once stood. The retreating cliff has left it behind.' },
    { id: 'deposit', label: 'Beach', text: 'The fallen rock, broken and rounded by the waves, piled at the foot of the cliff. In time the waves wear it down and carry it along the shore.' },
  ],
  Scene: () => {
    const sea = block(10, 180, 156, 50, 50)
    const slice = block(150, 110, 16, 120, 50)
    return (
      <Svg caption={waves.caption}>
        <polygon points={sea.front} fill={MATERIAL.water} />
        <polygon points={sea.top} fill={sea.topFill(MATERIAL.water)} />
        <polygon points={sea.top} {...OUTLINE} />
        <polygon points="90,205 166,205 166,230 90,230" fill={MATERIAL.crust} />
        <polygon points="90,205 166,205 166,230 90,230" fill={hatch('er', 'sandstone')} />
        <polygon points="90,205 166,205 166,230 90,230" {...OUTLINE} />
        <g data-part="stack">
          <polygon points="112,126 128,126 128,205 112,205" fill={MATERIAL.crust} />
          <polygon points="112,126 128,126 128,205 112,205" fill={hatch('er', 'sandstone')} />
          <polygon points="112,126 128,126 128,205 112,205" {...OUTLINE} />
          <line x1={112} y1={180} x2={128} y2={180} stroke={MATERIAL.water} strokeWidth="2" />
        </g>
        <g data-part="agent" className="mdl" style={{ ...SEC(3), animationName: 'mdl-drift-right' }}>
          <Motion d={arrow(24, 192, 66, 192)} />
          <Motion d={arrow(24, 214, 66, 214)} />
        </g>
        <polygon points={sea.front} {...OUTLINE} />
        <g data-part="removed" className="mdl" style={{ ...LOOP, animationName: 'mdl-shift-right' }}>
          <g className="mdl" style={{ ...LOOP, animationName: 'mdl-fade-out' }}>
            <polygon points={slice.front} fill={MATERIAL.crust} />
            <polygon points={slice.front} fill={hatch('er', 'sandstone')} />
            <polygon points={slice.top} fill={slice.topFill(MATERIAL.crust)} />
            <polygon points={slice.front} {...OUTLINE} />
            <polygon points={slice.top} {...OUTLINE} />
          </g>
        </g>
        <Slab x={166} y={110} w={96} h={120} d={50} />
        <g data-part="deposit" className="mdl" style={{ ...LOOP, animationName: 'mdl-fade-in' }}>
          <polygon points="146,205 166,205 166,194" fill={MATERIAL.debris} />
          <polygon points="146,205 166,205 166,194" {...OUTLINE} />
        </g>
        <Label x={45} y={220} lx={45} ly={252} part="agent" anchor="middle">
          Waves
        </Label>
        <Label x={164} y={150} lx={158} ly={50} part="removed" anchor="middle">
          Cliff face, cut back
        </Label>
        <Label x={118} y={126} lx={40} ly={100} part="stack">
          Stack
        </Label>
        <Label x={156} y={203} lx={230} ly={252} part="deposit">
          Beach at the cliff foot
        </Label>
      </Svg>
    )
  },
}

/* Wind: a thin layer of topsoil on bedrock. The soil's front face shrinks toward its base while its top and side
   faces sink by the same amount, so the surface lowers and the fence posts, drawn behind the front face, show more. */
const wind: Variant = {
  id: 'wind',
  label: 'Wind stripping soil',
  caption: 'Wind lifts the finest grains from bare, dry ground and carries them away, so the topsoil thins while the fence posts stay where they were set. The sand drops again downwind and piles into dunes.',
  parts: [
    { id: 'agent', label: 'Wind', text: 'Moving air strong enough to lift dust and bounce sand along the surface. It takes only the fine, loose grains and leaves pebbles behind.' },
    { id: 'removed', label: 'Topsoil', text: 'The loose, dry surface layer being blown away grain by grain. Without plant roots to hold it the layer thins a little with every storm.' },
    { id: 'posts', label: 'Fence posts', text: 'Fixed markers set into the ground before the wind began its work. As the soil around them lowers, more of each post stands clear.' },
    { id: 'deposit', label: 'Dunes', text: 'Mounds of sand piled where the wind slows. Each has a gentle windward slope and a steep slip face on its downwind side.' },
  ],
  Scene: () => {
    const soil = block(10, 136, 252, 14, 50)
    const bed = block(10, 150, 252, 80, 50)
    const post = (x: number) => <rect x={x} y={96} width={5} height={54} fill={MATERIAL.basement} opacity="0.8" />
    return (
      <Svg caption={wind.caption}>
        <g data-part="removed" className="mdl" style={{ ...LOOP, animationName: 'mdl-sink' }}>
          <polygon points={soil.side} fill={soil.sideFill(MATERIAL.soil)} />
          <polygon points={soil.side} {...OUTLINE} />
        </g>
        <polygon points={bed.side} fill={bed.sideFill(MATERIAL.crust)} />
        <polygon points={bed.side} {...OUTLINE} />
        <polygon points={bed.front} fill={MATERIAL.crust} />
        <polygon points={bed.front} fill={hatch('er', 'sandstone')} />
        <polygon points={bed.front} {...OUTLINE} />
        <polygon points={bed.top} fill={bed.topFill(MATERIAL.crust)} />
        <g data-part="removed" className="mdl" style={{ ...LOOP, animationName: 'mdl-sink' }}>
          <polygon points={soil.top} fill={soil.topFill(MATERIAL.soil)} />
          <polygon points={soil.top} {...OUTLINE} />
          <g data-part="deposit" className="mdl mdl-grow" style={{ ...LOOP, animationName: 'mdl-grow' }}>
            <polygon points="218,136 238,124 246,136" fill={MATERIAL.sandstone} />
            <polygon points="218,136 238,124 246,136" {...OUTLINE} />
            <polygon points="242,136 256,128 262,136" fill={MATERIAL.sandstone} />
            <polygon points="242,136 256,128 262,136" {...OUTLINE} />
          </g>
        </g>
        <g data-part="posts">
          {post(80)}
          {post(170)}
          <line x1={85} y1={104} x2={170} y2={104} stroke={MATERIAL.basement} strokeWidth="1.2" opacity="0.8" />
          <line x1={85} y1={114} x2={170} y2={114} stroke={MATERIAL.basement} strokeWidth="1.2" opacity="0.8" />
        </g>
        <g data-part="removed" className="mdl mdl-shrink" style={{ ...LOOP, animationName: 'mdl-shrink' }}>
          <polygon points={soil.front} fill={MATERIAL.soil} />
          <polygon points={soil.front} {...OUTLINE} />
        </g>
        <g data-part="agent">
          <Motion d={arrow(20, 70, 86, 70)} width={3} />
          <g className="mdl" style={{ ...SEC(3), animationName: 'mdl-drift-right' }}>
            <g className="mdl" style={{ ...SEC(2), animationName: 'mdl-pulse' }} stroke={MATERIAL.soil} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="4 5">
              <line x1={100} y1={92} x2={134} y2={88} />
              <line x1={118} y1={118} x2={152} y2={114} />
              <line x1={192} y1={110} x2={226} y2={106} />
              <line x1={206} y1={120} x2={236} y2={118} />
            </g>
          </g>
        </g>
        <Label x={86} y={70} lx={96} ly={70} part="agent">
          Wind
        </Label>
        <Label x={40} y={146} lx={40} ly={252} part="removed">
          Topsoil, thinning
        </Label>
        <Label x={173} y={98} lx={250} ly={60} part="posts">
          Fence posts
        </Label>
        <Label x={238} y={133} lx={398} ly={100} part="deposit" anchor="end">
          Dunes downwind
        </Label>
      </Svg>
    )
  },
}

/* Glacier: a tongue of ice on the valley floor, clipped to the top face, sliding to the right with its load of
   boulders. A moraine ridge grows at the toe and an outwash apron appears beyond it. */
const glacier: Variant = {
  id: 'glacier',
  label: 'Glacier moving rock',
  caption: 'A glacier flows slowly down its valley under its own weight, plucking rock from its bed and carrying it along inside the ice. Where the ice melts at its toe the rock is dropped as a ridge of moraine.',
  parts: [
    { id: 'agent', label: 'Ice', text: 'The glacier, a river of ice moving a few metres a year. It freezes onto loose rock, tears it free, and grinds the bed with the rock it carries.' },
    { id: 'removed', label: 'Boulders in the ice', text: 'Rock plucked from the valley floor and walls and carried along within the ice. The pieces stay angular and unsorted, large and small together.' },
    { id: 'moraine', label: 'Moraine', text: 'The ridge of debris dropped where the ice melts at the toe of the glacier. It marks the furthest point the ice has reached.' },
    { id: 'deposit', label: 'Outwash', text: 'Sand and gravel washed out from under the ice by meltwater and spread beyond the moraine, sorted by the water that carried it.' },
  ],
  Scene: () => {
    const bed = block(10, 150, 252, 80, 80)
    const ice = 'M-30 148 L20 123 L204 123 Q224 123 232 133 Q232 142 220 147 L190 148 Z'
    const moraine = '216,150 234,132 252,150'
    const outwash = '250,150 262,150 296,130 276,130'
    return (
      <Svg caption={glacier.caption}>
        <defs>
          <clipPath id="er-valley">
            <polygon points={bed.top} />
          </clipPath>
        </defs>
        <Slab x={10} y={150} w={252} h={80} d={80} />
        <polygon points="59.6,121.2 72,100 118,90 172,102 226,88 280,96 311.6,121.2" fill={MATERIAL.crust} />
        <polygon points="59.6,121.2 72,100 118,90 172,102 226,88 280,96 311.6,121.2" fill={hatch('er', 'sandstone')} />
        <polygon points="59.6,121.2 72,100 118,90 172,102 226,88 280,96 311.6,121.2" {...OUTLINE} />
        <g clipPath="url(#er-valley)">
          <g data-part="agent" className="mdl" style={{ ...LOOP, animationName: 'mdl-shift-right' }}>
            <path d={ice} fill={MATERIAL.ice} />
            <path d={ice} {...OUTLINE} />
            <g stroke={MATERIAL.shaleDeep} strokeWidth="1.2" strokeLinecap="round">
              <path d="M40 132 l6 -3 M70 142 l6 -3 M96 128 l6 -3 M124 140 l6 -3 M150 130 l6 -3 M178 143 l6 -3 M200 130 l6 -3 M214 140 l6 -3" />
            </g>
            <Motion d={arrow(60, 136, 120, 136)} />
            <g data-part="removed" fill={MATERIAL.debris} stroke={MATERIAL.basement} strokeWidth="0.8">
              <circle cx={84} cy={129} r={3} />
              <circle cx={108} cy={142} r={2.5} />
              <circle cx={140} cy={135} r={3.2} />
              <circle cx={166} cy={128} r={2.4} />
              <circle cx={190} cy={139} r={3} />
              <circle cx={212} cy={130} r={2.6} />
            </g>
          </g>
        </g>
        <g data-part="deposit" className="mdl" style={{ ...LOOP, animationName: 'mdl-fade-in' }}>
          <polygon points={outwash} fill={MATERIAL.debris} />
          <polygon points={outwash} fill={hatch('er', 'sandstone')} />
          <polygon points={outwash} {...OUTLINE} />
        </g>
        <g data-part="moraine" className="mdl mdl-grow" style={{ ...LOOP, animationName: 'mdl-grow' }}>
          <polygon points={moraine} fill={MATERIAL.debris} />
          <polygon points={moraine} {...OUTLINE} />
        </g>
        <Label x={100} y={126} lx={100} ly={60} part="agent" anchor="middle">
          Ice, flowing down-valley
        </Label>
        <Label x={108} y={144} lx={60} ly={252} part="removed">
          Boulders carried in the ice
        </Label>
        <Label x={234} y={134} lx={398} ly={110} part="moraine" anchor="end">
          Moraine
        </Label>
        <Label x={284} y={132} lx={398} ly={160} part="deposit" anchor="end">
          Outwash
        </Label>
      </Svg>
    )
  },
}

/* Landslide: a plateau with a steep slope down to a flat foot. A lens of rock and soil slides down and out along a
   curved surface (sink on the outer group, shift on the inner), exposing the scarp; a debris fan grows at the foot. */
const landslide: Variant = {
  id: 'landslide',
  label: 'Landslide',
  caption: 'Gravity pulls on every slope, and when a slope is steep or wet enough a mass of rock and soil breaks loose along a curved surface and slides down. It leaves a bare scarp behind and spreads into a fan of debris at the foot of the slope.',
  parts: [
    { id: 'agent', label: 'Gravity', text: 'The downward pull on the slope material. It is always there; the slide happens when water, undercutting or shaking makes the slope too weak to resist it.' },
    { id: 'removed', label: 'Sliding mass', text: 'The block of rock and soil that broke loose. It moves down and out along a spoon-shaped surface, rotating a little as it goes.' },
    { id: 'scarp', label: 'Scarp', text: 'The steep, bare surface left where the mass pulled away from the slope. It is the upper end of the surface the mass slid on.' },
    { id: 'deposit', label: 'Debris fan', text: 'The broken material spread across the foot of the slope. It comes to rest as a lobe of jumbled rock and soil.' },
  ],
  Scene: () => {
    const front = '10,100 110,100 220,200 262,200 262,230 10,230'
    const plateau = '10,100 110,100 141,82 41,82'
    const slope = '110,100 220,200 251,182 141,82'
    const foot = '220,200 262,200 293,182 251,182'
    const side = '262,200 293,182 293,212 262,230'
    const lens = 'M125 114 Q152 188 210 191 Z'
    const strip = '125,114 210,191 241,173 156,96'
    const fan = '200,200 232,184 262,200'
    return (
      <Svg caption={landslide.caption}>
        <polygon points={front} fill={MATERIAL.crust} />
        <polygon points={front} fill={hatch('er', 'sandstone')} />
        <polygon points={plateau} fill={CRUST_TOP} />
        <polygon points={slope} fill={mix(CRUST_TOP, MATERIAL.basement, 0.08)} />
        <polygon points={foot} fill={CRUST_TOP} />
        <polygon points={side} fill={CRUST_SIDE} />
        <polygon points={front} {...OUTLINE} />
        <polygon points={plateau} {...OUTLINE} />
        <polygon points={slope} {...OUTLINE} />
        <polygon points={foot} {...OUTLINE} />
        <polygon points={side} {...OUTLINE} />
        <g data-part="scarp">
          <path d={lens} fill={CRUST_SIDE} />
          <path d={lens} {...OUTLINE} />
        </g>
        <g data-part="removed" className="mdl" style={{ ...LOOP, animationName: 'mdl-sink' }}>
          <g className="mdl" style={{ ...LOOP, animationName: 'mdl-shift-right' }}>
            <polygon points={strip} fill={mix(CRUST_TOP, MATERIAL.basement, 0.08)} />
            <polygon points={strip} {...OUTLINE} />
            <path d={lens} fill={MATERIAL.crust} />
            <path d={lens} fill={hatch('er', 'sandstone')} />
            <path d={lens} {...OUTLINE} />
            <Motion d={arrow(150, 136, 184, 166)} />
          </g>
        </g>
        <g data-part="deposit" className="mdl mdl-grow" style={{ ...LOOP, animationName: 'mdl-grow' }}>
          <polygon points={fan} fill={MATERIAL.debris} />
          <polygon points={fan} {...OUTLINE} />
        </g>
        <g data-part="agent">
          <Motion d={arrow(356, 74, 356, 130)} width={3} />
        </g>
        <Label x={356} y={70} lx={356} ly={50} part="agent" anchor="middle">
          Gravity
        </Label>
        <Label x={136} y={128} lx={60} ly={50} part="scarp">
          Scarp
        </Label>
        <Label x={200} y={184} lx={250} ly={120} part="removed">
          Sliding mass
        </Label>
        <Label x={236} y={192} lx={398} ly={240} part="deposit" anchor="end">
          Debris fan
        </Label>
      </Svg>
    )
  },
}

export const VARIANTS: Variant[] = [river, waves, wind, glacier, landslide]

/** The erosion models: five agents, each as a before-and-after loop that holds its end state. */
export const Model = () => <ModelTab lead="Five agents of erosion, each as a before-and-after loop: the drawing runs from the start of the process to its end state, holds it, and begins again. Tap a part of the drawing, or a chip, for what it is." variants={VARIANTS} />
