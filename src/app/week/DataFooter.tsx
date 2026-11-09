import type { Snapshot } from '@/data/adapters/types'

/** A bundled file carries only the day it was fetched; a live snapshot carries the instant. */
const asOf = (fetched: string) => (/^\d{4}-\d{2}-\d{2}$/.test(fetched) ? new Date(fetched).toLocaleDateString(undefined, { timeZone: 'UTC' }) : new Date(fetched).toLocaleString())

/** Under any live or bundled layer: when its data was fetched and where from. */
export function DataFooter({ snapshot, attribution }: { snapshot: Snapshot<unknown>; attribution: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      Data as of <time dateTime={snapshot.fetched_at}>{asOf(snapshot.fetched_at)}</time>, source:{' '}
      <a href={snapshot.source_url} className="underline underline-offset-4" rel="noreferrer">
        {attribution}
      </a>
    </p>
  )
}
