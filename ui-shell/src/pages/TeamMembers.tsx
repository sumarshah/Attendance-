import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
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

type Mode = 'create' | 'edit'

function photoKey(employeeId: string) {
  return `rcc_employee_photo_v1:${employeeId}`
}

export default function TeamMembers() {
  const [rows, setRows] = useState<Employee[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdMsg, setCreatedMsg] = useState<string | null>(null)

  const [mode, setMode] = useState<Mode>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [employeeCode, setEmployeeCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const editingEmployee = useMemo(
    () => (editingId ? rows.find((r) => r.id === editingId) ?? null : null),
    [editingId, rows],
  )

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

  useEffect(() => {
    load()
  }, [load])

  function resetToCreate() {
    setMode('create')
    setEditingId(null)
    setEmployeeCode('')
    setFullName('')
    setPhone('')
    setStatus('ACTIVE')
    setPhotoPreview(null)
    setCreatedMsg(null)
    setError(null)
  }

  function startEdit(emp: Employee) {
    setMode('edit')
    setEditingId(emp.id)
    setEmployeeCode(emp.employeeCode)
    setFullName(emp.fullName)
    setPhone(emp.phone ?? '')
    setStatus(emp.status)
    setCreatedMsg(null)
    setError(null)

    try {
      const p = localStorage.getItem(photoKey(emp.id))
      setPhotoPreview(p)
    } catch {
      setPhotoPreview(null)
    }
  }

  async function save(e?: FormEvent) {
    if (e) e.preventDefault()
    setBusy(true)
    setError(null)
    setCreatedMsg(null)
    try {
      const payload: any = {
        employeeCode: employeeCode.trim(),
        fullName: fullName.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
        status,
      }

      if (mode === 'create') {
        await api<Employee>('/employees', { method: 'POST', body: JSON.stringify(payload) })
        setCreatedMsg('Employee created.')
        resetToCreate()
        await load()
      } else {
        if (!editingId) throw new Error('Missing editingId')
        await api<Employee>(`/employees/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        setCreatedMsg('Employee updated.')
        await load()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function remove(emp: Employee) {
    if (!confirm('Are you sure you want to delete this record?')) return
    setBusy(true)
    setError(null)
    setCreatedMsg(null)
    try {
      await api(`/employees/${emp.id}`, { method: 'DELETE' })
      try {
        localStorage.removeItem(photoKey(emp.id))
      } catch {
        // ignore
      }
      if (editingId === emp.id) resetToCreate()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function onPhotoSelected(employeeId: string | null, file: File | null) {
    if (!employeeId || !file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null
      if (!dataUrl) return
      setPhotoPreview(dataUrl)
      try {
        localStorage.setItem(photoKey(employeeId), dataUrl)
      } catch {
        // ignore
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">Team</div>
          <h1 className="h1">Team Members</h1>
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
          <Section title={mode === 'create' ? 'Add Employee' : 'Edit Employee'}>
            {createdMsg ? <div className="callout good">{createdMsg}</div> : null}
            {error ? <div className="callout bad">{error}</div> : null}

            <form onSubmit={save}>
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

                <label className="field">
                  <div className="fieldLabel">Status</div>
                  <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </label>

                <label className="field">
                  <div className="fieldLabel">Photo (local)</div>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    disabled={mode !== 'edit'}
                    onChange={(e) => onPhotoSelected(editingId, e.target.files?.[0] ?? null)}
                  />
                </label>

                {photoPreview ? (
                  <div className="field" style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img
                      src={photoPreview}
                      alt="Employee"
                      style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                    <div className="muted" style={{ fontSize: 12 }}>
                      Stored in this browser only (no DB change).
                    </div>
                  </div>
                ) : null}
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
                    {editingEmployee ? (
                      <button className="btn btnDanger" type="button" onClick={() => remove(editingEmployee)} disabled={busy}>
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
          <Section title="Employees">
            {error ? <div className="callout bad">{error}</div> : null}
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 72 }}>Photo</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Phone</th>
                    <th style={{ width: 140 }} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => {
                    let p: string | null = null
                    try {
                      p = localStorage.getItem(photoKey(e.id))
                    } catch {
                      p = null
                    }
                    return (
                      <tr key={e.id}>
                        <td>
                          {p ? (
                            <img
                              src={p}
                              alt={e.fullName}
                              style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.08)' }}
                            />
                          ) : (
                            <div className="muted" style={{ fontSize: 12 }}>
                              -
                            </div>
                          )}
                        </td>
                        <td className="mono">{e.employeeCode}</td>
                        <td>{e.fullName}</td>
                        <td className="muted">{e.status}</td>
                        <td className="muted">{e.phone ?? '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btnGhost btnSm" onClick={() => startEdit(e)} disabled={busy}>
                              Edit
                            </button>
                            <button className="btn btnDanger btnSm" onClick={() => remove(e)} disabled={busy}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
