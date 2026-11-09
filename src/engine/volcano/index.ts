/**
 * The Volcano Lab model: silica, dissolved water and temperature in; viscosity, eruption style and a VEI range out.
 *
 * ponytail: the viscosity is a StrataLab teaching fit, three linear terms anchored on textbook end members (basalt
 * at 1200 °C near 10^2 Pa·s, andesite at 1000 °C near 10^4, dry rhyolite at 800 °C near 10^8). It is not a published
 * relation; the reviewers name one (candidate: Giordano, Russell and Dingwell 2008) and it replaces `logViscosity`
 * alone, since the style rules read only the result. Recorded in docs/WEEK-PLANS.md, week 5.
 */
export interface Magma {
  /** wt % SiO2, 45 to 77 */
  silica: number
  /** wt % dissolved H2O, 0 to 6 */
  water: number
  /** °C, 700 to 1250 */
  temperature: number
}

export type EruptionStyle = 'effusive' | 'strombolian' | 'vulcanian' | 'plinian'

export interface Eruption {
  /** log10 of viscosity in Pa·s */
  logViscosity: number
  style: EruptionStyle
  /** Typical Volcanic Explosivity Index range for the style. */
  vei: [number, number]
}

export const MAGMA_RANGE = { silica: [45, 77], water: [0, 6], temperature: [700, 1250] } as const

export const logViscosity = ({ silica, water, temperature }: Magma): number => 2 + 0.18 * (silica - 50) + 0.4 * ((1200 - temperature) / 100) - 0.5 * water

export const VEI_RANGE: Record<EruptionStyle, [number, number]> = { effusive: [0, 1], strombolian: [1, 2], vulcanian: [2, 4], plinian: [4, 8] }

export const STYLE_LABEL: Record<EruptionStyle, string> = {
  effusive: 'Effusive: lava flows or a dome',
  strombolian: 'Strombolian: bursts of lava and bombs',
  vulcanian: 'Vulcanian: short explosive blasts, ash and blocks',
  plinian: 'Plinian: a sustained column of gas and ash',
}

/** Style from viscosity and gas: runny and dry flows, runny and wet spatters, stiff and wet explodes, stiff and dry builds a dome. */
export function eruptionStyle(logEta: number, water: number): EruptionStyle {
  if (logEta < 3.5) return water < 1 ? 'effusive' : 'strombolian'
  if (logEta < 5.5) return water < 1 ? 'effusive' : 'vulcanian'
  if (water >= 2) return 'plinian'
  return water >= 1 ? 'vulcanian' : 'effusive'
}

export function erupt(magma: Magma): Eruption {
  const logEta = logViscosity(magma)
  const style = eruptionStyle(logEta, magma.water)
  return { logViscosity: logEta, style, vei: VEI_RANGE[style] }
}

/** The lab's three prompts: a style to land in, within a composition window. */
export interface Prompt {
  id: 'shield' | 'strato' | 'caldera'
  title: string
  text: string
  style: EruptionStyle
  silica: [number, number]
}

export const PROMPTS: Prompt[] = [
  { id: 'shield', title: 'A shield volcano', text: 'Set a magma that pours out as fluid lava flows and builds a broad, low shield: basaltic, hot and nearly dry.', style: 'effusive', silica: [45, 55] },
  { id: 'strato', title: 'A stratovolcano', text: 'Set an intermediate magma that erupts in short explosive blasts of ash and blocks, the kind that stacks a steep cone: andesitic, cooler, with some gas.', style: 'vulcanian', silica: [55, 68] },
  { id: 'caldera', title: 'A caldera-forming eruption', text: 'Set a magma that drives a sustained column of ash tens of kilometres high: silica-rich, cool and gas-rich.', style: 'plinian', silica: [68, 77] },
]

export const landed = (prompt: Prompt, magma: Magma): boolean => erupt(magma).style === prompt.style && magma.silica >= prompt.silica[0] && magma.silica <= prompt.silica[1]
