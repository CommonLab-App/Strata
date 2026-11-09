import { useState } from 'react'
import { SectionView } from '@/app/strata/SectionView'
import { Button } from '@/components/ui/button'
import { apply, COLUMNS, emptySection, LITHOLOGIES, type Action, type Section } from '@/engine/strata'

const rnd = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))

/** Week 10: build a cross-section one event at a time and watch the record it leaves. */
export function Explore() {
  const [history, setHistory] = useState<Section[]>([emptySection(1)])
  const section = history[history.length - 1]!
  const act = (action: Action) => setHistory([...history, apply(section, action)])
  const actions: { label: string; make: () => Action }[] = [
    { label: 'Lay a bed', make: () => ({ kind: 'bed', lithology: rnd(0, LITHOLOGIES.length - 1), thickness: 1.5 + Math.random() * 1.5 }) },
    { label: 'Intrude a dike', make: () => ({ kind: 'dike', x: rnd(3, COLUMNS - 6), width: rnd(2, 3) }) },
    { label: 'Fault it', make: () => ({ kind: 'fault', x: rnd(10, COLUMNS - 10), drop: 1.5 + Math.random() * 1.5 }) },
    { label: 'Tilt it', make: () => ({ kind: 'tilt', slope: (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.06) }) },
    { label: 'Erode the surface', make: () => ({ kind: 'erosion' }) },
  ]
  return (
    <div className="grid max-w-prose gap-4">
      <p className="text-muted-foreground">
        Each button is a geological event. Lay beds, cut them with a dike or a fault, tilt the stack, plane it off
        with erosion and lay more on top. The list below keeps the true order; in the Lab you will work it out from
        the picture alone.
      </p>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button key={a.label} size="sm" variant="outline" onClick={() => act(a.make())} disabled={a.label !== 'Lay a bed' && section.events.length === 0}>
            {a.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setHistory(history.length > 1 ? history.slice(0, -1) : history)} disabled={history.length <= 1}>
          Undo
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setHistory([emptySection(1)])} disabled={history.length <= 1}>
          Clear
        </Button>
      </div>
      <SectionView section={section} title="Your cross-section" />
      <ol className="grid gap-1 text-sm">
        {section.events.map((e, i) => (
          <li key={e.id}>
            {i + 1}. {e.label}
            {e.kind === 'erosion' && ` (${section.surfaces.find((u) => u.id === e.id)?.type === 'angular' ? 'angular unconformity' : 'disconformity'})`}
          </li>
        ))}
        {section.events.length === 0 && <li className="text-muted-foreground">Nothing yet. Lay a bed to start.</li>}
      </ol>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
        {LITHOLOGIES.map((l) => (
          <li key={l.name} className="flex items-center gap-1">
            <span aria-hidden className="inline-block size-2.5" style={{ background: l.colour }} />
            {l.name}
          </li>
        ))}
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block size-2.5 bg-[#3a3a3a]" />
          dike
        </li>
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block h-0.5 w-4 bg-[#b91c1c]" />
          fault
        </li>
        <li className="flex items-center gap-1">
          <span aria-hidden className="inline-block h-0 w-4 border-t border-dashed border-foreground" />
          erosion surface
        </li>
      </ul>
    </div>
  )
}
