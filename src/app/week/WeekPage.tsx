import type { ComponentType } from 'react'
import { NavLink, useParams } from 'react-router'
import { PageHeader } from '@/app/PageHeader'
import { NotFound } from '@/app/pages/NotFound'
import { SelfCheck } from '@/app/selfcheck/SelfCheck'
import type { Question } from '@/app/selfcheck/questions'
import { STATUS_LABEL } from '@/app/status'
import { hasPage, weekBySlug, weekPath, type Week } from '@/app/weeks'
import * as week01 from '@/app/weeks/week01'
import * as week02 from '@/app/weeks/week02'
import * as week03 from '@/app/weeks/week03'
import * as week04 from '@/app/weeks/week04'
import * as week05 from '@/app/weeks/week05'
import * as week06 from '@/app/weeks/week06'
import * as week07 from '@/app/weeks/week07'
import * as week08 from '@/app/weeks/week08'
import * as week09 from '@/app/weeks/week09'
import * as week10 from '@/app/weeks/week10'
import * as week11 from '@/app/weeks/week11'
import * as week12 from '@/app/weeks/week12'
import * as week13 from '@/app/weeks/week13'
import * as week14 from '@/app/weeks/week14'
import * as week15 from '@/app/weeks/week15'
import * as week16 from '@/app/weeks/week16'
import * as week17 from '@/app/weeks/week17'
import * as week18 from '@/app/weeks/week18'
import { PLANS, scaffoldWeek } from '@/app/weeks/scaffold'
import { useWeekProgress, type WeekProgress } from './weekProgress'

export interface LabProps {
  progress: WeekProgress
  update: (patch: Partial<Omit<WeekProgress, 'status'>>) => void
}

/** What a week's folder exports. */
export interface WeekContent {
  Learn: ComponentType
  Explore: ComponentType
  Lab: ComponentType<LabProps>
  questions: Question[]
}

const CONTENT: Record<number, WeekContent> = {
  ...Object.fromEntries(Object.entries(PLANS).map(([week, plan]) => [week, scaffoldWeek(plan)])),
  1: week01,
  2: week02,
  3: week03,
  4: week04,
  5: week05,
  6: week06,
  7: week07,
  8: week08,
  9: week09,
  10: week10,
  11: week11,
  12: week12,
  13: week13,
  14: week14,
  15: week15,
  16: week16,
  17: week17,
  18: week18,
}

const TABS = [
  { tab: 'learn', label: 'Learn' },
  { tab: 'explore', label: 'Explore' },
  { tab: 'lab', label: 'Lab' },
  { tab: 'check', label: 'Self-check' },
] as const
type Tab = (typeof TABS)[number]['tab']

export function WeekPage() {
  const params = useParams()
  const week = weekBySlug(params.slug)
  const tab = params.tab ?? 'learn'
  const content = week && CONTENT[week.week]
  if (!week || !hasPage(week) || !content || !TABS.some((t) => t.tab === tab)) return <NotFound />
  // Keyed by week: the shell holds that week's stored progress in state, and a move to another week must start over.
  return <WeekShell key={week.week} week={week} tab={tab as Tab} content={content} />
}

function WeekShell({ week, tab, content }: { week: Week; tab: Tab; content: WeekContent }) {
  const [progress, update] = useWeekProgress(week)
  const title = week.title
  const { Learn, Explore, Lab, questions } = content
  return (
    <>
      <PageHeader title={title} documentTitle={`${TABS.find((t) => t.tab === tab)?.label} · ${title}`} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <nav aria-label="Topic sections" className="flex flex-wrap gap-1 rounded-lg bg-muted p-[3px] text-sm">
          {TABS.map(({ tab: t, label }) => (
            <NavLink
              key={t}
              to={t === 'learn' ? weekPath(week.week) : `${weekPath(week.week)}/${t}`}
              end
              className={({ isActive }) => `rounded-md px-3 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground" aria-label="Topic progress">
          {STATUS_LABEL[progress.status]}
          {progress.selfCheckBest !== null && ` · best ${progress.selfCheckBest}/${questions.length}`}
        </span>
      </div>
      {tab === 'learn' && <Learn />}
      {tab === 'explore' && <Explore />}
      {tab === 'lab' && <Lab progress={progress} update={update} />}
      {tab === 'check' &&
        (questions.length > 0 ? (
          <SelfCheck questions={questions} progress={progress} update={update} />
        ) : (
          <p role="status" className="max-w-prose rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            The self-check for this topic is not written yet.
          </p>
        ))}
    </>
  )
}
