import { Link, useParams } from 'react-router'
import { mineralById } from '@/app/lab/library'
import { PageHeader } from '@/app/PageHeader'
import { IGNEOUS_GRAINS, SILICA, type Igneous, type Metamorphic, type Rock, type Sedimentary } from '@/data/samples/schema'
import { Bowen, PTGrid } from './Figures'
import { ROCKS, rockById } from './library'

const CLASS_LABEL: Record<Rock['class'], string> = { igneous: 'Igneous', sedimentary: 'Sedimentary', metamorphic: 'Metamorphic' }
const cell = 'border p-1 align-top text-sm'
const RockLinks = ({ rocks }: { rocks: Rock[] }) => (
  <ul className="grid gap-0.5">
    {rocks.map((r) => (
      <li key={r.id}>
        <Link to={`/explore/rocks/${r.id}`} className="underline-offset-4 hover:underline">
          {r.name}
        </Link>
        {!r.core && <span className="ml-1 text-xs text-muted-foreground">extra</span>}
      </li>
    ))}
  </ul>
)

/** Igneous rocks by texture (rows) and silica content (columns). */
export function IgneousGrid() {
  const igneous = ROCKS.filter((r): r is Igneous => r.class === 'igneous')
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <caption className="mb-1 text-left font-medium">Igneous rocks: texture by composition</caption>
        <thead>
          <tr>
            <th scope="col" className={`${cell} text-left text-muted-foreground`}>Texture</th>
            {SILICA.map((s) => (
              <th key={s} scope="col" className={`${cell} text-left`}>
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {IGNEOUS_GRAINS.map((g) => (
            <tr key={g}>
              <th scope="row" className={`${cell} text-left font-normal text-muted-foreground`}>{g}</th>
              {SILICA.map((s) => (
                <td key={s} className={cell}>
                  <RockLinks rocks={igneous.filter((r) => r.texture.grain === g && r.composition.silica === s)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const SIZE_CLASSES: { name: string; min: number; max: number }[] = [
  { name: 'gravel (over 2 mm)', min: 2, max: Infinity },
  { name: 'sand (0.0625 to 2 mm)', min: 0.0625, max: 2 },
  { name: 'silt (0.0039 to 0.0625 mm)', min: 0.0039, max: 0.0625 },
  { name: 'clay (under 0.0039 mm)', min: 0, max: 0.0039 },
]

/** Sedimentary rocks: clastic by grain size, chemical and biochemical by what they are made of. */
export function SedimentaryGrid() {
  const sed = ROCKS.filter((r): r is Sedimentary => r.class === 'sedimentary')
  const clastic = sed.filter((r) => r.texture.kind === 'clastic')
  const other = sed.filter((r) => r.texture.kind !== 'clastic')
  const byMineral = new Map<string, Sedimentary[]>()
  for (const r of other) {
    const key = r.composition.minerals[0] ?? 'organic matter'
    byMineral.set(key, [...(byMineral.get(key) ?? []), r])
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <table className="w-full border-collapse">
        <caption className="mb-1 text-left font-medium">Clastic, by grain size</caption>
        <tbody>
          {SIZE_CLASSES.map((c) => (
            <tr key={c.name}>
              <th scope="row" className={`${cell} w-1/2 text-left font-normal text-muted-foreground`}>{c.name}</th>
              <td className={cell}>
                <RockLinks rocks={clastic.filter((r) => r.texture.grainSizeMm && r.texture.grainSizeMm[1] > c.min && r.texture.grainSizeMm[0] < c.max && r.texture.grainSizeMm[0] >= c.min - 1e-9)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="w-full border-collapse">
        <caption className="mb-1 text-left font-medium">Chemical and biochemical, by composition</caption>
        <tbody>
          {[...byMineral.entries()].map(([mineral, rocks]) => (
            <tr key={mineral}>
              <th scope="row" className={`${cell} w-1/2 text-left font-normal text-muted-foreground`}>{mineralById(mineral)?.name ?? mineral}</th>
              <td className={cell}>
                <RockLinks rocks={rocks} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Metamorphic rocks: foliated by grade, non-foliated by parent rock. */
export function MetamorphicGrid() {
  const met = ROCKS.filter((r): r is Metamorphic => r.class === 'metamorphic')
  const foliated = met.filter((r) => r.texture.foliated)
  const massive = met.filter((r) => !r.texture.foliated)
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <table className="w-full border-collapse">
        <caption className="mb-1 text-left font-medium">Foliated, by grade</caption>
        <tbody>
          {(['low', 'medium', 'high'] as const).map((g) => (
            <tr key={g}>
              <th scope="row" className={`${cell} w-1/3 text-left font-normal text-muted-foreground`}>{g}</th>
              <td className={cell}>
                <RockLinks rocks={foliated.filter((r) => r.texture.grade === g)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="w-full border-collapse">
        <caption className="mb-1 text-left font-medium">Non-foliated, by parent rock</caption>
        <tbody>
          {massive.map((r) => (
            <tr key={r.id}>
              <th scope="row" className={`${cell} w-1/3 text-left font-normal text-muted-foreground`}>{r.related.parent.map((p) => rockById(p)?.name ?? p).join(', ')}</th>
              <td className={cell}>
                <RockLinks rocks={[r]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
const Minerals = ({ ids }: { ids: string[] }) =>
  ids.length ? (
    <>
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && ', '}
          <Link to={`/explore/minerals/${id}`} className="underline-offset-4 hover:underline">
            {mineralById(id)?.name ?? id}
          </Link>
        </span>
      ))}
    </>
  ) : (
    <>none that a hand lens shows</>
  )
const RockLink = ({ id }: { id: string }) => (
  <Link to={`/explore/rocks/${id}`} className="underline-offset-4 hover:underline">
    {rockById(id)?.name ?? id}
  </Link>
)

function RockCard({ rock }: { rock: Rock }) {
  return (
    <>
      <PageHeader title={rock.name} parent={{ to: '/explore/rocks', label: 'Rocks' }} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="rock-props" className="grid content-start gap-3">
          <p className="text-lg">
            {CLASS_LABEL[rock.class]}
            {!rock.core && <span className="ml-2 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">beyond the core set</span>}
          </p>
          <h2 id="rock-props" className="sr-only">
            Properties
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {rock.class === 'igneous' && (
              <>
                <Row label="Texture">{rock.texture.grain}</Row>
                <Row label="Composition">{rock.composition.silica}{rock.colourIndex !== null && `, about ${rock.colourIndex} % dark minerals`}</Row>
                <Row label="Minerals"><Minerals ids={rock.composition.minerals} /></Row>
                {rock.related.twin && <Row label={rock.texture.grain === 'phaneritic' ? 'Extrusive twin' : 'Intrusive twin'}><RockLink id={rock.related.twin} /></Row>}
              </>
            )}
            {rock.class === 'sedimentary' && (
              <>
                <Row label="Kind">{rock.texture.kind}</Row>
                {rock.texture.grainSizeMm && <Row label="Grain size">{rock.texture.grainSizeMm[0]} to {rock.texture.grainSizeMm[1] === 256 ? 'over 256' : rock.texture.grainSizeMm[1]} mm</Row>}
                {rock.texture.sorting && <Row label="Sorting">{rock.texture.sorting}</Row>}
                {rock.texture.rounding && <Row label="Rounding">{rock.texture.rounding}</Row>}
                {rock.texture.cement && <Row label="Cement">{rock.texture.cement}</Row>}
                {rock.composition.clasts && <Row label="Clasts">{rock.composition.clasts}</Row>}
                <Row label="Minerals"><Minerals ids={rock.composition.minerals} /></Row>
                <Row label="Dilute acid">{rock.acid === 'fizzes' ? 'fizzes' : rock.acid === 'fizzes-powdered' ? 'fizzes when powdered' : 'no reaction'}</Row>
              </>
            )}
            {rock.class === 'metamorphic' && (
              <>
                <Row label="Foliation">{rock.texture.foliated ? `foliated, ${rock.texture.texture}` : `non-foliated, ${rock.texture.texture}`}</Row>
                <Row label="Grade">{rock.texture.grade}</Row>
                <Row label="Index minerals"><Minerals ids={rock.composition.indexMinerals} /></Row>
                <Row label="Parent rock">{rock.related.parent.map((p, i) => <span key={p}>{i > 0 && ', '}<RockLink id={p} /></span>)}</Row>
                <Row label="Dilute acid">{rock.acid === 'fizzes' ? 'fizzes' : rock.acid === 'fizzes-powdered' ? 'fizzes when powdered' : 'no reaction'}</Row>
              </>
            )}
            <Row label="Forms in">{rock.formation.join('; ')}</Row>
          </dl>
          <p className="text-xs text-muted-foreground">
            After{' '}
            {rock.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && ' and '}
                <a className="underline underline-offset-4" href={s.url} rel="noreferrer">
                  {s.title}
                </a>
              </span>
            ))}
            , read {rock.sources[0]?.accessed}. No recording of this specimen yet.
          </p>
        </section>
        <div className="grid content-start gap-4">
          {rock.class === 'igneous' && <Bowen />}
          {rock.class === 'metamorphic' && <PTGrid highlightRock={rock.id} />}
          {rock.class === 'sedimentary' && <SedimentaryGrid />}
        </div>
      </div>
    </>
  )
}

/** The Rock Inspector: the three classification grids, or one rock's card. Weeks 4, 6 and 7 embed one class each. */
export function RockInspector({ focus, intro, standalone = false }: { focus?: Rock['class']; intro?: string; standalone?: boolean }) {
  const { id } = useParams()
  if (id) {
    const rock = rockById(id)
    if (!rock) return <PageHeader title="No such rock" parent={{ to: '/explore/rocks', label: 'Rocks' }} />
    return <RockCard rock={rock} />
  }
  const show = (cls: Rock['class']) => !focus || focus === cls
  return (
    <div className="grid gap-6">
      {standalone && <PageHeader title="Rocks" />}
      {intro && <p className="max-w-prose text-muted-foreground">{intro}</p>}
      {show('igneous') && (
        <section aria-labelledby="ig-heading" className="grid gap-3">
          <h2 id="ig-heading" className="text-lg font-medium">
            Igneous
          </h2>
          <IgneousGrid />
          <Bowen />
        </section>
      )}
      {show('sedimentary') && (
        <section aria-labelledby="sed-heading" className="grid gap-3">
          <h2 id="sed-heading" className="text-lg font-medium">
            Sedimentary
          </h2>
          <SedimentaryGrid />
        </section>
      )}
      {show('metamorphic') && (
        <section aria-labelledby="met-heading" className="grid gap-3">
          <h2 id="met-heading" className="text-lg font-medium">
            Metamorphic
          </h2>
          <MetamorphicGrid />
          <PTGrid />
        </section>
      )}
    </div>
  )
}

export const RocksPage = () => <RockInspector standalone />
