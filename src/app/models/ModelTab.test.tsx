import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ModelTab, reduce, type Variant } from './ModelTab'

const scene = (caption: string) => () => (
  <svg viewBox="0 0 400 260" role="img" aria-label={caption}>
    <rect data-part="one" width="10" height="10" />
  </svg>
)
const A: Variant = { id: 'a', label: 'A', caption: 'A caption.', parts: [{ id: 'one', label: 'One', text: 'The first part.' }], Scene: scene('A caption.') }
const B: Variant = { id: 'b', label: 'B', caption: 'B caption.', parts: [], Scene: scene('B caption.') }

describe('ModelTab', () => {
  it('renders variant buttons, the first scene, chips and the caption', () => {
    const html = renderToStaticMarkup(<ModelTab lead="Lead." variants={[A, B]} />)
    expect(html).toContain('aria-label="A caption."')
    expect(html).toContain('>B<')
    expect(html).toContain('>One<')
    expect(html).toContain('A caption.')
    expect(html).not.toContain('data-dim')
  })
  it('hides the variant row when there is one variant', () => {
    expect(renderToStaticMarkup(<ModelTab lead="Lead." variants={[A]} />)).not.toContain('aria-label="Model"')
  })
  it('clears the selection on a variant change and toggles a part', () => {
    const s = reduce({ variant: 'a', selected: null }, { type: 'select', id: 'one' })
    expect(s.selected).toBe('one')
    expect(reduce(s, { type: 'select', id: 'one' }).selected).toBeNull()
    expect(reduce(s, { type: 'variant', id: 'b' })).toEqual({ variant: 'b', selected: null })
  })
  it('sets forwards fill so reduced motion lands on the end frame', () => {
    expect(readFileSync(new URL('./models.css', import.meta.url), 'utf8')).toMatch(/\.mdl\s*{[^}]*animation-fill-mode:\s*forwards/)
  })
})
