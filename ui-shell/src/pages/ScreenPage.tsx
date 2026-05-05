import { useEffect, useState } from 'react'
import type { ScreenDef } from '../router/screens'
import Section from '../components/Section'
import { api } from '../lib/api'

export default function ScreenPage(props: { screen: ScreenDef }) {
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    document.title = `Attendance | ${props.screen.title}`
  }, [props.screen.title])

  useEffect(() => {
    let cancelled = false
    api<{ user: any }>('/auth/me')
      .then((d) => {
        if (cancelled) return
        setMe(d?.user ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setMe(null)
      })
    return () => {
      cancelled = true
    }
  }, [props.screen.path])

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <div className="kicker">{props.screen.group}</div>
          <h1 className="h1">{props.screen.title}</h1>
        </div>
      </div>

      <div className="dashGrid">
        <div className="panel span8">
          <Section title="Account Details" right={<span className="pill pillBrand">Admin</span>}>
            <div className="kvGrid">
              <div className="kv">
                <div className="kvK">Display Name</div>
                <div className="kvV">{me?.name ?? 'Admin'}</div>
              </div>
              <div className="kv">
                <div className="kvK">Role</div>
                <div className="kvV">{me?.role ?? 'Supervisor'}</div>
              </div>
              <div className="kv">
                <div className="kvK">Email</div>
                <div className="kvV mono">{me?.email ?? '-'}</div>
              </div>
              <div className="kv">
                <div className="kvK">Status</div>
                <div className="kvV">
                  <span className="pill pillOk">Active Session</span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="panel span4">
          <Section title="Security" right={<span className="pill">Actions</span>}>
            <div className="kvGrid kvGridOne">
              <div className="kv">
                <div className="kvK">Password</div>
                <div className="kvV">Managed by Admin/HR</div>
              </div>
              <div className="kv">
                <div className="kvK">Two-factor</div>
                <div className="kvV">Not enabled</div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
