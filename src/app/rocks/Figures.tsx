import { Link } from 'react-router'
import bowen from '@data/figures/bowen.json'
import pt from '@data/figures/pt-grid.json'
import { mineralById } from '@/app/lab/library'
import { rockById } from './library'

const MineralLink = ({ id }: { id: string }) => {
  const m = mineralById(id)
  return m ? (
    <Link to={`/explore/minerals/${m.id}`} className="underline-offset-4 hover:underline">
      {m.name}
    </Link>
  ) : (
    <span>{id}</span>
  )
}

/** Bowen's reaction series as two columns that meet: the order minerals crystallise from a cooling melt. */
export function Bowen() {
  return (
    <figure className="rounded-lg border bg-card p-4">
      <figcaption className="mb-3 font-medium">Bowen's reaction series</figcaption>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 text-sm">
        <div className="row-span-2 flex flex-col justify-between text-xs text-muted-foreground">
          <span>about {bowen.temperatureC.top} °C, mafic melt</span>
          <span aria-hidden="true" className="my-2 flex-1 border-l border-dashed" />
          <span>about {bowen.temperatureC.bottom} °C, felsic melt</span>
        </div>
        <ol className="grid content-start gap-1" aria-label="Discontinuous branch">
          <li className="text-xs uppercase tracking-wide text-muted-foreground">Discontinuous</li>
          {bowen.discontinuous.map((id) => (
            <li key={id} className="rounded bg-muted px-2 py-1">
              <MineralLink id={id} />
            </li>
          ))}
        </ol>
        <ol className="grid content-start gap-1" aria-label="Continuous branch">
          <li className="text-xs uppercase tracking-wide text-muted-foreground">Continuous</li>
          {bowen.continuous.map((label) => (
            <li key={label} className="rounded bg-muted px-2 py-1">
              <MineralLink id="plagioclase" /> <span className="text-muted-foreground">{label.replace('plagioclase ', '')}</span>
            </li>
          ))}
        </ol>
        <ol className="col-span-2 mt-1 grid gap-1" aria-label="Last to crystallise">
          {bowen.late.map((id) => (
            <li key={id} className="rounded bg-muted px-2 py-1">
              <MineralLink id={id} />
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{bowen.note}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        After{' '}
        <a className="underline underline-offset-4" href={bowen.source.url} rel="noreferrer">
          {bowen.source.title}
        </a>
        .
      </p>
    </figure>
  )
}

const FACIES_COLOUR: Record<string, string> = { zeolite: 'var(--chart-3)', greenschist: 'var(--strata-greensand)', amphibolite: 'var(--chart-2)', granulite: 'var(--chart-4)', blueschist: 'var(--strata-shale-deep)', eclogite: 'var(--chart-1)', hornfels: 'var(--strata-limestone)' }

/** Pressure (as depth) against temperature, with the metamorphic facies as fields. One field can be highlighted. */
export function PTGrid({ highlightRock }: { highlightRock?: string }) {
  const W = 600
  const H = 400
  const x = (t: number) => 60 + (t / pt.axes.temperatureC[1]!) * 520
  const y = (d: number) => 20 + (d / pt.axes.depthKm[1]!) * 340
  const lit = pt.facies.filter((f) => highlightRock && f.rocks.includes(highlightRock)).map((f) => f.id)
  return (
    <figure className="rounded-lg border bg-card p-4">
      <figcaption className="mb-2 font-medium">Metamorphic facies: temperature and depth</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Facies fields drawn in a temperature against depth diagram">
        {pt.facies.map((f) => {
          const on = lit.length === 0 || lit.includes(f.id)
          return (
            <g key={f.id} opacity={on ? 1 : 0.25}>
              <rect x={x(f.t[0]!)} y={y(f.d[0]!)} width={x(f.t[1]!) - x(f.t[0]!)} height={y(f.d[1]!) - y(f.d[0]!)} fill={FACIES_COLOUR[f.id] ?? 'var(--muted)'} fillOpacity={0.55} stroke="var(--foreground)" strokeOpacity={0.4} rx={4} />
              <text x={x(f.t[0]!) + 6} y={y(f.d[0]!) + 16} fontSize={13} fill="var(--foreground)">
                {f.name}
              </text>
            </g>
          )
        })}
        <line x1={60} y1={20} x2={60} y2={360} stroke="var(--foreground)" />
        <line x1={60} y1={360} x2={580} y2={360} stroke="var(--foreground)" />
        {[0, 250, 500, 750, 1000].map((t) => (
          <text key={t} x={x(t)} y={380} fontSize={12} textAnchor="middle" fill="var(--muted-foreground)">
            {t} °C
          </text>
        ))}
        {[0, 10, 20, 30, 40, 50].map((d) => (
          <text key={d} x={52} y={y(d) + 4} fontSize={12} textAnchor="end" fill="var(--muted-foreground)">
            {d} km
          </text>
        ))}
      </svg>
      <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
        {pt.facies
          .filter((f) => f.rocks.length)
          .map((f) => (
            <li key={f.id}>
              <span className="font-medium">{f.name}</span> ({f.grade}):{' '}
              {f.rocks.map((id, i) => (
                <span key={id}>
                  {i > 0 && ', '}
                  <Link to={`/explore/rocks/${id}`} className="underline-offset-4 hover:underline">
                    {rockById(id)?.name ?? id}
                  </Link>
                </span>
              ))}
            </li>
          ))}
      </ul>
      <p className="mt-1 text-xs text-muted-foreground">
        Fields are approximate, after{' '}
        <a className="underline underline-offset-4" href={pt.source.url} rel="noreferrer">
          {pt.source.title}
        </a>
        . Depth stands in for pressure at about 3.3 km per kilobar.
      </p>
    </figure>
  )
}
