import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import rccLogoUrl from '../assets/rcc-logo-2018.png'
import { ApiError, api } from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: email.trim() }) })
      setDone(true)
    } catch (e) {
      // Still show generic success even on most errors, to avoid email enumeration.
      if (e instanceof ApiError && e.status >= 500) setError('Temporary error. Please try again.')
      else setDone(true)
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
                <div className="kicker">Account Help</div>
                <h2 className="h1">Forgot Password</h2>
              </div>
              <span className="pill pillBrand">RCC</span>
            </div>

            {done ? (
              <div className="callout good">If the email exists, a reset link has been sent.</div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void submit()
                }}
              >
                <label className="field">
                  <div className="fieldLabel">Email</div>
                  <div className="inputRow">
                    <Icon name="users" />
                    <input className="input inputFlat" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                  </div>
                </label>

                <div className="authActionsPro authActionsCenter" style={{ marginTop: 12 }}>
                  <button className="btn btnPrimary" type="submit" disabled={busy}>
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}

            {error ? <div className="callout bad">{error}</div> : null}

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
              <Link className="btn btnGhost" to="/login">
                Back to Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

