import { useId, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import cifIndex from '@data/cif/index.json'
import { MINERALS, mineralById } from '@/app/lab/library'
import { firstSpecimen, TurntableVideo } from '@/app/media/TurntableVideo'
import { PageHeader } from '@/app/PageHeader'
import { Button } from '@/components/ui/button'
import { LUSTERS, type Mineral } from '@/data/samples/schema'
import { candidates, type Observations } from '@/engine/idlab'
import { CrystalViewer } from './CrystalViewer'

const GROUP_LABEL: Record<Mineral['group'], string> = {
  'framework-silicate': 'Framework silicates',
  'sheet-silicate': 'Sheet silicates',
  'chain-silicate': 'Chain silicates',
  'isolated-silicate': 'Isolated-tetrahedra silicates',
  carbonate: 'Carbonates',
  oxide: 'Oxides',
  hydroxide: 'Hydroxides',
  sulfide: 'Sulfides',
  sulfate: 'Sulfates',
  halide: 'Halides',
  phosphate: 'Phosphates',
  'native-element': 'Native elements',
}
const GROUP_ORDER = Object.keys(GROUP_LABEL) as Mineral['group'][]

/** Formula subscripts: digits after a letter or bracket, and the ·nH2O water. */
export function Formula({ text }: { text: string }) {
  const parts = text.split(/(\d+(?:\.\d+)?)/)
  return (
    <span className="whitespace-nowrap">
      {parts.map((p, i) => (/^\d/.test(p) && i > 0 && /[A-Za-z)\]]$/.test(parts[i - 1] ?? '') ? <sub key={i}>{p}</sub> : <span key={i}>{p}</span>))}
    </span>
  )
}

const SELECT = 'h-8 rounded-md border bg-background px-2 text-sm'

/** The property key: bench observations in, the minerals still consistent out. The same rules as the lab's key. */
function PropertyKey({ seen, onChange }: { seen: Observations; onChange: (next: Observations) => void }) {
  const id = useId()
  const streaks = [...new Set(MINERALS.map((m) => m.streak))].sort()
  const set = <K extends keyof Observations>(key: K, value: Observations[K] | undefined) => {
    const next = { ...seen }
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) delete next[key]
    else next[key] = value
    onChange(next)
  }
  return (
    <fieldset className="grid gap-3 rounded-lg border p-3 text-sm">
      <legend className="px-1 font-medium">Narrow by what you can test</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="grid gap-1">
          Harder than
          <select className={SELECT} value={seen.hardnessMin ?? ''} onChange={(e) => set('hardnessMin', e.target.value === '' ? undefined : Number(e.target.value))}>
            <option value="">any</option>
            <option value="2.5">fingernail (2.5)</option>
            <option value="3.5">copper coin (3.5)</option>
            <option value="5.5">glass (5.5)</option>
            <option value="6.5">porcelain (6.5)</option>
          </select>
        </label>
        <label className="grid gap-1">
          Scratched by
          <select className={SELECT} value={seen.hardnessMax ?? ''} onChange={(e) => set('hardnessMax', e.target.value === '' ? undefined : Number(e.target.value))}>
            <option value="">any</option>
            <option value="2.5">fingernail (2.5)</option>
            <option value="3.5">copper coin (3.5)</option>
            <option value="5.5">glass (5.5)</option>
            <option value="6.5">porcelain (6.5)</option>
          </select>
        </label>
        <label className="grid gap-1">
          Streak
          <select className={SELECT} value={seen.streak ?? ''} onChange={(e) => set('streak', e.target.value || undefined)}>
            <option value="">any</option>
            {streaks.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Cleavage directions
          <select className={SELECT} value={seen.cleavageDirections ?? ''} onChange={(e) => set('cleavageDirections', e.target.value === '' ? undefined : Number(e.target.value))}>
            <option value="">any</option>
            {[0, 1, 2, 3, 4, 6].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? 'none' : n}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Dilute acid
          <select className={SELECT} value={seen.acid ?? ''} onChange={(e) => set('acid', (e.target.value || undefined) as Observations['acid'])}>
            <option value="">any</option>
            <option value="fizzes">fizzes</option>
            <option value="fizzes-powdered">fizzes when powdered</option>
            <option value="none">no reaction</option>
          </select>
        </label>
        <label className="grid gap-1">
          Magnet
          <select className={SELECT} value={seen.magnetic === undefined ? '' : String(seen.magnetic)} onChange={(e) => set('magnetic', e.target.value === '' ? undefined : e.target.value === 'true')}>
            <option value="">any</option>
            <option value="true">attracted</option>
            <option value="false">not</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1" role="group" aria-labelledby={`${id}-luster`}>
        <span id={`${id}-luster`} className="w-full">
          Luster
        </span>
        {LUSTERS.map((l) => (
          <label key={l} className="flex items-center gap-1">
            <input type="checkbox" checked={seen.luster?.includes(l) ?? false} onChange={(e) => set('luster', e.target.checked ? [...(seen.luster ?? []), l] : (seen.luster ?? []).filter((x) => x !== l))} />
            {l}
          </label>
        ))}
      </div>
      <div>
        <Button size="sm" variant="outline" onClick={() => onChange({})} disabled={Object.keys(seen).length === 0}>
          Clear
        </Button>
      </div>
    </fieldset>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </>
  )
}

function MineralCard({ mineral }: { mineral: Mineral }) {
  const specimen = firstSpecimen(mineral)
  const cif = mineral.cif ? (cifIndex as Record<string, { cod: string; url: string; spaceGroup: string | null; formula: string | null }>)[mineral.cif] : undefined
  return (
    <>
      <PageHeader title={mineral.name} parent={{ to: '/explore/minerals', label: 'Minerals' }} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid content-start gap-4">
          <p className="text-lg">
            <Formula text={mineral.formula} /> · {GROUP_LABEL[mineral.group].replace(/s$/, '')} · {mineral.crystalSystem}
            {!mineral.core && <span className="ml-2 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">beyond the core set</span>}
          </p>
          {specimen && (
            <section aria-labelledby="specimen-heading">
              <h2 id="specimen-heading" className="mb-1 text-lg font-medium">
                Hand specimen{specimen.label ? `: ${specimen.label}` : ''}
              </h2>
              <TurntableVideo specimen={specimen} />
            </section>
          )}
          <section aria-labelledby="properties-heading">
            <h2 id="properties-heading" className="mb-1 text-lg font-medium">
              Properties
            </h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <Row label="Hardness">{mineral.hardness[0] === mineral.hardness[1] ? mineral.hardness[0] : `${mineral.hardness[0]} to ${mineral.hardness[1]}`}</Row>
              <Row label="Streak">{mineral.streak}</Row>
              <Row label="Luster">{mineral.luster.join(', ')}</Row>
              <Row label="Cleavage">
                {mineral.cleavage.directions === 0 ? `none${mineral.fracture ? `, ${mineral.fracture} fracture` : ''}` : `${mineral.cleavage.directions} direction${mineral.cleavage.directions > 1 ? 's' : ''}, ${mineral.cleavage.quality}${mineral.cleavage.angles ? ` (${mineral.cleavage.angles})` : ''}`}
              </Row>
              <Row label="Colour">{mineral.colour.join(', ')}</Row>
              <Row label="Density">{mineral.density[0] === mineral.density[1] ? mineral.density[0] : `${mineral.density[0]} to ${mineral.density[1]}`} g/cm³</Row>
              {mineral.habit.length > 0 && <Row label="Habit">{mineral.habit.join(', ')}</Row>}
              {mineral.diagnostic.acid && <Row label="Dilute acid">{mineral.diagnostic.acid === 'fizzes' ? 'fizzes' : mineral.diagnostic.acid === 'fizzes-powdered' ? 'fizzes when powdered' : 'no reaction'}</Row>}
              {mineral.diagnostic.magnetic && <Row label="Magnet">attracted</Row>}
              {mineral.diagnostic.taste && <Row label="Taste">{mineral.diagnostic.taste}</Row>}
              {mineral.diagnostic.feel && <Row label="Feel">{mineral.diagnostic.feel}</Row>}
              {mineral.diagnostic.other && <Row label="Look for">{mineral.diagnostic.other}</Row>}
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
              Values from{' '}
              {mineral.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ' and '}
                  <a className="underline underline-offset-4" href={s.url} rel="noreferrer">
                    {s.title}
                  </a>
                </span>
              ))}
              , read {mineral.sources[0]?.accessed}.
            </p>
          </section>
        </div>
        <div className="grid content-start gap-4">{cif && mineral.cif && <CrystalViewer cifId={mineral.cif} provenance={cif} />}</div>
      </div>
    </>
  )
}

/** Up to four minerals side by side, chosen with the compare boxes on the list. */
function CompareTable({ ids, onRemove }: { ids: string[]; onRemove: (id: string) => void }) {
  const list = ids.map(mineralById).filter((m): m is Mineral => !!m)
  if (list.length === 0) return null
  const rows: [string, (m: Mineral) => string][] = [
    ['Formula', (m) => m.formula],
    ['Group', (m) => GROUP_LABEL[m.group]],
    ['Hardness', (m) => `${m.hardness[0]}${m.hardness[1] !== m.hardness[0] ? ` to ${m.hardness[1]}` : ''}`],
    ['Streak', (m) => m.streak],
    ['Luster', (m) => m.luster.join(', ')],
    ['Cleavage', (m) => (m.cleavage.directions === 0 ? 'none' : `${m.cleavage.directions}, ${m.cleavage.quality}`)],
    ['Density', (m) => `${m.density[0]}${m.density[1] !== m.density[0] ? ` to ${m.density[1]}` : ''}`],
    ['System', (m) => m.crystalSystem],
  ]
  return (
    <section aria-labelledby="compare-heading" className="overflow-x-auto">
      <h2 id="compare-heading" className="mb-1 text-lg font-medium">
        Compare
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th scope="col" className="text-left text-muted-foreground"></th>
            {list.map((m) => (
              <th key={m.id} scope="col" className="text-left">
                <Link to={`/explore/minerals/${m.id}`} className="underline-offset-4 hover:underline">
                  {m.name}
                </Link>{' '}
                <button type="button" className="text-muted-foreground underline-offset-4 hover:underline" onClick={() => onRemove(m.id)} aria-label={`Remove ${m.name} from compare`}>
                  ×
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, get]) => (
            <tr key={label} className="border-t">
              <th scope="row" className="pr-2 text-left font-normal text-muted-foreground">
                {label}
              </th>
              {list.map((m) => (
                <td key={m.id} className="pr-2">
                  {get(m)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

/**
 * The Mineral Inspector: the list with search, the property key and the compare tray; or one mineral's card when
 * the route names it. The week-2 and week-3 Explore panes embed it with a line of their own.
 */
export function MineralInspector({ intro, standalone = false }: { intro?: string; standalone?: boolean }) {
  const { id } = useParams()
  const [search, setSearch] = useSearchParams()
  const [query, setQuery] = useState('')
  const [seen, setSeen] = useState<Observations>({})
  const compare = (search.get('compare') ?? '').split(',').filter(Boolean)
  const setCompare = (ids: string[]) => {
    const next = new URLSearchParams(search)
    if (ids.length) next.set('compare', ids.join(','))
    else next.delete('compare')
    setSearch(next, { replace: true })
  }

  if (id) {
    const mineral = mineralById(id)
    if (!mineral) return <PageHeader title="No such mineral" parent={{ to: '/explore/minerals', label: 'Minerals' }} />
    return <MineralCard mineral={mineral} />
  }

  const q = query.trim().toLowerCase()
  const matches = candidates(seen, MINERALS).filter((m) => !q || m.name.toLowerCase().includes(q) || m.formula.toLowerCase().includes(q) || m.id.includes(q))

  return (
    <div className="grid gap-4">
      {standalone && <PageHeader title="Minerals" />}
      {intro && <p className="max-w-prose text-muted-foreground">{intro}</p>}
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          Search
          <input type="search" className="h-8 w-56 rounded-md border bg-background px-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="name or formula" />
        </label>
        <p className="text-sm text-muted-foreground" role="status">
          {matches.length} of {MINERALS.length} minerals
        </p>
      </div>
      <PropertyKey seen={seen} onChange={setSeen} />
      <CompareTable ids={compare} onRemove={(rid) => setCompare(compare.filter((x) => x !== rid))} />
      {GROUP_ORDER.map((group) => {
        const list = matches.filter((m) => m.group === group)
        if (list.length === 0) return null
        return (
          <section key={group} aria-labelledby={`group-${group}`}>
            <h2 id={`group-${group}`} className="mb-1 text-sm font-medium text-muted-foreground">
              {GROUP_LABEL[group]}
            </h2>
            <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => {
                const checked = compare.includes(m.id)
                return (
                  <li key={m.id} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-sm">
                    <Link to={`/explore/minerals/${m.id}`} className="min-w-0 truncate underline-offset-4 hover:underline">
                      {m.name} {!m.core && <span className="text-xs text-muted-foreground">extra</span>}
                    </Link>
                    <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <input type="checkbox" checked={checked} disabled={!checked && compare.length >= 4} onChange={(e) => setCompare(e.target.checked ? [...compare, m.id] : compare.filter((x) => x !== m.id))} />
                      compare
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export const MineralsPage = () => <MineralInspector standalone />
