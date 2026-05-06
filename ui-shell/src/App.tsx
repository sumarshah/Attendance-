import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Logout from './pages/Logout'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ScreenPage from './pages/ScreenPage'
import AttendanceKiosk from './pages/AttendanceKiosk'
import AttendanceLive from './pages/AttendanceLive'
import TeamMembers from './pages/TeamMembers'
import DevicesAdmin from './pages/DevicesAdmin'
import ExceptionsAdmin from './pages/ExceptionsAdmin'
import TimesheetDaily from './pages/TimesheetDaily'
import CorrectionsRequest from './pages/CorrectionsRequest'
import CorrectionsApproval from './pages/CorrectionsApproval'
import ProjectsAdmin from './pages/ProjectsAdmin'
import BusesAdmin from './pages/BusesAdmin'
import Settings from './pages/Settings'
import { SCREENS } from './router/screens'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Home />} />
        {/* Custom "real" pages for key modules */}
        <Route path="/attendance-style-01" element={<AttendanceKiosk />} />
        <Route path="/attendance-style-02" element={<AttendanceLive />} />
        <Route path="/attendance-details" element={<AttendanceLive />} />
        <Route path="/team-members" element={<TeamMembers />} />
        <Route path="/employees" element={<TeamMembers />} />
        <Route path="/devices" element={<DevicesAdmin />} />
        <Route path="/exceptions" element={<ExceptionsAdmin />} />
        <Route path="/timesheet" element={<TimesheetDaily />} />
        <Route path="/timesheets" element={<TimesheetDaily />} />
        <Route path="/correction-request" element={<CorrectionsRequest />} />
        <Route path="/approval-checklist" element={<CorrectionsApproval />} />
        <Route path="/projects" element={<ProjectsAdmin />} />
        <Route path="/buses" element={<BusesAdmin />} />
        <Route path="/settings" element={<Settings />} />

        {SCREENS.filter((s) => s.path !== '/' && s.path !== '/login').map((s) => (
          <Route key={s.key + s.path} path={s.path} element={<ScreenPage screen={s} />} />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
