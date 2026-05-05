# Bus Attendance Reader (Device Punch) Setup

Your backend already supports **device-based punching** here:
- `POST /device-attendance/punch`
- Header: `x-device-key: <apiKey>` (required if the device has `apiKeyHash`)

## 1) Create a Bus
Use your existing `/buses` API.

## 2) Create a Device for the Bus
Call:
- `POST /devices`

Body example:
```json
{
  "deviceId": "BUS-TAB-001",
  "deviceName": "Bus Tablet 001",
  "deviceType": "ANDROID_TABLET",
  "busId": "<bus_uuid>",
  "status": true
}
```

Response includes `apiKey` only once. Save it on the tablet.

## 3) Punch From Device
Call:
- `POST /device-attendance/punch`
- Header: `x-device-key: <apiKey>`

Body example:
```json
{
  "deviceId": "BUS-TAB-001",
  "nonce": "1a2b3c4d5e6f...",
  "sentAt": "2026-04-26T10:00:00.000Z",
  "punchType": "IN",
  "authMethod": "FACE",
  "employeeCode": "EMP001",
  "identifierType": "FACE_ID",
  "identifierValue": "FACE-EMP001",
  "latitude": 25.2048,
  "longitude": 55.2708,
  "notes": "Morning boarding"
}
```

## 4) What Security Checks Happen
- Device registered + active
- Device key validation (if enabled)
- Replay protection (nonce + time window)
- Employee resolution via employeeCode / biometric identifier
- Allocation must exist (employee assigned to that bus, and optionally project)
- Duplicate IN/OUT blocked per day per project
- OUT not allowed before IN for same day
- Geofence required if project has geofence configured

## 5) Real Device Options (How To Go Live)
You have 2 common ways to connect the bus reader:
1. Android tablet app (recommended first):
   - The app reads face/finger from the reader SDK and calls `/device-attendance/punch`.
2. Existing biometric device (ex: ZKTeco):
   - Run a small "bridge" service (Windows/Linux) that reads logs from the device/BioTime and forwards punches to `/device-attendance/punch`.
   - This avoids changing your backend API; only the bridge is device-specific.

## 6) Live UI Pages
In the `frontend`:
- `Attendance Style 01` = Kiosk Punch UI: `http://localhost:5173/attendance-style-01`
- `Attendance Details` = Live punches view: `http://localhost:5173/attendance-details`
