# Labor Bus Attendance System - Project Progress

## Project Goal

Build a custom labor attendance system for workers traveling by company bus to project sites.

The system is designed to support:

- Labor master records
- Project allocation
- Bus allocation
- Geofence validation
- Duplicate punch prevention
- IN / OUT attendance rules
- Attendance reports
- Future bus attendance reader integration

## Current Project Location

```text
D:\Time Attandnace project\attendance-system
```

## Technology Stack Used

- Backend: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Frontend: React + Vite
- Container: Docker Compose
- Validation: class-validator + class-transformer

## Docker / Database

We created PostgreSQL using Docker.

Main file:

```text
D:\Time Attandnace project\attendance-system\docker-compose.yml
```

Database details:

```text
Database: attendance_db
User: attendance_user
Password: attendance_pass
Port: 5432
Container name: attendance-postgres
```

Start PostgreSQL:

```powershell
D:
cd "D:\Time Attandnace project\attendance-system"
docker compose up -d
docker ps
```

## Backend

Backend location:

```text
D:\Time Attandnace project\attendance-system\backend
```

Start backend:

```powershell
D:
cd "D:\Time Attandnace project\attendance-system\backend"
npm run start:dev
```

Backend runs at:

```text
http://localhost:3000
```

## Frontend

Frontend location:

```text
D:\Time Attandnace project\attendance-system\frontend
```

Start frontend:

```powershell
D:
cd "D:\Time Attandnace project\attendance-system\frontend"
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Important Startup Order

The system turns off when PowerShell windows are closed because it is currently running in development mode.

Every time you restart the computer or close terminals, start in this order:

1. Open Docker Desktop and wait until Docker is running.
2. Start PostgreSQL.
3. Start backend.
4. Start frontend.

Commands:

```powershell
D:
cd "D:\Time Attandnace project\attendance-system"
docker compose up -d
```

```powershell
D:
cd "D:\Time Attandnace project\attendance-system\backend"
npm run start:dev
```

```powershell
D:
cd "D:\Time Attandnace project\attendance-system\frontend"
npm run dev
```

## Backend Modules Completed

### 1. Employees

Purpose:

- Create labor records
- List labor records

API:

```text
GET  /employees
POST /employees
```

Fields:

- employeeCode
- fullName
- phone
- status

### 2. Projects

Purpose:

- Create project/site records
- Store geofence location

API:

```text
GET  /projects
POST /projects
```

Fields:

- projectCode
- projectName
- latitude
- longitude
- geofenceRadius

### 3. Buses

Purpose:

- Create bus records
- Store plate number and driver

API:

```text
GET  /buses
POST /buses
```

Fields:

- busCode
- plateNumber
- driverName

### 4. Allocations

Purpose:

- Assign labor to project
- Assign labor to bus
- Control active assignment period

API:

```text
GET  /allocations
POST /allocations
```

Fields:

- employeeId
- projectId
- busId
- startDate
- endDate
- isActive

### 5. Attendance

Purpose:

- Save IN / OUT punches
- Validate allocation
- Validate geofence
- Block duplicate punches

API:

```text
GET  /attendance
POST /attendance
```

Fields:

- employeeId
- projectId
- busId
- punchType
- punchedAt
- latitude
- longitude
- deviceId
- notes

## Attendance Rules Completed

The backend currently checks:

- Employee must be active.
- Employee must be allocated to the selected project and bus.
- Duplicate IN is blocked for the same day.
- Duplicate OUT is blocked for the same day.
- OUT punch is not allowed unless IN exists for the same day.
- If project geofence exists, latitude and longitude are required.
- Punch outside geofence is rejected.

Example geofence error:

```text
Punch location is outside project geofence. Distance: 16760 meters
```

Example duplicate error:

```text
Duplicate IN punch is not allowed for the same day
```

## Validation Completed

DTO validation was added for:

- Attendance
- Employees
- Projects
- Buses
- Allocations

Validation package installed:

```text
class-validator
class-transformer
```

Validation is enabled globally in:

```text
backend\src\main.ts
```

Rules include:

- UUID validation
- string validation
- number validation
- date validation
- boolean validation
- whitelist unknown fields

## Prisma / Database Schema

Main schema file:

```text
backend\prisma\schema.prisma
```

Main models created:

- User
- Employee
- Project
- Bus
- Allocation
- AttendancePunch

Prisma version was downgraded from Prisma 7 to Prisma 6 because Prisma 7 required newer runtime configuration.

Current Prisma setup is working with:

```text
@prisma/client@6
prisma@6
```

## Frontend Completed

The frontend was built with React + Vite.

Main files:

```text
frontend\src\App.tsx
frontend\src\App.css
frontend\src\index.css
```

Completed screens:

- Login screen
- Dashboard
- Labor
- Projects
- Buses
- Allocations
- Attendance
- Reports

## Frontend Dashboard

Dashboard currently shows:

- Present Today
- Absent Today
- On Bus / Active
- Completed Shift
- Exceptions
- Operational snapshot
- Recent attendance

## Frontend Labor Screen

Allows:

- Add labor
- View labor list

## Frontend Projects Screen

Allows:

- Add project
- Add geofence latitude / longitude
- Add geofence radius
- View project list

## Frontend Buses Screen

Allows:

- Add bus
- Add plate number
- Add driver name
- View bus list

## Frontend Allocations Screen

Allows:

- Assign labor to project
- Assign labor to bus
- Set start date
- Set end date
- View active allocations

## Frontend Attendance Screen

Current attendance screen:

- Shows only labor with active allocations
- Auto-fills project from selected labor allocation
- Auto-fills bus from selected labor/project allocation
- Auto-fills project latitude and longitude when available
- Blocks submit button until a valid allocation is selected
- Shows today's attendance punches

This reduces wrong manual selection.

## Frontend Reports Screen

Current reports:

- Daily Project Summary
- Daily Bus Summary

Reports show:

- project present count
- buses used
- bus punch count

## Important Note About Manual Attendance

The current UI includes a manual Attendance screen for testing and admin use.

For the real bus attendance system, attendance should come from a bus device or reader, not manual entry.

Future bus device options:

1. Android tablet with face recognition
2. Fingerprint reader
3. RFID / NFC reader
4. Existing biometric attendance machine integration

Recommended option:

```text
Android tablet with camera + GPS + backend API
```

## Universal Device Support (Any Android / Any Brand)

The backend now supports biometric devices from any brand by standardizing the punch payload and using an identifier mapping table.

Device punch endpoints:

```text
POST /device-attendance/punch
POST /device-attendance/batch
```

Device security:

- Devices use `x-device-key` (API key) to authenticate.
- API key is generated at device creation or via rotate-key.

Employee lookup options from devices:

1. `employeeId` (UUID)
2. `employeeCode` (company code)
3. `(identifierType, identifierValue)` via `EmployeeIdentifier` table
   - identifierType: `FACE_ID`, `FINGER_ID`, `DEVICE_USER_ID`

Biometric method tracking:

- `authMethod`: `FACE` or `FINGER`
- optional `authScore`, `liveness`

## Future Bus Reader Flow

Target real-world flow:

1. Labor enters bus.
2. Device scans face / fingerprint / card.
3. Device sends employee ID, bus ID, GPS, time, and device ID to backend.
4. Backend checks allocation, duplicate punch, geofence, and rules.
5. Backend returns success or rejection.
6. Attendance appears in dashboard and reports.

## Why localhost Turns Off

Currently the project runs in development mode.

That means:

- Backend runs only while `npm run start:dev` PowerShell is open.
- Frontend runs only while `npm run dev` PowerShell is open.
- PostgreSQL runs while Docker Desktop and the container are running.

If PowerShell is closed, frontend/backend stop.

Later we can make it permanent by using:

- Docker containers for backend and frontend
- Windows service
- PM2 process manager
- production server deployment

## Current Known Limitation

This is not yet a production deployment.

Still needed:

- Real login/authentication
- User roles
- Bus reader/device integration
- Exception log module
- Shift/time-window rules
- Export reports
- Production deployment
- Automatic startup

## Recommended Next Steps

### VPS Deployment Files Added

The project has now been prepared for VPS deployment using Docker Compose.

Added files:

```text
docker-compose.prod.yml
.env.production.example
backend/Dockerfile
backend/.dockerignore
frontend/Dockerfile
frontend/.dockerignore
frontend/nginx.conf
docs/VPS_DEPLOYMENT.md
```

Important production change:

```text
Frontend now calls /api instead of http://localhost:3000
```

Nginx inside the frontend container proxies:

```text
/api -> backend:3000
```

VPS guide:

```text
docs\VPS_DEPLOYMENT.md
```

### Step 1: Stabilize Local Running

Make backend/frontend easier to start.

Options:

- Dockerize backend and frontend
- Create one startup script
- Use PM2

### Step 2: Bus Device API

Create a dedicated endpoint:

```text
POST /device-attendance
```

This endpoint should accept:

- employeeCode or cardNumber
- busCode or deviceId
- latitude
- longitude
- punchType
- punchedAt

### Step 3: Device Master

Add device table:

- deviceId
- busId
- deviceName
- deviceType
- status

### Step 4: Exception Module

Store rejected punches:

- duplicate attempt
- wrong bus
- wrong project
- outside geofence
- no allocation
- inactive labor

### Step 5: Reports

Add:

- daily attendance report
- bus-wise report
- project-wise report
- absent report
- exception report
- payroll export

## Current Status Summary

Completed:

- Docker PostgreSQL
- NestJS backend
- Prisma database schema
- Employee API
- Project API
- Bus API
- Allocation API
- Attendance API
- Duplicate attendance rules
- OUT after IN rule
- Geofence validation
- DTO validation
- React frontend
- Login screen
- Operational dashboard
- Labor/project/bus/allocation screens
- Attendance screen
- Reports screen
- Allocation-aware attendance UI

Not completed yet:

- Real bus reader integration
- Production deployment
- Real authentication
- Auto-start service
- Device master
- Exception database
- Shift rules
- Payroll export
