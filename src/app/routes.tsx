import { Navigate, useParams, type RouteObject } from 'react-router'
import { Layout } from '@/app/Layout'
import { About } from '@/app/pages/About'
import { Home } from '@/app/pages/Home'
import { NotFound } from '@/app/pages/NotFound'
import { Resources } from '@/app/pages/Resources'
import { Settings } from '@/app/pages/Settings'
import { WeekPage } from '@/app/week/WeekPage'
import { weekPath } from '@/app/weeks'

/** The first links and bookmarks were /week/<n>; they keep working. */
const LegacyWeek = () => {
  const { week, tab } = useParams()
  return <Navigate to={`${weekPath(Number(week))}${tab ? `/${tab}` : ''}`} replace />
}

// Every address of the app. Each topic loads lazily so its content, and later the globe, stay out of the main chunk.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    hydrateFallbackElement: <p className="p-6 text-muted-foreground">Loading…</p>,
    children: [
      { index: true, element: <Home /> },
      // A topic's Learn, Explore, Lab and Check panes. In the main chunk while there is one week: a lazy chunk would cost a
      // round trip before the pane's text can paint. The globe engine is a chunk of its own that the Explore pane loads itself.
      { path: 'topic/:slug/:tab?', element: <WeekPage /> },
      { path: 'week/:week/:tab?', element: <LegacyWeek /> },
      // The Mineral Inspector: the library and its key, or one mineral's card. Its crystal viewer loads Three.js lazily.
      { path: 'explore/minerals/:id?', lazy: async () => ({ Component: (await import('@/app/inspector/MineralInspector')).MineralsPage }) },
      { path: 'explore/rocks/:id?', lazy: async () => ({ Component: (await import('@/app/rocks/RockInspector')).RocksPage }) },
      { path: 'explore/elements/:symbol?', lazy: async () => ({ Component: (await import('@/app/elements/ElementsPage')).ElementsPage }) },
      { path: 'resources', element: <Resources /> },
      { path: 'settings', element: <Settings /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
