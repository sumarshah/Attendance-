import { useEffect, useState } from 'react'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'

type ExceptionRow = {
  id: string
  createdAt: string
  reason: string
  message: string
  deviceId: string | null
  resolved: boolean
}

export default function ExceptionsAdmin() {
  const [rows, setRows] = useState<ExceptionRow[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setBusy(true)
    setError(null)
    try {
      const data = await api<ExceptionRow[]>('/exceptions?resolved=false')
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function resolve(id: string) {
    setBusy(true)
    setError(null)
    try {
      await api(`/exceptions/${id}/resolve`, { method: 'POST', body: JSON.stringify({ note: 'Resolved from UI' }) })
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
          <div className="kicker">Admin</div>
          <h1 className="h1">Exceptions</h1>
        </div>
        <div className="pageHeaderActions">
          <button className="btn btnGhost btnSm" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <div className="panel">
        <Section title="Unresolved Exceptions">
          {error ? <div className="callout bad">{error}</div> : null}
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Message</th>
                  <th>Device</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="muted">{r.reason}</td>
                    <td>{r.message}</td>
                    <td className="muted mono">{r.deviceId ?? '-'}</td>
                    <td>
                      <button className="btn btnGhost btnSm" onClick={() => resolve(r.id)} disabled={busy}>
                        Resolve
                      </button>
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

