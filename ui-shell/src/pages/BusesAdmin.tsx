import { useCallback, useEffect, useState } from 'react'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'
import { useAutoRefresh } from '../lib/useAutoRefresh'

type Bus = {
  id: string
  busCode: string
  plateNumber: string
  driverName: string | null
}

export default function BusesAdmin() {
  const [rows, setRows] = useState<Bus[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdMsg, setCreatedMsg] = useState<string | null>(null)

  const [busCode, setBusCode] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [driverName, setDriverName] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const data = await api<Bus[]>('/buses')
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useAutoRefresh(load, 10_000)

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Setup</div>
          <h1 className="h1">Buses</h1>
        </div>
        <div className="pageHeaderActions">
          <button className="btn btnGhost btnSm" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <div className="dashGrid">
        <div className="panel span4">
          <Section title="Add Bus">
            {createdMsg ? <div className="callout good">{createdMsg}</div> : null}
            {error ? <div className="callout bad">{error}</div> : null}

            <div className="formGrid">
              <label className="field">
                <div className="fieldLabel">Bus Code</div>
                <input className="input" value={busCode} onChange={(e) => setBusCode(e.target.value)} placeholder="BUS001" />
              </label>
              <label className="field">
                <div className="fieldLabel">Plate Number</div>
                <input className="input" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="DXB-12345" />
              </label>
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="fieldLabel">Driver Name (optional)</div>
                <input className="input" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Driver name" />
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
                    await api<Bus>('/buses', {
                      method: 'POST',
                      body: JSON.stringify({
                        busCode: busCode.trim(),
                        plateNumber: plateNumber.trim(),
                        driverName: driverName.trim() ? driverName.trim() : undefined,
                      }),
                    })
                    setCreatedMsg('Bus created.')
                    setBusCode('')
                    setPlateNumber('')
                    setDriverName('')
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
          <Section title="Bus List">
            {error ? <div className="callout bad">{error}</div> : null}
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Bus Code</th>
                    <th>Plate</th>
                    <th>Driver</th>
                    <th>UUID</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.id}>
                      <td className="mono">{b.busCode}</td>
                      <td className="mono">{b.plateNumber}</td>
                      <td className="muted">{b.driverName ?? '-'}</td>
                      <td className="mono muted" style={{ fontSize: 12 }}>{b.id}</td>
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
