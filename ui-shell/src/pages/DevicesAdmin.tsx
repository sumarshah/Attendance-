import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'
import { useAutoRefresh } from '../lib/useAutoRefresh'

type Device = {
  id: string
  deviceId: string
  deviceName: string
  deviceType: string
  busId?: string
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

  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [deviceId, setDeviceId] = useState('BUS-TAB-001')
  const [deviceName, setDeviceName] = useState('Bus Tablet 001')
  const [deviceType, setDeviceType] = useState('ANDROID_TABLET')
  const [busId, setBusId] = useState('')
  const [status, setStatus] = useState(true)

  const editingDevice = useMemo(
    () => (editingId ? rows.find((r) => r.id === editingId) ?? null : null),
    [editingId, rows],
  )

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

  function resetToCreate() {
    setMode('create')
    setEditingId(null)
    setCreatedKey(null)
    setError(null)
    setDeviceId('BUS-TAB-001')
    setDeviceName('Bus Tablet 001')
    setDeviceType('ANDROID_TABLET')
    setStatus(true)
    if (buses.length > 0) setBusId(buses[0].id)
  }

  function startEdit(d: Device) {
    setMode('edit')
    setEditingId(d.id)
    setCreatedKey(null)
    setError(null)
    setDeviceId(d.deviceId)
    setDeviceName(d.deviceName)
    setDeviceType(d.deviceType)
    setStatus(Boolean(d.status))
    if (d.busId) setBusId(d.busId)
  }

  async function save(e?: FormEvent) {
    if (e) e.preventDefault()
    setBusy(true)
    setError(null)
    setCreatedKey(null)
    try {
      const payload = {
        deviceId: deviceId.trim(),
        deviceName: deviceName.trim(),
        deviceType: deviceType.trim(),
        busId: busId.trim(),
        status,
      }

      if (mode === 'create') {
        const data = await api<Device>('/devices', { method: 'POST', body: JSON.stringify(payload) })
        setCreatedKey((data as any).apiKey ?? null)
      } else {
        if (!editingId) throw new Error('Missing editingId')
        await api<Device>(`/devices/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      }

      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function remove(d: Device) {
    if (!confirm('Are you sure you want to delete this record?')) return
    setBusy(true)
    setError(null)
    setCreatedKey(null)
    try {
      await api(`/devices/${d.id}`, { method: 'DELETE' })
      if (editingId === d.id) resetToCreate()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unknown error')
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
          <button className="btn btnGhost btnSm" onClick={resetToCreate} disabled={busy}>
            New
          </button>
          <button className="btn btnGhost btnSm" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <div className="dashGrid">
        <div className="panel span4">
          <Section title={mode === 'create' ? 'Register Device' : 'Edit Device'}>
            <form onSubmit={save}>
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
                <label className="field" style={{ gridColumn: '1 / -1' }}>
                  <div className="fieldLabel">Status</div>
                  <select
                    className="input"
                    value={status ? 'ACTIVE' : 'INACTIVE'}
                    onChange={(e) => setStatus(e.target.value === 'ACTIVE')}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </label>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btnPrimary" type="submit" disabled={busy}>
                  {mode === 'create' ? 'Create Device + Key' : 'Save'}
                </button>
                {mode === 'edit' ? (
                  <>
                    <button className="btn btnGhost" type="button" onClick={resetToCreate} disabled={busy}>
                      Cancel
                    </button>
                    {editingDevice ? (
                      <button className="btn btnDanger" type="button" onClick={() => remove(editingDevice)} disabled={busy}>
                        Delete
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </form>

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
                    <th />
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
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn btnGhost btnSm" onClick={() => startEdit(d)} disabled={busy}>
                            Edit
                          </button>
                          <button className="btn btnDanger btnSm" onClick={() => remove(d)} disabled={busy}>
                            Delete
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
    </div>
  )
}
