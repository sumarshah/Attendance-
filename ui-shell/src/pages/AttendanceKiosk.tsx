import { useState } from 'react'
import Section from '../components/Section'
import Icon from '../components/Icon'
import { api, ApiError } from '../lib/api'

type PunchType = 'IN' | 'OUT'
type AuthMethod = 'FACE' | 'FINGER'

export default function AttendanceKiosk() {
  const [deviceId, setDeviceId] = useState('BUS-TAB-001')
  const [deviceKey, setDeviceKey] = useState('')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('FACE')
  const [employeeCode, setEmployeeCode] = useState('EMP001')
  const [identifierValue, setIdentifierValue] = useState('FACE-EMP001')
  const [projectId, setProjectId] = useState('')
  const [lat, setLat] = useState('25.2048')
  const [lng, setLng] = useState('55.2708')
  const [acc, setAcc] = useState('15')
  const [notes, setNotes] = useState('Bus kiosk punch')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const identifierType = authMethod === 'FACE' ? 'FACE_ID' : 'FINGER_ID'

  function makeNonce() {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  async function submit(punchType: PunchType) {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const body = {
        deviceId,
        nonce: makeNonce(),
        sentAt: new Date().toISOString(),
        punchType,
        authMethod,
        employeeCode: employeeCode.trim() || undefined,
        identifierType,
        identifierValue: identifierValue.trim() || undefined,
        projectId: projectId.trim() || undefined,
        latitude: lat.trim() ? Number(lat) : undefined,
        longitude: lng.trim() ? Number(lng) : undefined,
        gpsAccuracy: acc.trim() ? Number(acc) : undefined,
        notes: notes.trim() || undefined,
      }

      const data = await api<any>('/device-attendance/punch', {
        method: 'POST',
        headers: deviceKey ? { 'x-device-key': deviceKey } : {},
        body: JSON.stringify(body),
      })
      setResult(data)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Unknown error'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Attendance</div>
          <h1 className="h1">Bus Kiosk Punch (Reader Mode)</h1>
        </div>
        <div className="pageHeaderActions">
          <button className="btn btnGhost btnSm" onClick={() => submit('IN')} disabled={busy}>
            <span className="btnRow">
              <Icon name="clock" /> Test IN
            </span>
          </button>
          <button className="btn btnAccent btnSm" onClick={() => submit('OUT')} disabled={busy}>
            <span className="btnRow">
              <Icon name="arrowUpRight" /> Test OUT
            </span>
          </button>
        </div>
      </div>

      <div className="dashGrid">
        <div className="panel span8">
          <Section title="Punch Input (Kiosk)">
            <div className="formGrid">
              <label className="field">
                <div className="fieldLabel">Device ID</div>
                <input className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
              </label>

              <label className="field">
                <div className="fieldLabel">Device Key (x-device-key)</div>
                <input
                  className="input"
                  value={deviceKey}
                  onChange={(e) => setDeviceKey(e.target.value)}
                  placeholder="Leave empty only if device has no apiKeyHash"
                />
              </label>

              <label className="field">
                <div className="fieldLabel">Auth Method</div>
                <select className="input" value={authMethod} onChange={(e) => setAuthMethod(e.target.value as any)}>
                  <option value="FACE">FACE</option>
                  <option value="FINGER">FINGER</option>
                </select>
              </label>

              <label className="field">
                <div className="fieldLabel">Employee Code (fallback)</div>
                <input className="input" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} />
              </label>

              <label className="field">
                <div className="fieldLabel">
                  Identifier Value ({identifierType})
                </div>
                <input
                  className="input"
                  value={identifierValue}
                  onChange={(e) => setIdentifierValue(e.target.value)}
                  placeholder="Face/Finger template id from the reader"
                />
              </label>

              <label className="field">
                <div className="fieldLabel">Project ID (optional)</div>
                <input
                  className="input"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="If multiple allocations exist"
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

              <label className="field">
                <div className="fieldLabel">GPS Accuracy (meters)</div>
                <input className="input" value={acc} onChange={(e) => setAcc(e.target.value)} />
              </label>

              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="fieldLabel">Notes</div>
                <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </label>
            </div>

            {error ? <div className="callout bad">{error}</div> : null}
            {result ? (
              <div className="callout good">
                Punch saved: <span className="mono">{result?.id}</span>
              </div>
            ) : null}
          </Section>
        </div>
      </div>
    </div>
  )
}
