# RCC Attendance (Bus-To-Site) – Final Handover

Last updated: 2026-05-04

## Run (Local, Docker)
```powershell
cd "D:\Time Attandnace project\attendance-system"
.\start-final.ps1
```

Stop:
```powershell
cd "D:\Time Attandnace project\attendance-system"
.\stop-final.ps1
```

UI:
- http://localhost:5173

API base URL (from browser):
- http://localhost:5173/api

## Login
Default seeded admin (first boot only, if missing in DB):
- Email: `admin@rcc.local`
- Password: `admin123` (dev convenience; change in production)

## Modules (Working)
- Employees (`/employees`)
- Projects + Geofence config (`/projects`)
- Buses (`/buses`)
- Devices + device key generation/rotation (`/devices`, `/devices/:id/rotate-key`)
- Allocations (employee -> project + bus) (`/allocations`)
- Attendance punches + validation (`/attendance`)
- Corrections (request + approve/reject) (`/corrections`)
- Exceptions (device-side error logging) (`/exceptions`)
- Timesheets daily + CSV (`/timesheets/daily`, `/timesheets/daily.csv`)
- User management (ADMIN only): users list + permissions (`/users`, `/users/:id/permissions`)

## Attendance Rules (Implemented)
- Employee must be ACTIVE
- Allocation required (employee must be allocated to project; and bus if provided)
- Duplicate IN/OUT blocked per day per project
- OUT blocked if no IN exists for same day + project
- Geofence enforced if project has `latitude`, `longitude`, `geofenceRadius`

## Device Punch Security (Implemented)
- Device punch endpoint:
  - `POST /device-attendance/punch`
  - `POST /device-attendance/batch`
- If the device has a configured key (`apiKeyHash`), requests must include header:
  - `x-device-key: <deviceApiKey>`
- Clear errors returned for missing/invalid device key.

## Permissions (Backend-Enforced)
- ADMIN role bypasses all permission checks.
- Non-admin users require permission keys to access module APIs (403 if missing).
- Permissions are stored in DB (`UserPermission`).

## API Notes
- `/attendance` supports server-side filters:
  - `dateFrom`, `dateTo`, `employeeId`, `projectId`, `take` (default take=200)
- `/timesheets/daily` expects `date` as `YYYY-MM-DD` (not full ISO timestamp).

## Full System Test (Executed)
Validated end-to-end using Docker + API calls:
- Docker start/stop scripts
- Admin login
- Admin creates user + assigns permissions; non-admin restrictions return 403
- CRUD: employees, projects, buses, devices, allocations
- Attendance rules: IN/OUT, duplicate IN blocked, OUT-before-IN blocked
- Geofence: outside radius blocked
- Corrections: create + GET status=PENDING + approve
- Exceptions: device invalid key triggers exception logging
- Timesheets: `/timesheets/daily` returns rows for allocated employees with punches

## Remaining (Optional Improvements)
- Timesheets input validation: return 400 for invalid `date` format instead of 500.
- UI console verification: check browser DevTools console after login and dashboard load (no automated console capture in this handover).
- Production hardening checklist:
  - Set strong `JWT_SECRET` and `ADMIN_PASSWORD` in `.env.production`
  - Add audit logging (who approved corrections, who changed allocations, etc.)
  - Add password reset (email/OTP) if required

