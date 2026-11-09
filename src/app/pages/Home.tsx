import { Link } from 'react-router'
import { useAppState } from '@/app/AppState'
import { PageHeader } from '@/app/PageHeader'
import { NOT_SAVING_TEXT } from '@/app/progress/storage'
import { STATUS_LABEL } from '@/app/status'
import { hasPage, isDraft, WEEKS, weekPath, weekStatus } from '@/app/weeks'

export function Home() {
  const { store, persistent } = useAppState()

  return (
    <>
      <PageHeader title="Home" />
      {!persistent && (
        <p role="status" className="mb-6 max-w-prose rounded-md border p-3 text-sm">
          {NOT_SAVING_TEXT}
        </p>
      )}
      <p className="mb-6 max-w-prose text-muted-foreground">
        StrataLab is an introductory physical geology explorer and virtual lab, laid out as a sixteen-week course with two
        optional extension weeks. No account is needed{persistent ? '; your progress is saved in this browser.' : '.'}
      </p>
      <ol className="grid max-w-3xl gap-2">
        {WEEKS.map((week) => {
          const built = hasPage(week)
          return (
            <li key={week.week} className="flex items-baseline gap-3 rounded-lg border bg-card px-4 py-3">
              <span className="w-16 shrink-0 text-sm text-muted-foreground">Week {week.week}</span>
              <span className="min-w-0 flex-1">
                {built ? (
                  <Link to={weekPath(week.week)} className="font-medium underline-offset-4 hover:underline">
                    {week.title}
                  </Link>
                ) : (
                  <span className="font-medium">{week.title}</span>
                )}
                {'optional' in week && <span className="ml-2 text-sm text-muted-foreground">optional</span>}
              </span>
              <span className="shrink-0 text-sm text-muted-foreground">{!built ? 'Planned' : isDraft(week) ? 'Draft' : STATUS_LABEL[weekStatus(store, week)]}</span>
            </li>
          )
        })}
      </ol>
    </>
  )
}
