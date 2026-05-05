import { useEffect, useState } from 'react'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'

type Punch = {
  id: string
  punchType: 'IN' | 'OUT'
  punchedAt: string
  latitude: number | null
  longitude: number | null
  deviceId: string | null
  notes: string | null
  employee: { employeeCode: string; fullName: string }
  project: { projectCode: string; projectName: string }
  bus: { busCode: string; plateNumber: string } | null
}

export default function AttendanceLive() {
  const [rows, setRows] = useState<Punch[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setBusy(true)
    setError(null)
    try {
      const now = new Date()
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      const data = await api<Punch[]>(
        `/attendance?dateFrom=${encodeURIComponent(start.toISOString())}&dateTo=${encodeURIComponent(end.toISOString())}&take=500`,
      )
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Attendance</div>
          <h1 className="h1">Attendance Live</h1>
        </div>
        <div className="pageHeaderActions">
          <button className="btn btnGhost btnSm" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <div className="panel">
        <Section title="Punches (Latest First)">
          {error ? <div className="callout bad">{error}</div> : null}
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Employee</th>
                  <th>Project</th>
                  <th>Punch</th>
                  <th>Bus</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 80).map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{new Date(p.punchedAt).toLocaleString()}</td>
                    <td>
                      {p.employee.fullName}
                      <div className="muted" style={{ fontSize: 12 }}>
                        {p.employee.employeeCode}
                      </div>
                    </td>
                    <td>
                      {p.project.projectName}
                      <div className="muted" style={{ fontSize: 12 }}>
                        {p.project.projectCode}
                      </div>
                    </td>
                    <td>
                      <span className={`pill pillPunch ${p.punchType === 'IN' ? 'isIn' : 'isOut'}`}>{p.punchType}</span>
                    </td>
                    <td className="muted">{p.bus ? `${p.bus.busCode} (${p.bus.plateNumber})` : '-'}</td>
                    <td className="muted">{p.deviceId ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  )
}
