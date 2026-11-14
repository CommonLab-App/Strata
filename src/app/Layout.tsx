import { NavLink } from 'react-router'
import { Layout as ShellLayout } from '@commonlab/shell'
import { NAV } from './nav'

/** The shared shell's menu rail, with StrataLab's logo at the top and its brand colour on the active page's bar. */
export function Layout() {
  return (
    <ShellLayout
      nav={NAV}
      activeBarClass="before:border-brand"
      top={(expanded) => (
        <NavLink to="/" className="mb-1 flex h-10 items-center rounded-md px-2 outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="StrataLab home">
          {expanded ? (
            <>
              <img src={`${import.meta.env.BASE_URL}brand/header-lockup-light.svg`} alt="StrataLab" className="h-8 dark:hidden" />
              <img src={`${import.meta.env.BASE_URL}brand/header-lockup-dark.svg`} alt="StrataLab" className="hidden h-8 dark:block" />
            </>
          ) : (
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="StrataLab" className="size-7" />
          )}
        </NavLink>
      )}
    />
  )
}
