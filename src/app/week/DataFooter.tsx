import type { Snapshot } from '@/data/adapters/types'

/** Under any live layer: when its data was fetched and where from. */
export function DataFooter({ snapshot, attribution }: { snapshot: Snapshot<unknown>; attribution: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      Data as of <time dateTime={snapshot.fetched_at}>{new Date(snapshot.fetched_at).toLocaleString()}</time>, source:{' '}
      <a href={snapshot.source_url} className="underline underline-offset-4" rel="noreferrer">
        {attribution}
      </a>
    </p>
  )
}
