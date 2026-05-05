# Use Live Data on 5173 (Dev UI)

You will use:
- Frontend dev server: `http://localhost:5173` (Vite)
- Backend API: `http://localhost:3000` (Docker backend or local Nest)
- Database: Postgres in Docker

## Steps
1. Keep Docker backend + postgres running (recommended):
   - UI (prod): `http://localhost:8080`
   - API: `http://localhost:3000`

2. Start the dev UI:
```powershell
cd "C:\Users\Umar Shah\Documents\New project\attendance-handoff\frontend"
npm install
npm run dev
```

3. Ensure dev UI points to the backend API.
Create a file named `.env.local` inside `frontend/`:
```env
VITE_API_URL="http://localhost:3000"
VITE_GOOGLE_MAPS_API_KEY="YOUR_KEY"
```

Now `http://localhost:5173` will show the same real data (employees, punches, devices, exceptions, timesheets).

## Notes
- `5173` is for development (fast refresh while editing UI).
- `8080` is the final production build (Docker + Nginx).
- Your backend already enables CORS for `http://localhost:5173`.
