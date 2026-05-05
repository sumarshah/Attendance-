import { Link } from 'react-router-dom'
import rccLogoUrl from '../assets/rcc-logo-2018.png'
import Section from '../components/Section'

export default function ResetPassword() {
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
                <h2 className="h1">Reset Password</h2>
              </div>
              <span className="pill pillBrand">RCC</span>
            </div>

            <Section title="What to do">
              <div style={{ color: 'rgba(18,24,39,0.86)', lineHeight: 1.55 }}>
                Password reset and account email recovery are handled by your HR/Admin team. Contact your administrator
                and request a password reset.
              </div>
            </Section>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
              <Link className="btn btnPrimary" to="/login">
                Back to Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
