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
}

export default function CorrectionsApproval() {
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setBusy(true)
    setError(null)
    try {
      const data = await api<Row[]>('/corrections?status=PENDING')
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function approve(id: string) {
    setBusy(true)
    setError(null)
    try {
      await api(`/corrections/${id}/approve`, { method: 'POST', body: JSON.stringify({ note: 'Approved' }) })
      await load()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function reject(id: string) {
    setBusy(true)
    setError(null)
    try {
      await api(`/corrections/${id}/reject`, { method: 'POST', body: JSON.stringify({ note: 'Rejected' }) })
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
          <div className="kicker">Approval</div>
          <h1 className="h1">Approval Checklist</h1>
        </div>
        <div className="pageHeaderActions">
          <button className="btn btnGhost btnSm" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <div className="panel">
        <Section title="Pending Correction Requests">
          {error ? <div className="callout bad">{error}</div> : null}
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Project</th>
                  <th>Request</th>
                  <th>Reason</th>
                  <th>Action</th>
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
                    <td className="mono muted">
                      IN: {r.requestedInAt ? new Date(r.requestedInAt).toLocaleTimeString() : '-'} | OUT:{' '}
                      {r.requestedOutAt ? new Date(r.requestedOutAt).toLocaleTimeString() : '-'}
                    </td>
                    <td>{r.reason}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn btnPrimary btnSm" onClick={() => approve(r.id)} disabled={busy}>
                          Approve
                        </button>
                        <button className="btn btnGhost btnSm" onClick={() => reject(r.id)} disabled={busy}>
                          Reject
                        </button>
                      </div>
                    </td>
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

