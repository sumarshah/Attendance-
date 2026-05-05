import { useEffect, useMemo, useState } from 'react'
import OsmGeofencePicker from '../components/OsmGeofencePicker'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'

type Project = {
  id: string
  projectCode: string
  projectName: string
  latitude: number | null
  longitude: number | null
  geofenceRadius: number | null
}

function numOrNull(v: string): number | null {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default function ProjectsAdmin() {
  const [rows, setRows] = useState<Project[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [projectCode, setProjectCode] = useState('PRJ001')
  const [projectName, setProjectName] = useState('Dubai Site A')
  const [geofenceEnabled, setGeofenceEnabled] = useState(true)
  const [radiusMeters, setRadiusMeters] = useState('100')
  const [lat, setLat] = useState('25.2048')
  const [lng, setLng] = useState('55.2708')

  const defaultCenter = useMemo(() => ({ lat: 25.2048, lng: 55.2708 }), [])

  function resetToCreate() {
    setMode('create')
    setEditingId(null)
    setProjectCode('PRJ001')
    setProjectName('New Project')
    setGeofenceEnabled(true)
    setRadiusMeters('100')
    setLat(String(defaultCenter.lat))
    setLng(String(defaultCenter.lng))
  }

  function startEdit(p: Project) {
    setMode('edit')
    setEditingId(p.id)
    setProjectCode(p.projectCode)
    setProjectName(p.projectName)
    setGeofenceEnabled(Boolean(p.geofenceRadius && p.latitude != null && p.longitude != null))
    setRadiusMeters(p.geofenceRadius != null ? String(p.geofenceRadius) : '100')
    setLat(p.latitude != null ? String(p.latitude) : String(defaultCenter.lat))
    setLng(p.longitude != null ? String(p.longitude) : String(defaultCenter.lng))
  }

  async function load() {
    setBusy(true)
    setError(null)
    try {
      const data = await api<Project[]>('/projects')
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    setBusy(true)
    setError(null)
    setSavedMsg(null)
    try {
      const payload: any = {
        projectCode: projectCode.trim(),
        projectName: projectName.trim(),
      }

      if (geofenceEnabled) {
        payload.latitude = numOrNull(lat)
        payload.longitude = numOrNull(lng)
        payload.geofenceRadius = numOrNull(radiusMeters)
      } else {
        // For edits: allow clearing geofence.
        payload.latitude = null
        payload.longitude = null
        payload.geofenceRadius = null
      }

      if (mode === 'create') {
        await api<Project>('/projects', { method: 'POST', body: JSON.stringify(payload) })
        setSavedMsg('Project created.')
        await load()
        resetToCreate()
      } else {
        if (!editingId) throw new Error('Missing editingId')
        await api<Project>(`/projects/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        setSavedMsg('Project updated.')
        await load()
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const marker =
    geofenceEnabled && numOrNull(lat) != null && numOrNull(lng) != null
      ? { lat: Number(lat), lng: Number(lng) }
      : null

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Setup</div>
          <h1 className="h1">Projects (Geofence)</h1>
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
        <div className="panel span7">
          <Section title="Project List">
            {error ? <div className="callout bad">{error}</div> : null}
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Geofence</th>
                    <th>Coordinates</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id}>
                      <td className="mono">{p.projectCode}</td>
                      <td>{p.projectName}</td>
                      <td className="muted">{p.geofenceRadius != null ? `${p.geofenceRadius} m` : '-'}</td>
                      <td className="muted mono">
                        {p.latitude != null && p.longitude != null ? `${p.latitude}, ${p.longitude}` : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btnGhost btnSm" onClick={() => startEdit(p)} disabled={busy}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td className="muted" colSpan={5}>
                        No projects yet. Click <span className="mono">New</span> to create one.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        <div className="panel span5">
          <Section title={mode === 'create' ? 'Create Project' : 'Edit Project'}>
            {savedMsg ? <div className="callout good">{savedMsg}</div> : null}

            <div className="formGrid">
              <label className="field">
                <div className="fieldLabel">Project Code</div>
                <input className="input" value={projectCode} onChange={(e) => setProjectCode(e.target.value)} />
              </label>
              <label className="field">
                <div className="fieldLabel">Project Name</div>
                <input className="input" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              </label>

              <label className="field" style={{ gridColumn: '1 / -1', marginTop: 2 }}>
                <div className="fieldLabel">Geofence</div>
                <select
                  className="input"
                  value={geofenceEnabled ? 'ON' : 'OFF'}
                  onChange={(e) => setGeofenceEnabled(e.target.value === 'ON')}
                >
                  <option value="ON">Enabled</option>
                  <option value="OFF">Disabled</option>
                </select>
              </label>

              {geofenceEnabled ? (
                <>
                  <label className="field">
                    <div className="fieldLabel">Radius (meters)</div>
                    <input
                      className="input"
                      value={radiusMeters}
                      onChange={(e) => setRadiusMeters(e.target.value)}
                      inputMode="numeric"
                    />
                  </label>
                  <label className="field">
                    <div className="fieldLabel">Latitude</div>
                    <input className="input" value={lat} onChange={(e) => setLat(e.target.value)} />
                  </label>
                  <label className="field">
                    <div className="fieldLabel">Longitude</div>
                    <input className="input" value={lng} onChange={(e) => setLng(e.target.value)} />
                  </label>
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <OsmGeofencePicker
                      center={defaultCenter}
                      radiusMeters={numOrNull(radiusMeters) ?? 100}
                      marker={marker}
                      onChange={(next) => {
                        setLat(String(next.lat))
                        setLng(String(next.lng))
                      }}
                    />
                  </div>
                </>
              ) : null}
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btnPrimary" onClick={save} disabled={busy}>
                {mode === 'create' ? 'Create' : 'Save'}
              </button>
              {mode === 'edit' ? (
                <button className="btn btnGhost" onClick={resetToCreate} disabled={busy}>
                  Cancel
                </button>
              ) : null}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
