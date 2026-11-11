# Models spec — looping block diagrams

Decided with the owner 2026-11-10. Goal: each process topic gets a "Model" tab beside Learn, Explore, Lab and
Self-check: a drawn block diagram or cross-section that loops on its own, showing flow and movement directions,
with a caption and labelled parts the learner can tap for a sentence about that part. Owner's words: "a simple
repeating animation showing flow and movement directions"; "the volcanoes should have a profile and a model they
can observe"; rolled into the existing topics, not topics of their own.

## Goals, non-goals, anti-goals

- Goals: the process is visible at a glance; the motion directions are unambiguous; every part the drawing names can
  be tapped for one plain sentence; works offline and on a phone; draws in the brand's illustration style.
- Non-goals: learner-manipulated physics (the sims on Explore do that); photo-realism; sound; copying any reference
  image (the owner's references are stock and encyclopaedia art and only supplied the ideas).
- Anti-goals: hand-written descriptions of real places or events (CLAUDE.md), words that interpret hazard or risk
  (`src/app/weeks/captions.test.ts` already greps for them), a chart library or an animation library.

## What a model is

A **model** is one tab's content: a short lead sentence, a row of variant buttons when there is more than one
variant, the drawing, a caption for the current variant, and the variant's parts as a row of chips. Tapping a chip
(or the matching part of the drawing) highlights the part and replaces the caption with that part's sentence; tapping
again, or choosing another variant, restores the caption.

A **variant** is one drawing: `{ id, label, caption, parts: { id, label, text }[], Scene }`. `Scene` is a React
component that returns an `<svg>`; every tappable region in it carries `data-part="<part id>"`, and the shared
component sets `data-selected` on the svg root so CSS can dim the rest. The scene loops on its own with CSS
`@keyframes`; it takes no props except `selected` (the part id or null), so the whole table of variants is plain data
that a test can read.

## Drawing style

Follows docs/BRAND.md "Illustration style" and `brand/illustration/stratalab-hero-block-light.svg`: cabinet
projection with depth going up-right at (0.62, −0.36) per unit, flat lithology fills with hatching on front faces,
side faces mixed 22 % toward Basement, top faces mixed 42 % toward Chalk, 1.6-unit Basement outlines at 90 %
opacity, Magma for magma and intrusions, Shale-deep for slickenlines. Materials beyond the five beds are fixed
constants in `draw.ts`, the same in every topic, all mixes of brand colours except water: continental crust and
lithosphere Sandstone (dots), oceanic crust Shale-deep, asthenosphere and mantle Mudstone with Magma 30 % toward the
base, magma Magma, soil Sandstone mixed 55 % toward Basement, ash, tephra and scoria Slate mixed 35 % toward Chalk,
debris and till Sandstone mixed 30 % toward Basement, limestone Limestone (brick), vegetation Greensand, ice Chalk
with Shale-deep ticks, water `#5B8FBF` (a constant, not a brand token; the owner can promote it), air transparent.
Fills are hex constants that do not change in dark mode, as the hero SVG does; text uses `currentColor`.

Shared helpers in `src/app/models/draw.ts` give a scene its pieces: `block(x, y, w, h, d)` returning the three face
paths of a slab, `bedsClip`, `patterns()` (the four hatch patterns once per svg, ids prefixed per scene to avoid
clashes), `arrow(from, to)` and `halfArrow` for motion, and the colour mixes. Scenes are hand-placed with these
helpers; there is no scene graph. Every svg has `viewBox="0 0 400 260"`, scales to its container, and carries
`role="img"` with an `aria-label` equal to the variant caption.

Labels: short text with a leader line drawn in the svg for the parts that need pointing at (as the brand's
labelled hero block does), `font-size` 11 in viewBox units, `fill="currentColor"`, placed with the `label()` helper;
each label carries the part's `data-part` so it is tappable too. The chips remain the keyboard route.

Animation: CSS keyframes in `src/app/models/models.css`, named per effect (`mdl-drift-right`, `mdl-rise`,
`mdl-flow` on `stroke-dashoffset`, `mdl-pulse`), applied by class; every animated element also carries the shared
`mdl` class, which sets `animation-fill-mode: forwards`. Two kinds of loop: a **steady** loop (plates drifting,
mantle cells, stream flow) ends where it starts and cycles seamlessly; a **before-to-after** loop (fault offset,
cliff retreat, caldera collapse) runs to its end state by the 80 % keyframe, holds it to 100 %, then cuts back to
the start. "Offsets a little further each cycle" means within one cycle, not across cycles; no JavaScript timing.
Loops are 6 to 12 s. **Every loop's 100 % keyframe is a sensible end state**, because the app's reduced-motion rule
(`[data-reduced-motion='true']` in src/index.css) runs each animation once in 0.01 ms; with `forwards` it leaves the
element on its last keyframe, so with motion off the learner sees the "after" picture. Parts stay tappable with
motion off.

## The models

| Topic (folder) | Variants | What loops | Tappable parts |
| --- | --- | --- | --- |
| Plate tectonics (week08) | Divergent; Convergent, subduction; Convergent, collision; Transform | Plates drift in their arrow directions; mantle cells turn beneath; at a ridge new crust fills the gap and the rift floor drops; at subduction the slab bends down and a volcano grows on the overriding plate; at collision the crust thickens and a mountain range rises; at a transform the two blocks slide past with a stream offset | lithosphere, asthenosphere, mantle flow, ridge / trench / fault, magma, volcano, mountains |
| Earthquakes and Earth's interior (week09) | Normal; Reverse (thrust); Strike-slip | Two blocks with a fault plane; the marker bed offsets a little further each cycle and resets; half-arrows on both walls; hanging wall and footwall labelled where the fault dips | hanging wall, footwall, fault plane, marker bed, slip direction |
| Volcanoes (week05) | Shield; Stratovolcano; Cinder cone; Caldera | Cut-away profile: shield pours thin lava flows down a gentle slope; stratovolcano alternates an ash column with a short stubby flow, building layers; cinder cone showers scoria that piles to the angle of repose; caldera empties its chamber and the summit collapses into it. Beside the profile, a turntable model of the edifice built from the same profile curve | conduit, magma chamber, lava flow, ash / tephra, layers, crater / caldera rim |
| Streams and floods (week13) | Stream zones; Dendritic; Rectangular; Radial; Trellis | Zones: the three-step staircase from a V-shaped headwater valley to a meandering floodplain and delta, water running the whole way (dash flow), a meander bend creeping outward. Patterns: a block with the channel network drawn and flow pulsing down it; rectangular on jointed rock, radial on a cone, trellis on folded ridges | headwaters, transfer zone, floodplain, delta, meander, channel pattern, joints / ridges |
| Groundwater and karst (week14) | Artesian cross-section; Infiltration zones; Karst | Cross-section: rain at the high end, water soaks through the unsaturated zone, the water table rises then settles, flow moves down-gradient; three wells: a water-table well filled to the table, a non-flowing artesian well with water standing above the aquifer, a flowing artesian well fountaining because the potentiometric surface sits above the ground. Zones: topsoil, unsaturated zone, water table, saturated zone, with infiltration arrows and underground flow. Karst: a limestone block with sinkholes, a stream sinking and reappearing as a spring, and a cave at the water table carrying water | water table, unconfined aquifer, confining layer, confined aquifer, potentiometric surface, each well, recharge; sinkhole, cave, spring, sinking stream |
| Glaciers, deserts, coasts (week15) | River valley; Waves and cliffs; Wind; Glacier; Landslide | Each a before-to-after loop: a river deepens and widens its valley; waves cut a cliff back and leave a stack; wind strips topsoil and the fence posts stand higher; a glacier drags boulders and leaves a moraine; a slope fails and its debris spreads at the toe | the agent (river, waves, wind, ice, gravity), what it removes, where it leaves it |

Faults sit in Earthquakes rather than Structural geology because the latter is optional and every learner should
meet faults (owner's call delegated; easy to move). The erosion set stays together in week 15 even though the
landslide also belongs to week 16.

The volcano turntable is the one use of Three.js and a special case of week05's model, not of the shared
component: `ModelTab` takes an optional `Aside` component rendered under the drawing with the current variant id,
and week05 passes `src/app/models/VolcanoTurntable.tsx`, lazy-loaded like `CrystalViewer` (settled(), Suspense, a
static placeholder until the chunk lands; tests never render it), a `LatheGeometry` from the same profile curve the
SVG draws, flat-shaded in the brand colours, slowly rotating unless reduced motion, orbitable by
drag. The profile curves are pure functions in `src/engine/volcano/shape.ts` (radius against height for the four
types, from the ratios the textbook gives: shield slopes 2 to 10°, stratovolcano 30° near the top, cinder cone at
the 30 to 35° angle of repose, caldera a stratovolcano with its top replaced by a floor).

## Where it plugs in

- `WeekContent.Model?: ComponentType` in `src/app/week/WeekPage.tsx`; the tab list gains `{ tab: 'model', label:
  'Model' }`, shown only when the topic exports `Model`, rendered inside a `Suspense`. A topic folder gets
  `Model.tsx` exporting `Model` (the shared `ModelTab` with that topic's variants) and `VARIANTS` for tests;
  `index.ts` exports `Model` as `lazy(() => import('./Model'))` so the scenes stay out of the main chunk (the week
  folders themselves are imported statically by WeekPage today).
- Shared: `src/app/models/ModelTab.tsx` (the tab layout and part selection), `draw.ts` (helpers), `models.css`
  (keyframes, imported once by ModelTab), `VolcanoTurntable.tsx`.
- Learn text for each of the six topics gains one sentence pointing at the Model tab.
- docs/WEEK-PLANS.md entries for the six topics note the model; CHANGELOG.md; HANDOFF.md.

## Captions and parts text

Plain textbook register (docs/BRAND.md voice). One or two sentences each, generic, no named places, no numbers
without units. The caption says what moves and why; a part's sentence says what the part is and what it does in
this loop. The `captions.test.ts` forbidden-word grep is extended to cover every model caption and part text.

## Acceptance tests

- `npm test` passes; new: every topic's `VARIANTS` have unique ids, every part id referenced by a scene's
  `data-part` exists in its parts table and the other way round (render each scene with `renderToStaticMarkup` and
  grep), every svg carries `role="img"` and an `aria-label`; the forbidden-word grep over captions and parts; the
  volcano profile curves are monotone in radius and reach the stated slopes.
- `npm run smoke` on `/#/topic/<slug>/model` for the six topics: no console errors, a screenshot per route checked by
  eye for the drawing style, legible labels at 412 px width, and arrows pointing the right way.
- Reduced motion on (Settings): each model shows a sensible end state with its parts still tappable.
- Lighthouse on `/#/topic/plate-tectonics/model` performance 80 or more; the model chunks stay out of the main bundle
  (each topic's Model is its own lazy chunk; the shared ModelTab and draw.ts become a chunk Vite splits out).

## Out of scope

Learner-driven parameters (those stay in the Explore sims), 3D for anything but the volcano, sound, exporting a
drawing, the Moon and Mars, and any model for topics other than the six above (the pattern makes adding one a
single file).
