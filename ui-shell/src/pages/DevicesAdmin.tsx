import { useCallback, useEffect, useState } from 'react'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'
import { useAutoRefresh } from '../lib/useAutoRefresh'

type Device = {
  id: string
  deviceId: string
  deviceName: string
  deviceType: string
  status: boolean
  lastSeenAt: string | null
  bus: { busCode: string; plateNumber: string }
  apiKey?: string
}

type Bus = {
  id: string
  busCode: string
  plateNumber: string
}

export default function DevicesAdmin() {
  const [rows, setRows] = useState<Device[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  const [deviceId, setDeviceId] = useState('BUS-TAB-001')
  const [deviceName, setDeviceName] = useState('Bus Tablet 001')
  const [deviceType, setDeviceType] = useState('ANDROID_TABLET')
  const [busId, setBusId] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const data = await api<Device[]>('/devices')
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }, [])

  const loadBuses = useCallback(async () => {
    try {
      const data = await api<Bus[]>('/buses')
      setBuses(data)
      if (!busId && data.length > 0) setBusId(data[0].id)
    } catch {
      // ignore
    }
  }, [busId])

  async function create() {
    setBusy(true)
    setError(null)
    setCreatedKey(null)
    try {
      const data = await api<Device>('/devices', {
        method: 'POST',
        body: JSON.stringify({
          deviceId: deviceId.trim(),
          deviceName: deviceName.trim(),
          deviceType: deviceType.trim(),
          busId: busId.trim(),
          status: true,
        }),
      })
      setCreatedKey((data as any).apiKey ?? null)
      await load()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
    loadBuses()
  }, [load, loadBuses])

  useAutoRefresh(load, 10_000)

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Admin</div>
          <h1 className="h1">Devices</h1>
        </div>
        <div className="pageHeaderActions">
          <button className="btn btnGhost btnSm" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <div className="dashGrid">
        <div className="panel span4">
          <Section title="Register Device">
            <div className="formGrid">
              <label className="field">
                <div className="fieldLabel">Device ID</div>
                <input className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Device Name</div>
                <input className="input" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Device Type</div>
                <input className="input" value={deviceType} onChange={(e) => setDeviceType(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Bus</div>
                <select className="input" value={busId} onChange={(e) => setBusId(e.target.value)}>
                  <option value="">Select bus</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busCode} ({b.plateNumber})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="btn btnPrimary" onClick={create} disabled={busy}>
                Create Device + Key
              </button>
            </div>

            {createdKey ? (
              <div className="callout good">
                Save this device key (shown once):
                <div className="mono" style={{ marginTop: 8, wordBreak: 'break-all' }}>
                  {createdKey}
                </div>
              </div>
            ) : null}
            {error ? <div className="callout bad">{error}</div> : null}
          </Section>
        </div>

        <div className="panel span8">
          <Section title="Registered Devices">
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Bus</th>
                    <th>Status</th>
                    <th>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{d.deviceName}</div>
                        <div className="muted mono" style={{ fontSize: 12 }}>
                          {d.deviceId} · {d.deviceType}
                        </div>
                      </td>
                      <td className="muted">{d.bus ? `${d.bus.busCode} (${d.bus.plateNumber})` : '-'}</td>
                      <td className="muted">{d.status ? 'ACTIVE' : 'INACTIVE'}</td>
                      <td className="muted mono">{d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString() : '-'}</td>
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

