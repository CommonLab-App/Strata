import type { RouteObject } from 'react-router'
import { Layout } from '@/app/Layout'
import { About } from '@/app/pages/About'
import { Home } from '@/app/pages/Home'
import { NotFound } from '@/app/pages/NotFound'
import { Settings } from '@/app/pages/Settings'
import { WeekPage } from '@/app/week/WeekPage'

// Every address of the app. Each week loads lazily so its content, and later the globe, stay out of the main chunk.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    hydrateFallbackElement: <p className="p-6 text-muted-foreground">Loading…</p>,
    children: [
      { index: true, element: <Home /> },
      // A week's Learn, Explore, Lab and Check panes. In the main chunk while there is one week: a lazy chunk would cost a
      // round trip before the pane's text can paint. The globe engine is a chunk of its own that the Explore pane loads itself.
      { path: 'week/:week/:tab?', element: <WeekPage /> },
      { path: 'settings', element: <Settings /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
