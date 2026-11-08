import { Atom, Gem, Globe, House, Info, Map, Settings } from 'lucide-react'

/** The app pages, as the navigation rail lists them. */
export const NAV = [
  { to: '/', label: 'Home', icon: House },
  { to: '/week/1', label: 'This week', icon: Globe },
  { to: '/explore/minerals', label: 'Minerals', icon: Gem },
  { to: '/explore/elements', label: 'Elements', icon: Atom },
  { to: '/resources', label: 'Maps and data', icon: Map },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
]
