export type NavItem = {
  title: string
  path: string
}

export type NavSection = {
  title: string
  items: NavItem[]
}

// Keep the sidebar focused on real working modules (no 77-stub list).
export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Attendance',
    items: [
      { title: 'Bus Kiosk Punch', path: '/attendance-style-01' },
      { title: 'Live Punches', path: '/attendance-details' },
      { title: 'Correction Request', path: '/correction-request' },
      { title: 'Approval Checklist', path: '/approval-checklist' },
    ],
  },
  {
    title: 'Timesheet',
    items: [{ title: 'Daily Timesheet', path: '/timesheet' }],
  },
  {
    title: 'Employees',
    items: [{ title: 'Team Members', path: '/team-members' }],
  },
  {
    title: 'Setup',
    items: [
      { title: 'Projects', path: '/projects' },
      { title: 'Buses', path: '/buses' },
      { title: 'Device Registry', path: '/devices' },
    ],
  },
  {
    title: 'Monitoring',
    items: [{ title: 'Exceptions', path: '/exceptions' }],
  },
  {
    title: 'Settings',
    items: [{ title: 'User Management', path: '/settings' }],
  },
]
