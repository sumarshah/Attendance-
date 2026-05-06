# VPS Deployment (Ubuntu + Docker)

Deploy `attendance-system` on an Ubuntu VPS using Docker Compose (Postgres + NestJS API + Nginx-served UI).

## Ports To Open
- If using direct IP: open `APP_PORT` (recommended `80`)
- If using domain + HTTPS: open `80` and `443`
- Do NOT expose Postgres `5432` or backend `3000` publicly

## 1) Install Docker (Ubuntu 22.04 / 24.04)
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

Optional (so you can run docker without sudo):
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 2) Upload Project Folder To VPS
Recommended location:
```bash
sudo mkdir -p /opt/attendance-system
sudo chown -R $USER:$USER /opt/attendance-system
```

From Windows PowerShell (example):
```powershell
scp -r "D:\Time Attandnace project\attendance-system\*" root@YOUR_VPS_IP:/opt/attendance-system/
```

Verify on VPS:
```bash
ls /opt/attendance-system
```
You must see: `backend/`, `ui-shell/`, `docs/`, `.env.production.example`, `docker-compose.prod.yml`

## 3) Create Production Env File
```bash
cd /opt/attendance-system
cp .env.production.example .env.production
nano .env.production
```

Set at minimum:
```env
APP_PORT=80
FRONTEND_ORIGIN=https://YOUR_DOMAIN_OR_IP

POSTGRES_DB=attendance_db
POSTGRES_USER=attendance_user
POSTGRES_PASSWORD=__SET_A_STRONG_DB_PASSWORD__

JWT_SECRET=__SET_A_LONG_RANDOM_SECRET_64_CHARS_MIN__
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=admin@rcc.local
ADMIN_PASSWORD=__SET_A_STRONG_ADMIN_PASSWORD__
ADMIN_NAME=RCC Admin
```

Notes:
- `JWT_SECRET` must be long and random.
- `ADMIN_PASSWORD` is used only if the admin user does not exist yet (fresh DB).
- Keep `DEVICE_PUNCH_MODE=BIOMETRIC_ONLY` unless you intentionally want to allow non-biometric identifiers.

## 4) Start Containers (Production)
```bash
cd /opt/attendance-system
export COMPOSE_PROJECT_NAME=attendance-final
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Warning:
- Always use `COMPOSE_PROJECT_NAME=attendance-final` (or the provided `start-final.ps1` on Windows).
- If you run Compose with a different project name, Docker will create a different Postgres volume and the app will look like the database is empty.
- This project uses the fixed Postgres volume name: `attendance-final_postgres_data`.

Recovery (if data "disappears"):
- You likely started a different compose project name and created a new empty DB volume.
- Check volumes: `docker volume ls | grep postgres`
- Identify which volume has data, then copy data to the correct volume (or re-attach the correct volume):
  - Recommended: keep using `attendance-final_postgres_data` and avoid changing compose project names.

Open in browser:
- `http://YOUR_VPS_IP` (if IP only)
- `https://YOUR_DOMAIN` (if domain + HTTPS)

## 5) Logs / Health
```bash
export COMPOSE_PROJECT_NAME=attendance-final
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f backend
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f frontend
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f postgres
```

## 6) Restart / Stop
Restart:
```bash
export COMPOSE_PROJECT_NAME=attendance-final
docker compose -f docker-compose.prod.yml --env-file .env.production restart
```

Stop (keeps DB volume):
```bash
export COMPOSE_PROJECT_NAME=attendance-final
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

## 7) Update After Code Change
Upload new files, then:
```bash
cd /opt/attendance-system
export COMPOSE_PROJECT_NAME=attendance-final
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## 8) Firewall (UFW)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## Backup (Postgres)
```bash
export COMPOSE_PROJECT_NAME=attendance-final
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > attendance_backup.sql
```
