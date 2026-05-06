import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
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

  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [busCode, setBusCode] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [driverName, setDriverName] = useState('')

  const editingBus = useMemo(() => (editingId ? rows.find((r) => r.id === editingId) ?? null : null), [editingId, rows])

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

  function resetToCreate() {
    setMode('create')
    setEditingId(null)
    setBusCode('')
    setPlateNumber('')
    setDriverName('')
    setCreatedMsg(null)
    setError(null)
  }

  function startEdit(b: Bus) {
    setMode('edit')
    setEditingId(b.id)
    setBusCode(b.busCode)
    setPlateNumber(b.plateNumber)
    setDriverName(b.driverName ?? '')
    setCreatedMsg(null)
    setError(null)
  }

  async function save(e?: FormEvent) {
    if (e) e.preventDefault()
    setBusy(true)
    setError(null)
    setCreatedMsg(null)
    try {
      const payload = {
        busCode: busCode.trim(),
        plateNumber: plateNumber.trim(),
        driverName: driverName.trim() ? driverName.trim() : undefined,
      }

      if (mode === 'create') {
        await api<Bus>('/buses', { method: 'POST', body: JSON.stringify(payload) })
        setCreatedMsg('Bus created.')
        resetToCreate()
        await load()
      } else {
        if (!editingId) throw new Error('Missing editingId')
        await api<Bus>(`/buses/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        setCreatedMsg('Bus updated.')
        await load()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function remove(bus: Bus) {
    if (!confirm('Are you sure you want to delete this record?')) return
    setBusy(true)
    setError(null)
    setCreatedMsg(null)
    try {
      await api(`/buses/${bus.id}`, { method: 'DELETE' })
      if (editingId === bus.id) resetToCreate()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Setup</div>
          <h1 className="h1">Buses</h1>
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
          <Section title={mode === 'create' ? 'Add Bus' : 'Edit Bus'}>
            {createdMsg ? <div className="callout good">{createdMsg}</div> : null}
            {error ? <div className="callout bad">{error}</div> : null}

            <form onSubmit={save}>
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

              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btnPrimary" disabled={busy} type="submit">
                  {mode === 'create' ? 'Create' : 'Save'}
                </button>
                {mode === 'edit' ? (
                  <>
                    <button className="btn btnGhost" type="button" onClick={resetToCreate} disabled={busy}>
                      Cancel
                    </button>
                    {editingBus ? (
                      <button className="btn btnDanger" type="button" onClick={() => remove(editingBus)} disabled={busy}>
                        Delete
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </form>
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
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.id}>
                      <td className="mono">{b.busCode}</td>
                      <td className="mono">{b.plateNumber}</td>
                      <td className="muted">{b.driverName ?? '-'}</td>
                      <td className="mono muted" style={{ fontSize: 12 }}>{b.id}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn btnGhost btnSm" onClick={() => startEdit(b)} disabled={busy}>
                            Edit
                          </button>
                          <button className="btn btnDanger btnSm" onClick={() => remove(b)} disabled={busy}>
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
