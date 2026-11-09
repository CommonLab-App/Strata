import { useState } from 'react'
import { z } from 'zod'
import { Plot } from '@/app/sim/Plot'
import { Sliders, type SliderSpec } from '@/app/sim/Sliders'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { erupt, landed, logViscosity, MAGMA_RANGE, PROMPTS, STYLE_LABEL, type Magma } from '@/engine/volcano'

const magmaSchema = z.object({ silica: z.number(), water: z.number(), temperature: z.number() })
const worksheetSchema = z.object({
  answers: z.record(z.string(), magmaSchema),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
type Worksheet = z.infer<typeof worksheetSchema>
const EMPTY: Worksheet = { answers: {}, checked: false, score: null }

const SLIDERS: SliderSpec[] = [
  { key: 'silica', label: 'Silica (SiO₂)', min: MAGMA_RANGE.silica[0], max: MAGMA_RANGE.silica[1], step: 1, unit: 'wt %' },
  { key: 'water', label: 'Dissolved water', min: MAGMA_RANGE.water[0], max: MAGMA_RANGE.water[1], step: 0.1, unit: 'wt %' },
  { key: 'temperature', label: 'Temperature', min: MAGMA_RANGE.temperature[0], max: MAGMA_RANGE.temperature[1], step: 10, unit: '°C' },
]
const START: Magma = { silica: 50, water: 0.5, temperature: 1200 }

/** Week 5 lab: three prompts on the Volcano Lab sliders, scored by the model's style for the saved settings; free play after. */
export function Lab({ progress, update }: LabProps) {
  const parsed = worksheetSchema.safeParse(progress.data)
  const ws = parsed.success ? parsed.data : EMPTY
  const [magma, setMagma] = useState<Magma>(START)
  const result = erupt(magma)
  const curve: [number, number][] = []
  for (let s = MAGMA_RANGE.silica[0]; s <= MAGMA_RANGE.silica[1]; s += 1) curve.push([s, 10 ** logViscosity({ ...magma, silica: s })])

  const saveAnswer = (id: string) => update({ data: { ...ws, answers: { ...ws.answers, [id]: magma }, checked: false, score: null } })
  const answered = PROMPTS.every((p) => ws.answers[p.id])
  const check = () => {
    const score = PROMPTS.filter((p) => {
      const a = ws.answers[p.id]
      return a !== undefined && landed(p, a)
    }).length
    update({ data: { ...ws, checked: true, score }, labDone: true })
  }

  return (
    <div className="grid max-w-prose gap-6">
      <p className="text-muted-foreground">
        Three sliders set a magma; the model gives its viscosity and the eruption it drives. For each prompt, find
        settings that land in the asked-for style and save them, then check all three. Play freely in between.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Sliders specs={SLIDERS} values={{ ...magma }} onChange={(key, value) => setMagma({ ...magma, [key]: value })} />
        <div className="grid content-start gap-1 text-sm">
          <p>
            Viscosity about <strong>10{superscript(result.logViscosity)} Pa·s</strong>
          </p>
          <p>
            <strong>{STYLE_LABEL[result.style]}</strong>
          </p>
          <p className="text-muted-foreground">Typical VEI {result.vei[0]} to {result.vei[1]}.</p>
        </div>
      </div>
      <Plot
        title="Viscosity against silica at the current water and temperature"
        series={[{ id: 'curve', label: `Viscosity at ${magma.water} wt % water, ${magma.temperature} °C`, points: curve }]}
        x={{ label: 'Silica', unit: 'wt %', min: MAGMA_RANGE.silica[0], max: MAGMA_RANGE.silica[1] }}
        y={{ label: 'Viscosity', unit: 'Pa·s', log: true, min: 1, max: 1e10 }}
        marker={[magma.silica, 10 ** result.logViscosity]}
      />
      <ol className="grid gap-3">
        {PROMPTS.map((p, i) => {
          const saved = ws.answers[p.id]
          const ok = saved ? landed(p, saved) : null
          return (
            <li key={p.id} className="rounded-lg border bg-card p-4 text-sm">
              <h2 className="font-medium">
                {i + 1}. {p.title}
              </h2>
              <p className="mt-1">{p.text}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Button size="sm" variant="outline" onClick={() => saveAnswer(p.id)}>
                  Save current settings
                </Button>
                {saved && (
                  <span className="text-muted-foreground">
                    Saved: {saved.silica} wt % silica, {saved.water} wt % water, {saved.temperature} °C
                  </span>
                )}
              </div>
              {ws.checked && ok !== null && (
                <p className={`mt-2 ${ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`} role="status">
                  {ok ? 'Landed.' : `Not this time: those settings give ${STYLE_LABEL[erupt(saved!).style].split(':')[0]?.toLowerCase()} at ${saved!.silica} wt % silica.`}
                </p>
              )}
            </li>
          )
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!answered}>
          Check all three
        </Button>
        {!answered && <p className="text-sm text-muted-foreground">Save settings for every prompt to check.</p>}
        {ws.checked && (
          <p className="font-medium" role="status">
            {ws.score} of {PROMPTS.length} landed.
          </p>
        )}
      </div>
    </div>
  )
}

const superscript = (v: number) => <sup>{v.toFixed(1)}</sup>
