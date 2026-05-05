import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import rccLogoUrl from '../assets/rcc-logo-2018.png'
import { API_URL, ApiError, api } from '../lib/api'
import { getToken, setToken } from '../lib/auth'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rcc_remember_me_v1') === 'true'
    } catch {
      return true
    }
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill email if remembered.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rcc_last_login_email_v1')
      if (saved) setEmail(saved)
    } catch {
      // ignore
    }
  }, [])

  // If "Remember me" was used before and a token exists, skip asking for password again.
  useEffect(() => {
    const token = getToken()
    if (!token) return
    let cancelled = false
    api<{ user: any }>('/auth/me')
      .then(() => {
        if (cancelled) return
        nav('/')
      })
      .catch(() => {
        // token invalid/expired; stay on login
      })
    return () => {
      cancelled = true
    }
  }, [nav])

  async function signIn() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        let msg = `Login failed (${res.status})`
        const m = data?.message
        if (Array.isArray(m)) msg = m.join(', ')
        else if (typeof m === 'string') msg = m
        throw new ApiError(msg, res.status, data)
      }

      const token = data?.accessToken
      if (!token || typeof token !== 'string') {
        throw new Error('Login response missing accessToken')
      }

      setToken(token, remember)
      try {
        localStorage.setItem('rcc_remember_me_v1', remember ? 'true' : 'false')
        if (remember) localStorage.setItem('rcc_last_login_email_v1', email.trim())
        else localStorage.removeItem('rcc_last_login_email_v1')
      } catch {
        // ignore
      }
      nav('/')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="authScene">
      <div className="authFrame">
        <div className="authSide">
          <div className="authBrand authBrandSolo authBrandHero">
            <img src={rccLogoUrl} alt="RCC" className="authLogoHero" />
          </div>
          <div className="authSideBottom">
            <div className="authSideBottomTitle">Employee Attendance Management</div>
            <div className="authSideBottomSub">RCC Workforce Portal</div>
          </div>
        </div>

        <div className="authMain">
          <div className="authCardPro">
            <div className="authCardHeader">
              <div>
                <div className="kicker">Welcome back</div>
                <h2 className="h1">Sign in</h2>
              </div>
              <span className="pill pillBrand">RCC</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                void signIn()
              }}
            >
              <label className="field">
                <div className="fieldLabel">Email</div>
                <div className="inputRow">
                  <Icon name="users" />
                  <input
                    className="input inputFlat"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@rcc.local"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="field">
                <div className="fieldLabel">Password</div>
                <div className="inputRow">
                  <Icon name="shield" />
                  <input
                    className="input inputFlat"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    autoComplete="current-password"
                  />
                </div>
              </label>

              <div className="authMetaRow">
                <label className="checkRow" style={{ marginTop: 10 }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <Link className="authLinkSm" to="/reset-password">
                  Forgot email/password?
                </Link>
              </div>

              <div className="authActionsPro authActionsCenter">
                <button className="btn btnPrimary" type="submit" disabled={busy}>
                  Sign in
                </button>
              </div>
            </form>

            {error ? <div className="callout bad">{error}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
