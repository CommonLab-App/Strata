import { useState } from 'react'
import { Link } from 'react-router'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { candidates, draw, emptyRecord, runTest, scoreTray, SCRATCHERS, type LabConfig, type Observations, type Tool, type UnknownRecord } from '@/engine/idlab'
import type { IdLabState } from '@/engine/idlab/state'
import { firstSpecimen, mediaUrl, TurntableVideo } from '@/app/media/TurntableVideo'
import { MINERALS, mineralById } from './library'

const TOOL_LABEL: Record<string, string> = {
  'hand-lens': 'Hand lens',
  streak: 'Streak plate',
  cleavage: 'Cleavage',
  acid: 'Dilute acid',
  magnet: 'Magnet',
  density: 'Balance and cylinder',
  'scratch:fingernail': 'Scratch: fingernail',
  'scratch:penny': 'Scratch: copper penny',
  'scratch:glass': 'Scratch: glass plate',
  'scratch:streak-plate': 'Scratch: porcelain',
  'scratch:quartz': 'Scratch: quartz',
}

const hardnessText = (seen: Observations) => {
  if (seen.hardnessMin === undefined && seen.hardnessMax === undefined) return ''
  if (seen.hardnessMin === undefined) return `≤ ${seen.hardnessMax}`
  if (seen.hardnessMax === undefined) return `> ${seen.hardnessMin}`
  return `${seen.hardnessMin} to ${seen.hardnessMax}`
}

const cleavageText = (seen: Observations) => (seen.cleavageDirections === undefined ? '' : seen.cleavageDirections === 0 ? 'none (fracture)' : `${seen.cleavageDirections}, ${seen.cleavageQuality}`)

/** What the last test showed, in a sentence, so the reveal reads as an observation. */
function resultText(tool: Tool, seen: Observations): string {
  if (tool === 'hand-lens') return `Colour ${seen.colour?.join(', ')}; luster ${seen.luster?.join(', ')}${seen.feel && seen.feel !== 'none' ? `; feels ${seen.feel}` : ''}.`
  if (tool === 'streak') return `Streak ${seen.streak}.`
  if (tool === 'cleavage') return `Cleavage ${cleavageText(seen)}.`
  if (tool === 'acid') return seen.acid === 'fizzes' ? 'Fizzes in dilute acid.' : seen.acid === 'fizzes-powdered' ? 'Fizzes only when powdered.' : 'No reaction to acid.'
  if (tool === 'magnet') return seen.magnetic ? 'Attracted to the magnet.' : 'Not magnetic.'
  if (tool === 'density') return `Density about ${seen.density} g/cm³.`
  const h = SCRATCHERS[tool.slice('scratch:'.length) as keyof typeof SCRATCHERS]
  return seen.hardnessMax === h ? `Scratched by the ${TOOL_LABEL[tool]?.replace('Scratch: ', '')} (hardness ${h}).` : `Not scratched by the ${TOOL_LABEL[tool]?.replace('Scratch: ', '')} (hardness ${h}).`
}

/**
 * The identification bench: a tray of unknowns drawn by seed, a toolbox, the worksheet filling as tests run, the
 * key narrowing beside it, and a checker. One component; the week passes its configuration.
 */
export function IdBench({ config, progress, update }: LabProps & { config: LabConfig }) {
  const lab = progress.lab
  const [selected, setSelected] = useState(0)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const save = (next: IdLabState) => update({ lab: next })
  const start = (previous?: IdLabState) => {
    // The seed is the only random thing in the lab, and it is made here, in a handler, then stored.
    const seed = Math.floor(Math.random() * 1_000_000)
    save({ seed, records: Array.from({ length: config.count }, emptyRecord), answers: Array.from({ length: config.count }, () => null), checked: false, best: previous?.best ?? null, attempts: previous?.attempts ?? 0 })
    setSelected(0)
    setLastResult(null)
  }

  if (!lab) {
    return (
      <div className="grid max-w-prose gap-4">
        <p className="text-muted-foreground">
          A tray of {config.count} unknown minerals. Run tests with the bench tools, read the results into the worksheet, and
          use the key to name each one. You are scored on the names and on whether your tests were enough to be sure.
        </p>
        <div>
          <Button onClick={() => start()}>Start the lab</Button>
        </div>
      </div>
    )
  }

  const drawn = draw(config, lab.seed)
  const pool = MINERALS.filter((m) => config.pool.includes(m.id))
  const records = lab.records as UnknownRecord[]
  const record = records[selected] ?? emptyRecord()
  const current = mineralById(drawn[selected] ?? '')
  const specimen = current ? firstSpecimen(current) : undefined
  const keyLeft = candidates(record.seen, pool)
  const score = lab.checked ? scoreTray(config, records, lab.answers, drawn, pool) : null

  const test = (tool: Tool) => {
    if (!current || lab.checked) return
    const next = runTest(record, current, tool, lab.seed, selected)
    const nextRecords = records.map((r, i) => (i === selected ? next : r))
    save({ ...lab, records: nextRecords })
    setLastResult(resultText(tool, next.seen))
  }
  const answer = (id: string | null) => save({ ...lab, answers: lab.answers.map((a, i) => (i === selected ? id : a)) })
  const check = () => {
    const s = scoreTray(config, records, lab.answers, drawn, pool)
    save({ ...lab, checked: true, best: Math.max(lab.best ?? 0, s.correct), attempts: lab.attempts + 1 })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="grid gap-4">
        {/* Tray */}
        <ol className="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Tray of unknowns">
          {drawn.map((id, i) => {
            const m = mineralById(id)
            const s = m ? firstSpecimen(m) : undefined
            const row = score?.rows[i]
            return (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={i === selected}
                  aria-label={`Unknown ${i + 1}${row ? (row.correct ? ', correct' : ', incorrect') : ''}`}
                  onClick={() => {
                    setSelected(i)
                    setLastResult(null)
                  }}
                  className={`relative aspect-square w-full overflow-hidden rounded-md border bg-muted text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${i === selected ? 'ring-2 ring-foreground' : ''}`}
                >
                  {s?.turntable ? <img src={mediaUrl(s.id, s.turntable.poster)} alt="" className="absolute inset-0 size-full object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">?</span>}
                  <span className="absolute left-1 top-1 rounded bg-background/85 px-1 text-xs font-medium">{i + 1}</span>
                  {row && <span className={`absolute bottom-1 right-1 rounded px-1 text-xs font-medium ${row.correct ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{row.correct ? '✓' : '✗'}</span>}
                </button>
              </li>
            )
          })}
        </ol>

        {/* Selected unknown */}
        <section aria-labelledby="unknown-heading" className="grid gap-3 rounded-lg border bg-card p-4">
          <h2 id="unknown-heading" className="font-medium">
            Unknown {selected + 1}
            {score?.rows[selected] && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {score.rows[selected].correct ? 'Correct' : `Incorrect: it is ${mineralById(drawn[selected] ?? '')?.name}`}. {score.rows[selected].sufficient ? 'Your tests were enough to be sure.' : `Your tests still left ${score.rows[selected].candidatesLeft} candidates.`}
              </span>
            )}
          </h2>
          {specimen ? (
            <TurntableVideo specimen={specimen} />
          ) : (
            <p className="rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">No recording of this specimen yet. Work from the test results.</p>
          )}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Bench tools">
            {config.tools.map((tool) => (
              <Button key={tool} size="sm" variant="outline" disabled={lab.checked || record.tests.includes(tool)} onClick={() => test(tool)}>
                {TOOL_LABEL[tool] ?? tool}
              </Button>
            ))}
          </div>
          {lastResult && (
            <p role="status" className="text-sm">
              {lastResult}
            </p>
          )}
        </section>

        {/* Worksheet */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Worksheet</caption>
            <thead>
              <tr className="text-left text-muted-foreground">
                <th scope="col" className="pr-2">#</th>
                <th scope="col" className="pr-2">Colour</th>
                <th scope="col" className="pr-2">Luster</th>
                <th scope="col" className="pr-2">Streak</th>
                <th scope="col" className="pr-2">Hardness</th>
                <th scope="col" className="pr-2">Cleavage</th>
                {config.tools.includes('acid') && <th scope="col" className="pr-2">Acid</th>}
                {config.tools.includes('magnet') && <th scope="col" className="pr-2">Magnet</th>}
                {config.tools.includes('density') && <th scope="col" className="pr-2">Density</th>}
                <th scope="col">Name</th>
              </tr>
            </thead>
            <tbody>
              {drawn.map((_, i) => {
                const r = records[i] ?? emptyRecord()
                return (
                  <tr key={i} className={`border-t ${i === selected ? 'bg-muted/60' : ''}`}>
                    <th scope="row" className="pr-2 font-medium">{i + 1}</th>
                    <td className="pr-2">{r.seen.colour?.slice(0, 2).join(', ')}</td>
                    <td className="pr-2">{r.seen.luster?.join(', ')}</td>
                    <td className="pr-2">{r.seen.streak}</td>
                    <td className="pr-2">{hardnessText(r.seen)}</td>
                    <td className="pr-2">{cleavageText(r.seen)}</td>
                    {config.tools.includes('acid') && <td className="pr-2">{r.seen.acid === undefined ? '' : r.seen.acid === 'none' ? 'no' : r.seen.acid === 'fizzes' ? 'fizzes' : 'powdered'}</td>}
                    {config.tools.includes('magnet') && <td className="pr-2">{r.seen.magnetic === undefined ? '' : r.seen.magnetic ? 'yes' : 'no'}</td>}
                    {config.tools.includes('density') && <td className="pr-2">{r.seen.density ?? ''}</td>}
                    <td>{lab.answers[i] ? mineralById(lab.answers[i] ?? '')?.name : <span className="text-muted-foreground">—</span>}</td>
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
          {lab.best !== null && <p className="text-sm text-muted-foreground">Best so far: {lab.best}/{config.count} in {lab.attempts} {lab.attempts === 1 ? 'tray' : 'trays'}.</p>}
        </div>
      </div>

      {/* Key */}
      <aside aria-labelledby="key-heading" className="grid content-start gap-2">
        <h2 id="key-heading" className="font-medium">
          Key: {keyLeft.length} of {pool.length} still fit unknown {selected + 1}
        </h2>
        <ul className="grid gap-1">
          {keyLeft.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-sm">
              <Link to={`/explore/minerals/${m.id}`} className="underline-offset-4 hover:underline">
                {m.name}
              </Link>
              <Button size="xs" variant={lab.answers[selected] === m.id ? 'default' : 'outline'} aria-pressed={lab.answers[selected] === m.id} disabled={lab.checked} onClick={() => answer(lab.answers[selected] === m.id ? null : m.id)}>
                {lab.answers[selected] === m.id ? 'Named' : 'Name it'}
              </Button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
