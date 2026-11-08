import { Link, useParams } from 'react-router'
import crust from '@data/elements/crust.json'
import index from '@data/elements/index.json'
import { MINERALS } from '@/app/lab/library'
import { PageHeader } from '@/app/PageHeader'
import { crustSchema, elementIndexSchema, elementPosition, elementsInFormula, type Goldschmidt } from '@/data/elements/schema'

const ELEMENTS = elementIndexSchema.parse(index)
const GEO = crustSchema.parse(crust)
const bySymbol = new Map(ELEMENTS.map((e) => [e.symbol, e]))
const MAJOR = ['O', 'Si', 'Al', 'Fe', 'Ca', 'Na', 'Mg', 'K']
const MINOR = ['Ti', 'H', 'P', 'Mn', 'F', 'Ba', 'Sr', 'S', 'C', 'Zr', 'Cl']

const GOLDSCHMIDT_TEXT: Record<Goldschmidt, string> = {
  lithophile: 'Lithophile, "rock-loving": bonds readily with oxygen and gathers in the crust and mantle as silicates and oxides.',
  siderophile: 'Siderophile, "iron-loving": dissolves in molten iron and went largely to the core; scarce in the crust.',
  chalcophile: 'Chalcophile, "ore-loving": prefers sulfur to oxygen, so it is found in sulfide ore minerals.',
  atmophile: 'Atmophile: a gas or forms gases, so it sits in the atmosphere and oceans rather than in rock.',
}

/** A colour for a crustal abundance on a log scale from 1 ppb to 50 %. */
function shade(ppm: number | undefined): string {
  if (!ppm) return 'var(--muted)'
  const t = Math.max(0, Math.min(1, (Math.log10(ppm) + 3) / 8.7))
  return `color-mix(in oklch, var(--muted), var(--foreground) ${Math.round(10 + t * 60)}%)`
}
const fmt = (ppm: number) => (ppm >= 10000 ? `${(ppm / 10000).toFixed(1)} %` : ppm >= 1 ? `${ppm.toLocaleString()} ppm` : `${(ppm * 1000).toLocaleString()} ppb`)

function Detail({ symbol }: { symbol: string }) {
  const e = bySymbol.get(symbol)
  if (!e) return <p className="text-muted-foreground">No element has the symbol {symbol}.</p>
  const geo = GEO.elements[symbol] ?? {}
  const pos = elementPosition(e.atomicNumber)
  const ranked = Object.entries(GEO.elements)
    .filter(([, v]) => v.crustPpm)
    .sort((a, b) => b[1].crustPpm! - a[1].crustPpm!)
    .map(([s]) => s)
  const rank = ranked.indexOf(symbol) + 1
  const inMinerals = MINERALS.filter((m) => elementsInFormula(m.formula).includes(symbol))
  const role = MAJOR.includes(symbol) ? 'One of the eight major elements of the crust: nearly every common mineral is built from these.' : MINOR.includes(symbol) ? 'A minor element of the crust: common in some rock-forming minerals, essential to a few.' : geo.crustPpm ? 'A trace element of the crust, concentrated in ores or in particular minerals.' : 'Not a crustal element in any useful amount: a noble gas or a short-lived element.'
  const crustSource = GEO.sources.find((s) => s.id === geo.crustSource)
  const goldSource = GEO.sources.find((s) => s.id === geo.goldschmidtSource)
  return (
    <section aria-labelledby="element-heading" className="grid max-w-prose gap-3 rounded-lg border bg-card p-4">
      <h2 id="element-heading" className="text-xl font-medium">
        {e.name} <span className="text-muted-foreground">{symbol}, number {e.atomicNumber}</span>
      </h2>
      <p className="text-sm text-muted-foreground">
        Period {pos.period}
        {pos.group ? `, group ${pos.group}` : ''}, {pos.block} block.
      </p>
      <p>{role}</p>
      {geo.crustPpm && (
        <p>
          Crustal abundance about <strong>{fmt(geo.crustPpm)}</strong> by mass, {rank === 1 ? 'the most abundant element' : `number ${rank}`} of the {ranked.length} tabulated
          {crustSource && (
            <>
              {' '}
              (
              <a className="underline underline-offset-4" href={crustSource.url} rel="noreferrer">
                {crustSource.title}
              </a>
              )
            </>
          )}
          .
        </p>
      )}
      {geo.goldschmidt && (
        <p>
          {GOLDSCHMIDT_TEXT[geo.goldschmidt]}
          {goldSource && (
            <>
              {' '}
              <a className="text-sm underline underline-offset-4" href={goldSource.url} rel="noreferrer">
                Goldschmidt classification
              </a>
              .
            </>
          )}
        </p>
      )}
      {inMinerals.length > 0 && (
        <div>
          <h3 className="text-sm font-medium">In this course's minerals</h3>
          <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {inMinerals.map((m) => (
              <li key={m.id}>
                <Link to={`/explore/minerals/${m.id}`} className="underline-offset-4 hover:underline">
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Chemistry of {e.name}, with sourced values:{' '}
        <a className="underline underline-offset-4" href={`https://firetailfab.com/valence/#/explore/elements/${symbol}`} rel="noreferrer">
          the element card in Valence
        </a>
        .
      </p>
    </section>
  )
}

/**
 * The periodic table as a geologist reads it: shaded by crustal abundance, the eight major elements marked, each
 * element linking to the minerals here that hold it. Chemistry proper is Valence's job and is linked.
 */
export function ElementsPage() {
  const { symbol } = useParams()
  return (
    <>
      <PageHeader title="Elements of the crust" documentTitle={symbol ? `${symbol} · Elements` : undefined} />
      <p className="mb-4 max-w-prose text-muted-foreground">
        Darker cells are more abundant in Earth's crust, on a logarithmic scale. The eight outlined elements make up about
        98 % of it by mass; everything else is minor or trace. Choose an element for its place in rock.
      </p>
      <div className="overflow-x-auto pb-2">
        <ol className="grid min-w-[720px] gap-0.5 text-xs" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }} aria-label="Periodic table">
          {ELEMENTS.map((e) => {
            const pos = elementPosition(e.atomicNumber)
            const geo = GEO.elements[e.symbol]
            const major = MAJOR.includes(e.symbol)
            const active = e.symbol === symbol
            return (
              <li key={e.symbol} style={{ gridRow: pos.row, gridColumn: pos.column }}>
                <Link
                  to={`/explore/elements/${e.symbol}`}
                  aria-label={`${e.name}${geo?.crustPpm ? `, ${fmt(geo.crustPpm)} of the crust` : ''}`}
                  aria-current={active ? 'page' : undefined}
                  className={`flex aspect-square flex-col items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${major ? 'ring-2 ring-foreground/80' : ''} ${active ? 'ring-2 ring-ring' : ''}`}
                  style={{ background: shade(geo?.crustPpm), color: geo?.crustPpm && geo.crustPpm > 1000 ? 'var(--background)' : 'var(--foreground)' }}
                >
                  <span className="font-medium">{e.symbol}</span>
                  <span className="hidden text-[10px] opacity-80 sm:block">{e.atomicNumber}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="mt-4">{symbol ? <Detail symbol={symbol} /> : <Detail symbol="O" />}</div>
    </>
  )
}
