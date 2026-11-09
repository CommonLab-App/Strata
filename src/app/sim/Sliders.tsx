import { useId } from 'react'

export interface SliderSpec {
  key: string
  label: string
  min: number
  max: number
  step: number
  unit?: string
}

/**
 * The one slider panel every sim uses: a labelled range input per parameter, the value shown with its unit. Models
 * take the values object; nothing about the physics lives here.
 */
export function Sliders({ specs, values, onChange }: { specs: SliderSpec[]; values: Record<string, number>; onChange: (key: string, value: number) => void }) {
  const base = useId()
  return (
    <div className="grid gap-3">
      {specs.map((s) => {
        const id = `${base}-${s.key}`
        const value = values[s.key] ?? s.min
        return (
          <div key={s.key} className="grid gap-1">
            <div className="flex items-baseline justify-between text-sm">
              <label htmlFor={id}>{s.label}</label>
              <output htmlFor={id} className="font-mono tabular-nums">
                {value}
                {s.unit ? ` ${s.unit}` : ''}
              </output>
            </div>
            <input id={id} type="range" min={s.min} max={s.max} step={s.step} value={value} onChange={(e) => onChange(s.key, Number(e.target.value))} className="w-full accent-brand" />
          </div>
        )
      })}
    </div>
  )
}
