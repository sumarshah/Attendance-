import { useCallback, useState } from 'react'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'
import { useAutoRefresh } from '../lib/useAutoRefresh'

type Employee = {
  id: string
  employeeCode: string
  fullName: string
  status: 'ACTIVE' | 'INACTIVE'
  phone: string | null
  createdAt: string
}

export default function TeamMembers() {
  const [rows, setRows] = useState<Employee[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdMsg, setCreatedMsg] = useState<string | null>(null)

  const [employeeCode, setEmployeeCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const data = await api<Employee[]>('/employees')
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }, [])

  useAutoRefresh(load, 10_000)

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Team</div>
          <h1 className="h1">Team Members</h1>
        </div>
        <div className="pageHeaderActions">
          <button className="btn btnGhost btnSm" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <div className="dashGrid">
        <div className="panel span4">
          <Section title="Add Employee">
            {createdMsg ? <div className="callout good">{createdMsg}</div> : null}
            {error ? <div className="callout bad">{error}</div> : null}

            <div className="formGrid">
              <label className="field">
                <div className="fieldLabel">Employee Code</div>
                <input className="input" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Full Name</div>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </label>
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="fieldLabel">Phone (optional)</div>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                className="btn btnPrimary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  setError(null)
                  setCreatedMsg(null)
                  try {
                    await api<Employee>('/employees', {
                      method: 'POST',
                      body: JSON.stringify({
                        employeeCode: employeeCode.trim(),
                        fullName: fullName.trim(),
                        phone: phone.trim() ? phone.trim() : undefined,
                      }),
                    })
                    setCreatedMsg('Employee created.')
                    setEmployeeCode('')
                    setFullName('')
                    setPhone('')
                    await load()
                  } catch (e) {
                    setError(e instanceof ApiError ? e.message : 'Unknown error')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Create
              </button>
            </div>
          </Section>
        </div>

        <div className="panel span8">
          <Section title="Employees">
          {error ? <div className="callout bad">{error}</div> : null}
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="mono">{e.employeeCode}</td>
                    <td>{e.fullName}</td>
                    <td className="muted">{e.status}</td>
                    <td className="muted">{e.phone ?? '-'}</td>
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
