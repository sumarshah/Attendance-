import { useEffect, useState } from 'react'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'

type Row = {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  date: string
  requestedInAt: string | null
  requestedOutAt: string | null
  reason: string
  employee: { employeeCode: string; fullName: string }
  project: { projectCode: string; projectName: string }
  createdAt: string
}

export default function CorrectionsRequest() {
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [employeeId, setEmployeeId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [busId, setBusId] = useState('')
  const [date, setDate] = useState(new Date().toISOString())
  const [requestedInAt, setRequestedInAt] = useState('')
  const [requestedOutAt, setRequestedOutAt] = useState('')
  const [reason, setReason] = useState('Missed punch / wrong time')

  async function load() {
    setBusy(true)
    setError(null)
    try {
      const data = await api<Row[]>('/corrections')
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function create() {
    setBusy(true)
    setError(null)
    try {
      await api('/corrections', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: employeeId.trim(),
          projectId: projectId.trim(),
          busId: busId.trim() || undefined,
          date,
          requestedInAt: requestedInAt.trim() || undefined,
          requestedOutAt: requestedOutAt.trim() || undefined,
          reason,
        }),
      })
      await load()
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
          <h1 className="h1">Correction Request (Regularization)</h1>
        </div>
        <div className="pageHeaderActions">
          <button className="btn btnGhost btnSm" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <div className="dashGrid">
        <div className="panel span4">
          <Section title="Create Request">
            <div className="formGrid">
              <label className="field">
                <div className="fieldLabel">Employee ID</div>
                <input className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Project ID</div>
                <input className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Bus ID (optional)</div>
                <input className="input" value={busId} onChange={(e) => setBusId(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Date (ISO)</div>
                <input className="input" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Requested IN (ISO, optional)</div>
                <input className="input" value={requestedInAt} onChange={(e) => setRequestedInAt(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Requested OUT (ISO, optional)</div>
                <input className="input" value={requestedOutAt} onChange={(e) => setRequestedOutAt(e.target.value)} />
              </label>
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="fieldLabel">Reason</div>
                <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
              </label>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btnPrimary" onClick={create} disabled={busy}>
                Submit
              </button>
            </div>
            {error ? <div className="callout bad">{error}</div> : null}
          </Section>
        </div>

        <div className="panel span8">
          <Section title="Requests">
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Project</th>
                    <th>IN</th>
                    <th>OUT</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="mono muted">{new Date(r.date).toISOString().slice(0, 10)}</td>
                      <td>
                        {r.employee.fullName}
                        <div className="muted mono" style={{ fontSize: 12 }}>
                          {r.employee.employeeCode}
                        </div>
                      </td>
                      <td className="muted">{r.project.projectName}</td>
                      <td className="mono muted">{r.requestedInAt ? new Date(r.requestedInAt).toLocaleTimeString() : '-'}</td>
                      <td className="mono muted">{r.requestedOutAt ? new Date(r.requestedOutAt).toLocaleTimeString() : '-'}</td>
                      <td className="muted">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

