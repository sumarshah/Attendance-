import { useCallback, useMemo, useState } from 'react'
import PunchStream, { type PunchStreamItem } from '../components/PunchStream'
import Section from '../components/Section'
import { DonutCard, MultiLineCard } from '../components/DashboardViz'
import { api, ApiError } from '../lib/api'
import { useAutoRefresh } from '../lib/useAutoRefresh'

type Employee = { id: string; status: 'ACTIVE' | 'INACTIVE' }
type Bus = { id: string }
type Project = { id: string; geofenceRadius: number | null; latitude: number | null; longitude: number | null }
type Device = { id: string; status: boolean; lastSeenAt: string | null }
type ExceptionRow = { id: string; reason: string; createdAt: string }
type Attendance = {
  id: string
  punchType: 'IN' | 'OUT'
  punchedAt: string
  deviceId: string | null
  employee: { fullName: string }
  project: { projectName: string }
}

export default function Home() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permNote, setPermNote] = useState<string | null>(null)
  const [stream, setStream] = useState<PunchStreamItem[]>([])
  const [today, setToday] = useState({
    activeEmployees: 0,
    presentEmployees: 0,
    devicesOnline: 0,
    devicesOffline: 0,
    projectsGeofenced: 0,
    projectsNotGeofenced: 0,
    approvalsPending: 0,
    approvalsApproved: 0,
    approvalsRejected: 0,
  })
  const [history, setHistory] = useState({
    labels: [] as string[],
    punches: [] as number[],
    geofence: [] as number[],
    duplicate: [] as number[],
  })

  function localDayRange(d: Date) {
    const start = new Date(d)
    start.setHours(0, 0, 0, 0)
    const end = new Date(d)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  const dateWindow = useMemo(() => {
    const days = 14
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    return { start, end, days }
  }, [])

  const load = useCallback(async () => {
    setBusy(true)
    setError(null)
    setPermNote(null)

    try {
      const me = await api<{ user: { role?: string; permissions?: string[] } | null }>('/auth/me')
      const role = me?.user?.role?.toUpperCase() ?? ''
      const perms = new Set((me?.user?.permissions ?? []).map((p) => String(p).toUpperCase()))
      const has = (...keys: string[]) => role === 'ADMIN' || keys.some((k) => perms.has(k))

      const dateFrom = dateWindow.start.toISOString()
      const dateTo = dateWindow.end.toISOString()

      const now = new Date()
      const { start: todayStart, end: todayEnd } = localDayRange(now)
      const todayFrom = todayStart.toISOString()
      const todayTo = todayEnd.toISOString()

      const missing: string[] = []

      const employees = has('EMPLOYEES') ? await api<Employee[]>('/employees') : (missing.push('Employees'), [] as Employee[])
      const projects = has('PROJECTS') ? await api<Project[]>('/projects') : (missing.push('Projects'), [] as Project[])
      const devices = has('DEVICES') ? await api<Device[]>('/devices') : (missing.push('Devices'), [] as Device[])

      const attendance14 = has('ATTENDANCE', 'REALTIME_MONITOR')
        ? await api<Attendance[]>(`/attendance?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}&take=1000`)
        : (missing.push('Attendance'), [] as Attendance[])

      const attendanceToday = has('ATTENDANCE', 'REALTIME_MONITOR')
        ? await api<Attendance[]>(`/attendance?dateFrom=${encodeURIComponent(todayFrom)}&dateTo=${encodeURIComponent(todayTo)}&take=300`)
        : ([] as Attendance[])

      const exceptions = has('EXCEPTIONS')
        ? await api<ExceptionRow[]>(`/exceptions?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`)
        : (missing.push('Exceptions'), [] as ExceptionRow[])

      if (missing.length) {
        setPermNote(`Limited view: missing permission for ${missing.join(', ')}.`)
      }

      const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length
      const geofenced = projects.filter(
        (p) => p.geofenceRadius != null && p.latitude != null && p.longitude != null && p.geofenceRadius > 0,
      ).length
      const todaysIn = attendanceToday.filter((p) => p.punchType === 'IN')

      const presentEmployees = new Set(todaysIn.map((p) => p.employee.fullName)).size

      const onlineWindowMs = 30 * 60 * 1000
      const devicesOnline = devices.filter((d) => {
        if (!d.status) return false
        if (!d.lastSeenAt) return false
        const t = new Date(d.lastSeenAt).getTime()
        return now.getTime() - t <= onlineWindowMs
      }).length
      const devicesOffline = Math.max(0, devices.length - devicesOnline)
      const projectsNotGeofenced = Math.max(0, projects.length - geofenced)

      // History (last 14 days): punches + exceptions by reason.
      const labels: string[] = []
      const punches: number[] = []
      const geofence: number[] = []
      const duplicate: number[] = []

      for (let i = 0; i < dateWindow.days; i++) {
        const d = new Date(dateWindow.start)
        d.setDate(d.getDate() + i)
        const ds = new Date(d)
        ds.setHours(0, 0, 0, 0)
        const de = new Date(d)
        de.setHours(23, 59, 59, 999)

        const lab = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
        labels.push(lab)

        const dayPunches = attendance14.filter((p) => {
          const t = new Date(p.punchedAt).getTime()
          return t >= ds.getTime() && t <= de.getTime()
        }).length
        punches.push(dayPunches)

        const dayGeo = exceptions.filter((ex) => {
          const t = new Date(ex.createdAt).getTime()
          return t >= ds.getTime() && t <= de.getTime() && ex.reason === 'OUTSIDE_GEOFENCE'
        }).length
        geofence.push(dayGeo)

        const dayDup = exceptions.filter((ex) => {
          const t = new Date(ex.createdAt).getTime()
          return t >= ds.getTime() && t <= de.getTime() && ex.reason === 'DUPLICATE_PUNCH'
        }).length
        duplicate.push(dayDup)
      }

      setToday({
        activeEmployees,
        presentEmployees,
        devicesOnline,
        devicesOffline,
        projectsGeofenced: geofenced,
        projectsNotGeofenced,
        approvalsPending: 0,
        approvalsApproved: 0,
        approvalsRejected: 0,
      })
      setHistory({ labels, punches, geofence, duplicate })
      setStream(attendanceToday.slice(0, 80))
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setError('No permission to view dashboard data.')
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard data')
      }
    } finally {
      setBusy(false)
    }
  }, [dateWindow])

  // Auto refresh dashboard (includes punch monitor).
  useAutoRefresh(load, 10_000)

  return (
    <div className="page">
      <div className="dashGrid">
        <div className="panel span12 dashTodayRow">
          <div className="dashTodayTitle">Today</div>
          <div className="dashTodayGrid">
            <DonutCard
              title="Present"
              centerLabel="Attendance"
              centerValue={`${today.presentEmployees}/${today.activeEmployees}`}
              slices={[
                { label: 'Present', value: today.presentEmployees, color: 'rgba(46, 204, 113, 0.95)' },
                { label: 'Absent', value: Math.max(0, today.activeEmployees - today.presentEmployees), color: 'rgba(231, 76, 60, 0.95)' },
              ]}
            />

            <DonutCard
              title="Device Status"
              centerLabel="Devices"
              centerValue={`${today.devicesOnline}/${today.devicesOnline + today.devicesOffline}`}
              slices={[
                { label: 'Online', value: today.devicesOnline, color: 'rgba(46, 204, 113, 0.95)' },
                { label: 'Offline', value: today.devicesOffline, color: 'rgba(243, 156, 18, 0.95)' },
              ]}
            />

            <DonutCard
              title="Schedule"
              centerLabel="Projects"
              centerValue={`${today.projectsGeofenced}/${today.projectsGeofenced + today.projectsNotGeofenced}`}
              slices={[
                { label: 'Geofenced', value: today.projectsGeofenced, color: 'rgba(46, 204, 113, 0.95)' },
                { label: 'Not Geofenced', value: today.projectsNotGeofenced, color: 'rgba(231, 76, 60, 0.95)' },
              ]}
            />

            <DonutCard
              title="Approvals"
              centerLabel="Requests"
              centerValue={`${today.approvalsPending}`}
              slices={[
                { label: 'Approved', value: today.approvalsApproved, color: 'rgba(46, 204, 113, 0.95)' },
                { label: 'Pending', value: today.approvalsPending, color: 'rgba(52, 152, 219, 0.95)' },
                { label: 'Rejected', value: today.approvalsRejected, color: 'rgba(243, 156, 18, 0.95)' },
              ]}
            />
          </div>
        </div>

        <div className="panel span7">
          <Section title="Real-Time Monitor">
            {error ? <div className="callout bad">{error}</div> : null}
            {permNote ? <div className="callout">{permNote}</div> : null}
            <PunchStream items={stream} />
          </Section>
        </div>

        <div className="panel span5">
          <MultiLineCard
            title="Attendance Exception"
            labels={history.labels}
            series={[
              { label: 'Punches', color: 'rgba(52, 152, 219, 0.95)', values: history.punches },
              { label: 'Geofence', color: 'rgba(46, 204, 113, 0.95)', values: history.geofence },
              { label: 'Duplicate', color: 'rgba(243, 156, 18, 0.95)', values: history.duplicate },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
