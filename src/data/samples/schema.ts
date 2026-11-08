import { z } from 'zod'

/**
 * The sample library: what the inspectors show and the identification labs draw from. Values, not prose: every
 * entry carries the references its values were read from. `core` marks the intro-lab set the labs draw from;
 * everything else is extra reading. A specimen is one physical sample we hold (a turntable video); the answer to
 * an unknown is always the species.
 */
export const range = z.tuple([z.number(), z.number()]).refine(([a, b]) => a <= b, 'range must be [min, max]')

export const specimenSchema = z.object({
  /** Stable, kebab-case; the folder under public/media/samples/. */
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  label: z.string().optional(),
  turntable: z.object({ file: z.string(), poster: z.string(), seconds: z.number() }).optional(),
})

export const imageSchema = z.object({ file: z.string(), author: z.string(), licence: z.string(), source: z.url() })
export const sourceSchema = z.object({ title: z.string(), url: z.url(), accessed: z.iso.date() })

export const MINERAL_GROUPS = ['framework-silicate', 'sheet-silicate', 'chain-silicate', 'isolated-silicate', 'carbonate', 'oxide', 'hydroxide', 'sulfide', 'sulfate', 'halide', 'phosphate', 'native-element'] as const
export const LUSTERS = ['metallic', 'submetallic', 'vitreous', 'pearly', 'greasy', 'silky', 'resinous', 'dull', 'earthy', 'adamantine'] as const
export const CLEAVAGE_QUALITY = ['none', 'poor', 'good', 'perfect'] as const
export const FRACTURES = ['conchoidal', 'uneven', 'splintery', 'hackly', 'subconchoidal'] as const
export const CRYSTAL_SYSTEMS = ['cubic', 'tetragonal', 'orthorhombic', 'hexagonal', 'trigonal', 'monoclinic', 'triclinic', 'amorphous'] as const

export const mineralSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string(),
  formula: z.string(),
  group: z.enum(MINERAL_GROUPS),
  core: z.boolean(),
  hardness: range,
  streak: z.string(),
  luster: z.array(z.enum(LUSTERS)).min(1),
  cleavage: z.object({ directions: z.number().int().min(0).max(6), quality: z.enum(CLEAVAGE_QUALITY), angles: z.string().optional() }),
  fracture: z.enum(FRACTURES).optional(),
  colour: z.array(z.string()).min(1),
  density: range,
  crystalSystem: z.enum(CRYSTAL_SYSTEMS),
  diagnostic: z
    .object({
      acid: z.enum(['fizzes', 'fizzes-powdered', 'none']).optional(),
      magnetic: z.boolean().optional(),
      taste: z.string().optional(),
      feel: z.string().optional(),
      other: z.string().optional(),
    })
    .default({}),
  habit: z.array(z.string()).default([]),
  /** Key into data/cif/index.json. */
  cif: z.string().optional(),
  specimens: z.array(specimenSchema).default([]),
  images: z.array(imageSchema).default([]),
  sources: z.array(sourceSchema).min(1),
})
export type Mineral = z.infer<typeof mineralSchema>

export const mineralsSchema = z.array(mineralSchema).superRefine((list, ctx) => {
  const ids = new Set<string>()
  const specimenIds = new Set<string>()
  list.forEach((m, i) => {
    if (ids.has(m.id)) ctx.addIssue({ code: 'custom', message: `duplicate mineral id ${m.id}`, path: [i, 'id'] })
    ids.add(m.id)
    m.specimens.forEach((s, j) => {
      if (specimenIds.has(s.id)) ctx.addIssue({ code: 'custom', message: `duplicate specimen id ${s.id}`, path: [i, 'specimens', j, 'id'] })
      specimenIds.add(s.id)
    })
  })
})
