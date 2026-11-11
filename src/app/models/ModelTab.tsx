import { useEffect, useReducer, useRef, type ComponentType, type MouseEvent } from 'react'
import './models.css'

export interface Part {
  id: string
  label: string
  /** One or two plain sentences: what the part is and what it does in this loop. */
  text: string
}

export interface Variant {
  id: string
  label: string
  caption: string
  parts: Part[]
  /** Returns one <svg viewBox="0 0 400 260" role="img" aria-label={caption}>; tappable regions carry data-part. */
  Scene: ComponentType<{ selected: string | null }>
}

export interface ModelProps {
  lead: string
  variants: Variant[]
  /** Rendered under the drawing with the current variant id (the volcano turntable). */
  Aside?: ComponentType<{ variant: string }>
}

export interface ModelState {
  variant: string
  selected: string | null
}
export type ModelAction = { type: 'variant'; id: string } | { type: 'select'; id: string }

/** Choosing a variant clears the selection; selecting the selected part clears it. */
export const reduce = (state: ModelState, action: ModelAction): ModelState =>
  action.type === 'variant' ? { variant: action.id, selected: null } : { ...state, selected: state.selected === action.id ? null : action.id }

const chip = (on: boolean) => `rounded-full border px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? 'bg-foreground text-background' : 'hover:bg-muted'}`

/** A topic's Model tab: variant buttons, the looping drawing, its caption and the tappable parts (docs/specs/models.md). */
export function ModelTab({ lead, variants, Aside }: ModelProps) {
  const [state, dispatch] = useReducer(reduce, { variant: variants[0]?.id ?? '', selected: null })
  const variant = variants.find((v) => v.id === state.variant) ?? variants[0]
  const wrapper = useRef<HTMLDivElement>(null)

  // The drawing's own parts light up through attributes, so a scene is plain SVG with no state of its own.
  useEffect(() => {
    for (const el of wrapper.current?.querySelectorAll('[data-part]') ?? []) el.toggleAttribute('data-on', el.getAttribute('data-part') === state.selected)
  }, [state.selected, state.variant])

  if (!variant) return null
  const { Scene } = variant
  const part = variant.parts.find((p) => p.id === state.selected)
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const id = (event.target as Element).closest('[data-part]')?.getAttribute('data-part')
    if (id) dispatch({ type: 'select', id })
  }

  return (
    <div className="grid max-w-prose gap-4">
      <p className="text-muted-foreground">{lead}</p>
      {variants.length > 1 && (
        <div role="group" aria-label="Model" className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button key={v.id} type="button" aria-pressed={v.id === variant.id} className={chip(v.id === variant.id)} onClick={() => dispatch({ type: 'variant', id: v.id })}>
              {v.label}
            </button>
          ))}
        </div>
      )}
      <div ref={wrapper} data-dim={state.selected ? '' : undefined} className="rounded-lg border bg-card p-1 [&>svg]:h-auto [&>svg]:w-full" onClick={onClick}>
        <Scene selected={state.selected} />
      </div>
      <p aria-live="polite" className="min-h-12 text-sm">
        {part ? (
          <>
            <span className="font-medium">{part.label}. </span>
            {part.text}
          </>
        ) : (
          variant.caption
        )}
      </p>
      <div role="group" aria-label="Parts" className="flex flex-wrap gap-2">
        {variant.parts.map((p) => (
          <button key={p.id} type="button" aria-pressed={p.id === state.selected} className={chip(p.id === state.selected)} onClick={() => dispatch({ type: 'select', id: p.id })}>
            {p.label}
          </button>
        ))}
      </div>
      {Aside && <Aside variant={variant.id} />}
    </div>
  )
}
