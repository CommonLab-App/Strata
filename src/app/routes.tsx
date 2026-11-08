import type { RouteObject } from 'react-router'
import { Layout } from '@/app/Layout'
import { About } from '@/app/pages/About'
import { Home } from '@/app/pages/Home'
import { NotFound } from '@/app/pages/NotFound'
import { Settings } from '@/app/pages/Settings'

// Every address of the app. Each week loads lazily so its content, and later the globe, stay out of the main chunk.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    hydrateFallbackElement: <p className="p-6 text-muted-foreground">Loading…</p>,
    children: [
      { index: true, element: <Home /> },
      // A week's Learn, Explore, Lab and Check panes, one lazy chunk per week; the globe engine is a further chunk the Explore pane loads itself.
      { path: 'week/:week/:tab?', lazy: async () => ({ Component: (await import('@/app/week/WeekPage')).WeekPage }) },
      { path: 'settings', element: <Settings /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
