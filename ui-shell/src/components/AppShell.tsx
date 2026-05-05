import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { SCREENS } from '../router/screens'
import Icon from './Icon'
import rccLogoUrl from '../assets/rcc-logo-2018.png'
import { NAV_SECTIONS } from '../router/nav'
import { api } from '../lib/api'

export default function AppShell() {
  const loc = useLocation()
  const nav = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const [me, setMe] = useState<{ role?: string; permissions?: string[] } | null>(null)
  const navMatch = useMemo(() => {
    for (const sec of NAV_SECTIONS) {
      for (const item of sec.items) {
        if (item.path === loc.pathname) return { section: sec.title, title: item.title }
      }
    }
    return null
  }, [loc.pathname])

  const stubMatch = useMemo(() => SCREENS.find((s) => s.path === loc.pathname) ?? null, [loc.pathname])
  const title = loc.pathname === '/' ? 'Dashboard' : navMatch?.title ?? stubMatch?.title ?? 'BIOTIME'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return NAV_SECTIONS
    return NAV_SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter((it) => `${it.title} ${sec.title}`.toLowerCase().includes(q)),
    })).filter((sec) => sec.items.length > 0)
  }, [query])

  const defaultSectionOpen = (title: string) => {
    // Keep the sidebar compact by default; we auto-open only the section that matches the current route.
    void title
    return false
  }

  const isSectionOpen = (title: string) => {
    if (query.trim()) return true
    const v = openGroups[title]
    return v == null ? defaultSectionOpen(title) : v
  }

  useEffect(() => {
    // If the user navigates via direct URL, expand the section containing it.
    if (query.trim()) return
    const sec = NAV_SECTIONS.find((s) => s.items.some((i) => i.path === loc.pathname))
    if (!sec) return
    if (isSectionOpen(sec.title)) return
    // Accordion behavior: open the matching section and close others.
    setOpenGroups({ [sec.title]: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname, query])

  useEffect(() => {
    // Close mobile sidebar after navigation.
    setMobileOpen(false)
  }, [loc.pathname])

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!profileOpen) return
      const el = profileRef.current
      if (!el) return
      if (el.contains(e.target as any)) return
      setProfileOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [profileOpen])

  useEffect(() => {
    let cancelled = false
    api<{ user: any }>('/auth/me')
      .then((d) => {
        if (cancelled) return
        setMe(d?.user ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setMe(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const can = (path: string, sectionTitle: string) => {
    const role = me?.role
    const perms = new Set((me?.permissions ?? []).map((p) => String(p).toUpperCase()))
    if (role === 'ADMIN') return true

    const has = (...keys: string[]) => keys.some((k) => perms.has(k))

    // Route-based permission checks (more precise than section-level).
    if (path === '/') return has('DASHBOARD')

    if (path === '/attendance-style-01' || path === '/attendance-details') return has('ATTENDANCE', 'REALTIME_MONITOR')
    if (path === '/correction-request' || path === '/approval-checklist') return has('CORRECTIONS')

    if (path === '/timesheet') return has('TIMESHEETS', 'TIMESHEET')
    if (path === '/team-members') return has('EMPLOYEES')

    if (path === '/projects') return has('PROJECTS')
    if (path === '/buses') return has('BUSES')
    if (path === '/devices') return has('DEVICES')
    if (path === '/exceptions') return has('EXCEPTIONS')

    // User management is admin-controlled on the backend. Hide for non-admins.
    if (path === '/settings' || sectionTitle === 'Settings') return false

    return true
  }

  const sectionIcon = (title: string) => {
    if (title === 'Attendance') return 'clock' as const
    if (title === 'Timesheet') return 'shield' as const
    if (title === 'Employees') return 'users' as const
    if (title === 'Setup') return 'mapPin' as const
    if (title === 'Monitoring') return 'bell' as const
    if (title === 'Settings') return 'shield' as const
    return 'chevronRight' as const
  }

  return (
    <div className={`shell ${mobileOpen ? 'isMobileOpen' : ''}`}>
      <aside className="sidebar">
        <div className="brand brandLogoOnly">
          <NavLink to="/" aria-label="Go to Dashboard">
            <img src={rccLogoUrl} alt="RCC" className="brandLogoOnlyImg brandLogoLink" />
          </NavLink>
        </div>

        <nav className="nav">
          <div className="navTools">
            <div className="search">
              <Icon name="search" />
              <input
                className="searchInput"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search screens..."
                aria-label="Search screens"
              />
              {query ? (
                <button type="button" className="iconBtn" onClick={() => setQuery('')} aria-label="Clear search">
                  <Icon name="x" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="navPinned">
            <NavLink to="/" className={({ isActive }) => `navItem navItemPinned ${isActive ? 'isActive' : ''}`} end>
              <span className="navText">Dashboard</span>
            </NavLink>
          </div>

          {filtered
            .map((sec) => ({
              ...sec,
              items: sec.items.filter((it) => can(it.path, sec.title)),
            }))
            .filter((sec) => sec.items.length > 0)
            .map((sec) => {
            const open = isSectionOpen(sec.title)
            return (
              <div key={sec.title} className="navGroup">
                <button
                  type="button"
                  className="navGroupTitle"
                  onClick={() => {
                    // Accordion behavior: only one open at a time.
                    if (open) setOpenGroups({})
                    else setOpenGroups({ [sec.title]: true })
                  }}
                  aria-expanded={open}
                >
                  <span className="navGroupLeft">
                    <span className="navGroupIcon" aria-hidden="true">
                      <Icon name={sectionIcon(sec.title)} />
                    </span>
                    <span className="navGroupTitleText">{sec.title}</span>
                  </span>
                  <span className={`navGroupChevron ${open ? 'isOpen' : ''}`} aria-hidden="true">
                    <Icon name="chevronRight" />
                  </span>
                </button>
                <div className={`navGroupItems ${open ? 'isOpen' : ''}`}>
                  {sec.items.map((s) => (
                    <NavLink
                      key={s.path}
                      to={s.path}
                      className={({ isActive }) => `navItem ${isActive ? 'isActive' : ''}`}
                      end
                    >
                      <span className="navText">{s.title}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbarLeft">
            <button
              type="button"
              className="iconBtn showOnMobile"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <Icon name="menu" />
            </button>
            <div className="topbarTitle">
              <div className="crumbs">
                <span className="crumb">RCC</span>
                <span className="crumbSep">/</span>
                <span className="crumbCurrent">{loc.pathname === '/' ? 'Dashboard' : navMatch?.section ?? stubMatch?.group ?? 'Dashboard'}</span>
              </div>
              <div className="topbarTitleMain">{title}</div>
            </div>
          </div>

          <div className="topbarRight">
            <button type="button" className="iconBtn" aria-label="Notifications">
              <Icon name="bell" />
            </button>

            <div className="profileWrap" ref={profileRef}>
              <button
                type="button"
                className="profileChip"
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <div className="avatar" aria-hidden="true">
                  <span>AD</span>
                </div>
                <div className="profileChipText">
                  <div className="profileName">Admin</div>
                  <div className="profileRole">Supervisor</div>
                </div>
                <Icon name="chevronDown" />
              </button>

              {profileOpen ? (
                <div className="profileMenu" role="menu" aria-label="Admin menu">
                  <button className="profileMenuItem" type="button" role="menuitem" onClick={() => { setProfileOpen(false); nav('/profile') }}>
                    <Icon name="users" /> <span>Profile</span>
                  </button>
                  <button className="profileMenuItem" type="button" role="menuitem" onClick={() => { setProfileOpen(false); nav('/settings') }}>
                    <Icon name="shield" /> <span>Settings</span>
                  </button>
                  <div className="profileMenuSep" role="separator" />
                  <button className="profileMenuItem danger" type="button" role="menuitem" onClick={() => { setProfileOpen(false); nav('/logout') }}>
                    <Icon name="arrowUpRight" /> <span>Logout</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
