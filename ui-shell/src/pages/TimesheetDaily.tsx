import { useCallback, useState } from 'react'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'
import { useAutoRefresh } from '../lib/useAutoRefresh'

type Row = {
  date: string
  employeeCode: string
  fullName: string
  projectCode: string
  projectName: string
  busCode: string | null
  inTime: string | null
  outTime: string | null
  workedMinutes: number
  status: string
}

function todayIso() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export default function TimesheetDaily() {
  const [date, setDate] = useState(todayIso())
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const data = await api<Row[]>(`/timesheets/daily?date=${encodeURIComponent(date)}`)
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }, [date])

  useAutoRefresh(load, 10_000)

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Timesheet</div>
          <h1 className="h1">Daily Timesheet</h1>
        </div>
        <div className="pageHeaderActions">
          <input className="input" style={{ width: 180 }} value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btnPrimary btnSm" onClick={load} disabled={busy}>
            Load
          </button>
          <button className="btn btnGhost btnSm" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <div className="panel">
        <Section title="Daily Summary (Uses Approved Corrections)">
          {error ? <div className="callout bad">{error}</div> : null}
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Project</th>
                  <th>Bus</th>
                  <th>IN</th>
                  <th>OUT</th>
                  <th>Minutes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{r.fullName}</div>
                      <div className="muted mono" style={{ fontSize: 12 }}>
                        {r.employeeCode}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{r.projectName}</div>
                      <div className="muted mono" style={{ fontSize: 12 }}>
                        {r.projectCode}
                      </div>
                    </td>
                    <td className="muted">{r.busCode ?? '-'}</td>
                    <td className="mono muted">{r.inTime ? new Date(r.inTime).toLocaleTimeString() : '-'}</td>
                    <td className="mono muted">{r.outTime ? new Date(r.outTime).toLocaleTimeString() : '-'}</td>
                    <td className="mono">{r.workedMinutes}</td>
                    <td className="muted">{r.status}</td>
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
