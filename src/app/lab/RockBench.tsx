import { useState } from 'react'
import { Link } from 'react-router'
import { rockById, ROCKS } from '@/app/rocks/library'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { drawRocks, emptyRockRecord, rockCandidates, runRockTest, scoreRockTray, type RockLabConfig, type RockObservations, type RockRecord, type RockTool } from '@/engine/idlab/rocks'
import type { IdLabState } from '@/engine/idlab/state'

const TOOL_LABEL: Record<RockTool, string> = { 'hand-lens': 'Hand lens', 'grain-gauge': 'Grain gauge', minerals: 'Minerals seen', acid: 'Dilute acid' }

function resultText(tool: RockTool, seen: RockObservations): string {
  if (tool === 'hand-lens') {
    if (seen.class === 'igneous') return `Interlocking crystals or glass: igneous. Texture ${seen.grain}${seen.colourIndex != null ? `, about ${seen.colourIndex} % dark minerals` : ''}.`
    if (seen.class === 'sedimentary') return `Grains, shells or a chemical deposit: sedimentary, ${seen.kind}.`
    return `Recrystallised: metamorphic, ${seen.foliated ? 'foliated' : 'non-foliated'}, ${seen.texture} texture.`
  }
  if (tool === 'grain-gauge') {
    if (seen.class === 'sedimentary' || seen.grainSizeMm !== undefined) return seen.grainSizeMm ? `Grains ${seen.grainSizeMm[0]} to ${seen.grainSizeMm[1] === 256 ? 'over 256' : seen.grainSizeMm[1]} mm, ${seen.sorting} sorted, ${seen.rounding}.` : 'No separate grains to measure.'
    if (seen.grade) return `Crystal size suggests ${seen.grade} grade.`
    return `Grain texture ${seen.grain}.`
  }
  if (tool === 'minerals') return seen.minerals?.length ? `Minerals seen: ${seen.minerals.map((id) => (ROCKS.length, id.replace(/-/g, ' '))).join(', ')}${seen.grade ? `; ${seen.grade} grade` : ''}.` : 'No minerals large enough to name.'
  return seen.acid === 'fizzes' ? 'Fizzes in dilute acid: carbonate.' : seen.acid === 'fizzes-powdered' ? 'Fizzes only when powdered: dolomite.' : 'No reaction to acid.'
}

const cellText = (seen: RockObservations) => {
  if (seen.class === 'igneous' && seen.grain) return `${seen.grain} / ${seen.colourIndex == null ? 'glass or froth' : seen.colourIndex <= 20 ? 'felsic' : seen.colourIndex <= 45 ? 'intermediate' : seen.colourIndex <= 75 ? 'mafic' : 'ultramafic'}`
  if (seen.class === 'sedimentary' && seen.kind) return seen.kind + (seen.grainSizeMm ? ` / ${seen.grainSizeMm[0] >= 2 ? 'gravel' : seen.grainSizeMm[0] >= 0.0625 ? 'sand' : seen.grainSizeMm[0] >= 0.0039 ? 'silt' : 'clay'}` : '')
  if (seen.class === 'metamorphic' && seen.texture) return `${seen.foliated ? 'foliated' : 'non-foliated'} / ${seen.grade ?? seen.texture}`
  return ''
}

/** The rock bench: the same tray, worksheet and key as the mineral bench, with the rock tools and a grid-cell column. */
export function RockBench({ config, progress, update }: LabProps & { config: RockLabConfig }) {
  const lab = progress.lab
  const [selected, setSelected] = useState(0)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const save = (next: IdLabState) => update({ lab: next })
  const start = (previous?: IdLabState) => {
    const seed = Math.floor(Math.random() * 1_000_000)
    save({ seed, records: Array.from({ length: config.count }, emptyRockRecord), answers: Array.from({ length: config.count }, () => null), checked: false, best: previous?.best ?? null, attempts: previous?.attempts ?? 0 })
    setSelected(0)
    setLastResult(null)
  }
  if (!lab) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">
          A tray of {config.count} unknown rocks. Look at each with the hand lens, measure the grains, name the minerals you can see, and
          test with acid; place it on the classification grid and name it from the key.
        </p>
        <div>
          <Button onClick={() => start()}>Start the lab</Button>
        </div>
      </div>
    )
  }
  const drawn = drawRocks(config, lab.seed)
  const pool = ROCKS.filter((r) => config.pool.includes(r.id))
  const records = lab.records as RockRecord[]
  const record = records[selected] ?? emptyRockRecord()
  const current = rockById(drawn[selected] ?? '')
  const keyLeft = rockCandidates(record.seen, pool)
  const score = lab.checked ? scoreRockTray(config, records, lab.answers, drawn, pool) : null
  const test = (tool: RockTool) => {
    if (!current || lab.checked) return
    const next = runRockTest(record, current, tool)
    save({ ...lab, records: records.map((r, i) => (i === selected ? next : r)) })
    setLastResult(resultText(tool, next.seen))
  }
  const answer = (id: string | null) => save({ ...lab, answers: lab.answers.map((a, i) => (i === selected ? id : a)) })
  const check = () => {
    const s = scoreRockTray(config, records, lab.answers, drawn, pool)
    save({ ...lab, checked: true, best: Math.max(lab.best ?? 0, s.correct), attempts: lab.attempts + 1 })
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="grid gap-4">
        <ol className="grid grid-cols-4 gap-2 sm:grid-cols-8" aria-label="Tray of unknowns">
          {drawn.map((_, i) => {
            const row = score?.rows[i]
            return (
              <li key={i}>
                <button type="button" aria-pressed={i === selected} aria-label={`Unknown ${i + 1}${row ? (row.correct ? ', correct' : ', incorrect') : ''}`} onClick={() => { setSelected(i); setLastResult(null) }} className={`relative aspect-square w-full rounded-md border bg-muted text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${i === selected ? 'ring-2 ring-foreground' : ''}`}>
                  <span className="absolute left-1 top-1 rounded bg-background/85 px-1 text-xs font-medium">{i + 1}</span>
                  <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">?</span>
                  {row && <span className={`absolute bottom-1 right-1 rounded px-1 text-xs font-medium ${row.correct ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{row.correct ? '✓' : '✗'}</span>}
                </button>
              </li>
            )
          })}
        </ol>
        <section aria-labelledby="unknown-heading" className="grid gap-3 rounded-lg border bg-card p-4">
          <h2 id="unknown-heading" className="font-medium">
            Unknown {selected + 1}
            {score?.rows[selected] && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {score.rows[selected].correct ? 'Correct' : `Incorrect: it is ${current?.name}`}. {score.rows[selected].sufficient ? 'Your observations were enough to be sure.' : `Your observations still left ${score.rows[selected].candidatesLeft} candidates.`}
              </span>
            )}
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Bench tools">
            {config.tools.map((tool) => (
              <Button key={tool} size="sm" variant="outline" disabled={lab.checked || record.tests.includes(tool)} onClick={() => test(tool)}>
                {TOOL_LABEL[tool]}
              </Button>
            ))}
          </div>
          {lastResult && (
            <p role="status" className="text-sm">
              {lastResult}
            </p>
          )}
        </section>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Worksheet</caption>
            <thead>
              <tr className="text-left text-muted-foreground">
                <th scope="col" className="pr-2">#</th>
                <th scope="col" className="pr-2">Class</th>
                <th scope="col" className="pr-2">Texture</th>
                <th scope="col" className="pr-2">Grains</th>
                <th scope="col" className="pr-2">Minerals</th>
                <th scope="col" className="pr-2">Acid</th>
                <th scope="col" className="pr-2">Grid cell</th>
                <th scope="col">Name</th>
              </tr>
            </thead>
            <tbody>
              {drawn.map((_, i) => {
                const r = records[i] ?? emptyRockRecord()
                const s = r.seen
                return (
                  <tr key={i} className={`border-t ${i === selected ? 'bg-muted/60' : ''}`}>
                    <th scope="row" className="pr-2 font-medium">{i + 1}</th>
                    <td className="pr-2">{s.class ?? ''}</td>
                    <td className="pr-2">{s.class === 'igneous' ? s.grain : s.class === 'sedimentary' ? s.kind : s.texture ? `${s.foliated ? 'foliated' : 'massive'}, ${s.texture}` : ''}</td>
                    <td className="pr-2">{s.grainSizeMm === undefined ? (s.grade && r.tests.includes('grain-gauge') ? `${s.grade} grade` : '') : s.grainSizeMm ? `${s.grainSizeMm[0]}–${s.grainSizeMm[1] === 256 ? '256+' : s.grainSizeMm[1]} mm, ${s.sorting}, ${s.rounding}` : 'none'}</td>
                    <td className="pr-2">{s.minerals?.map((m) => m.replace(/-/g, ' ')).join(', ') ?? ''}</td>
                    <td className="pr-2">{s.acid === undefined ? '' : s.acid === 'none' ? 'no' : s.acid === 'fizzes' ? 'fizzes' : 'powdered'}</td>
                    <td className="pr-2">{cellText(s)}</td>
                    <td>{lab.answers[i] ? rockById(lab.answers[i] ?? '')?.name : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {lab.checked ? (
            <>
              <p className="font-medium" role="status">
                {score?.correct} of {score?.total} named correctly.
              </p>
              <Button variant="outline" onClick={() => start(lab)}>
                New tray
              </Button>
            </>
          ) : (
            <>
              <Button onClick={check} disabled={lab.answers.every((a) => a === null)}>
                Check the tray
              </Button>
              <p className="text-sm text-muted-foreground">Unnamed unknowns count as wrong.</p>
            </>
          )}
          {lab.best !== null && <p className="text-sm text-muted-foreground">Best so far: {lab.best}/{drawn.length} in {lab.attempts} {lab.attempts === 1 ? 'tray' : 'trays'}.</p>}
        </div>
      </div>
      <aside aria-labelledby="key-heading" className="grid content-start gap-2">
        <h2 id="key-heading" className="font-medium">
          Key: {keyLeft.length} of {pool.length} still fit unknown {selected + 1}
        </h2>
        <ul className="grid gap-1">
          {keyLeft.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-sm">
              <Link to={`/explore/rocks/${r.id}`} className="underline-offset-4 hover:underline">
                {r.name}
              </Link>
              <Button size="xs" variant={lab.answers[selected] === r.id ? 'default' : 'outline'} aria-pressed={lab.answers[selected] === r.id} disabled={lab.checked} onClick={() => answer(lab.answers[selected] === r.id ? null : r.id)}>
                {lab.answers[selected] === r.id ? 'Named' : 'Name it'}
              </Button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
