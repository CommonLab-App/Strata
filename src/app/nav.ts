import { Gem, Globe, House, Info, Settings } from 'lucide-react'

/** The app pages, as the navigation rail lists them. */
export const NAV = [
  { to: '/', label: 'Home', icon: House },
  { to: '/week/1', label: 'This week', icon: Globe },
  { to: '/explore/minerals', label: 'Minerals', icon: Gem },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
]
