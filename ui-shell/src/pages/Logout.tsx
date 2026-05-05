import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/auth'

export default function Logout() {
  const nav = useNavigate()

  useEffect(() => {
    clearToken()
    const t = setTimeout(() => nav('/login'), 250)
    return () => clearTimeout(t)
  }, [nav])

  return (
    <div className="authScene">
      <div className="authFrame">
        <div className="authSide">
          <div className="kicker">Session</div>
          <h1 className="authTitle">Logging out…</h1>
          <p className="authText">Closing the session and redirecting to login.</p>
        </div>
        <div className="authMain">
          <div className="authCardPro">
            <div className="kicker">Redirect</div>
            <h2 className="h1">Please wait</h2>
            <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
              If this takes too long, open <span className="mono">/login</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
