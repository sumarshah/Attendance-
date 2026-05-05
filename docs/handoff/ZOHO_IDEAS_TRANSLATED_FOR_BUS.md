# Zoho People Ideas, Translated For Your Bus-To-Site Attendance

This doc converts the key Zoho People attendance concepts into your labor + bus workflow.

## 1) “Kiosk Mode” For Bus Tablets (Most Important)
Run a locked-down “Bus Kiosk” app on an Android tablet in each bus.

Kiosk rules:
- Device has its own credentials (device login) so employees don’t need passwords.
- Employee clocks IN/OUT using one of:
  - Face capture + match to employee profile photo (recommended)
  - Fingerprint reader attached to tablet
  - QR/NFC badge (fallback)
- Punch request includes:
  - `deviceId`, `deviceSecretSignature`, `timestamp`, `nonce` (anti-replay)
  - GPS location (lat/lng) and accuracy
  - Optional photo evidence hash / blob reference

## 2) Restrictions (Anti-Fraud)
Like Zoho’s restrictions, but tuned for construction labor:
- Geo restriction (already implemented): must be inside project radius
- “Allocation restriction”: employee must have an active allocation for that bus+project+date
- IP restriction (optional): if kiosk is on a fixed network (less useful on buses)
- Duplicate rule (already implemented): block consecutive IN or consecutive OUT
- Time window rule: IN allowed only within shift window (ex: 04:00-11:00), OUT within (ex: 14:00-22:00)
- GPS quality rule: reject if accuracy is too poor (ex: > 50m)

## 3) Regularization (Fixing Wrong Punches)
Create a flow:
- Employee/Supervisor requests correction (reason + new time + evidence)
- Manager approves/rejects
- System keeps the original punch (audit trail) and stores a “corrected view” for payroll

## 4) Break Management
Add:
- Break start/end punches
- Maximum break duration
- Paid/unpaid break types

## 5) Reports (What Management Wants)
Generate:
- Daily muster roll per project (present/absent)
- Late/early arrivals
- Hours worked per employee (daily/weekly/monthly)
- Overtime
- Export CSV for payroll

## 6) Next Development Step (Concrete)
Implement “Device Management” + “Kiosk Punch API”:
1. Create `devices` table (deviceId, busId, status, secretHash, lastSeenAt).
2. Create endpoint `POST /device-punch` that:
   - Authenticates the device
   - Validates allocation + geofence + duplicate + shift window
   - Inserts attendance row with `source = KIOSK`
3. Create a simple Kiosk UI page in the frontend:
   - Employee search by code + photo capture
   - Big IN/OUT buttons
   - Offline queue (store punches if internet is down and sync later)

