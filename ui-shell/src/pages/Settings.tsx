import { useEffect, useMemo, useState } from 'react'
import Section from '../components/Section'
import { api, ApiError } from '../lib/api'

type PermissionKey =
  | 'DASHBOARD'
  | 'ATTENDANCE'
  | 'TIMESHEETS'
  | 'EMPLOYEES'
  | 'PROJECTS'
  | 'BUSES'
  | 'DEVICES'
  | 'ALLOCATIONS'
  | 'EXCEPTIONS'
  | 'CORRECTIONS'
  | 'SETTINGS'
  // Legacy keys kept for backward compatibility (old DB rows).
  | 'REALTIME_MONITOR'
  | 'TIMESHEET'
  | 'ADMIN_ACCESS'

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  permissions: PermissionKey[]
}

export default function Settings() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<UserRow[]>([])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('USER')
  const [perms, setPerms] = useState<Record<PermissionKey, boolean>>(() => ({
    DASHBOARD: true,
    ATTENDANCE: true,
    TIMESHEETS: true,
    EMPLOYEES: true,
    PROJECTS: false,
    BUSES: false,
    DEVICES: false,
    ALLOCATIONS: false,
    EXCEPTIONS: false,
    CORRECTIONS: false,
    SETTINGS: false,
    REALTIME_MONITOR: false,
    TIMESHEET: false,
    ADMIN_ACCESS: false,
  }))

  async function load() {
    setBusy(true)
    setError(null)
    try {
      const data = await api<UserRow[]>('/users')
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const sorted = useMemo(() => [...rows].sort((a, b) => a.email.localeCompare(b.email)), [rows])

  async function addUser() {
    setBusy(true)
    setError(null)
    try {
      const body = { name: name.trim(), email: email.trim(), password, role }
      const created = await api<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) })

      const selectedPerms = (Object.keys(perms) as PermissionKey[]).filter((k) => perms[k])
      if (created?.id) {
        await api(`/users/${created.id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions: selectedPerms }) })
      }

      await load()

      setName('')
      setEmail('')
      setPassword('')
      setRole('USER')
      setPerms({
        DASHBOARD: true,
        ATTENDANCE: true,
        TIMESHEETS: true,
        EMPLOYEES: true,
        PROJECTS: false,
        BUSES: false,
        DEVICES: false,
        ALLOCATIONS: false,
        EXCEPTIONS: false,
        CORRECTIONS: false,
        SETTINGS: false,
        REALTIME_MONITOR: false,
        TIMESHEET: false,
        ADMIN_ACCESS: false,
      })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to add user')
    } finally {
      setBusy(false)
    }
  }

  async function setPerm(userId: string, key: PermissionKey, value: boolean) {
    const user = rows.find((r) => r.id === userId)
    if (!user) return
    const nextPerms = new Set<PermissionKey>(user.permissions ?? [])
    if (value) nextPerms.add(key)
    else nextPerms.delete(key)
    const list = Array.from(nextPerms)

    setBusy(true)
    setError(null)
    try {
      await api(`/users/${userId}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions: list }) })
      setRows((prev) => prev.map((r) => (r.id === userId ? { ...r, permissions: list } : r)))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to update permissions')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Settings</div>
          <h1 className="h1">User Management</h1>
        </div>
      </div>

      <div className="dashGrid">
        <div className="panel span6">
          <Section title="Add User">
            {error ? <div className="callout bad">{error}</div> : null}

            <div className="formGrid">
              <label className="field">
                <div className="fieldLabel">Name</div>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </label>

              <label className="field">
                <div className="fieldLabel">Email</div>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>

              <label className="field">
                <div className="fieldLabel">Password</div>
                <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
              </label>

              <label className="field">
                <div className="fieldLabel">Role</div>
                <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="USER">User</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="HR">HR</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="fieldLabel">Access Permissions</div>
                <div className="permGrid">
                  {(
                    [
                      ['DASHBOARD', 'Dashboard'],
                      ['ATTENDANCE', 'Attendance'],
                      ['TIMESHEETS', 'Timesheets'],
                      ['EMPLOYEES', 'Employees'],
                      ['PROJECTS', 'Projects'],
                      ['BUSES', 'Buses'],
                      ['DEVICES', 'Devices'],
                      ['ALLOCATIONS', 'Allocations'],
                      ['EXCEPTIONS', 'Exceptions'],
                      ['CORRECTIONS', 'Corrections'],
                      ['SETTINGS', 'Settings'],
                    ] as const
                  ).map(([k, label]) => (
                    <label key={k} className="permItem">
                      <input
                        type="checkbox"
                        checked={perms[k]}
                        onChange={(e) => setPerms((p) => ({ ...p, [k]: e.target.checked }))}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="authActionsPro" style={{ marginTop: 12 }}>
              <button className="btn btnPrimary" onClick={addUser} disabled={busy}>
                Add User
              </button>
            </div>
          </Section>
        </div>

        <div className="panel span6">
          <Section title="Users">
            {sorted.length === 0 ? <div className="muted">No users added yet.</div> : null}

            {sorted.map((u) => (
              <div key={u.id} className="userCard">
                <div className="userCardHead">
                  <div>
                    <div className="userName">{u.name}</div>
                    <div className="userMeta mono">{u.email}</div>
                  </div>
                  <span className="pill">{u.role}</span>
                </div>

                <div className="permGrid">
                  {(
                    [
                      ['DASHBOARD', 'Dashboard'],
                      ['ATTENDANCE', 'Attendance'],
                      ['TIMESHEETS', 'Timesheets'],
                      ['EMPLOYEES', 'Employees'],
                      ['PROJECTS', 'Projects'],
                      ['BUSES', 'Buses'],
                      ['DEVICES', 'Devices'],
                      ['ALLOCATIONS', 'Allocations'],
                      ['EXCEPTIONS', 'Exceptions'],
                      ['CORRECTIONS', 'Corrections'],
                      ['SETTINGS', 'Settings'],
                    ] as const
                  ).map(([k, label]) => (
                    <label key={k} className="permItem">
                      <input
                        type="checkbox"
                        checked={(u.permissions ?? []).includes(k)}
                        onChange={(e) => setPerm(u.id, k, e.target.checked)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  )
}
