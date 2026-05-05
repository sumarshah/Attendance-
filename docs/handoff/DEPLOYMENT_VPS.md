# Deploy To VPS (Production)

This is the simplest “real server” approach (paid VPS).

## 1) Choose VPS
Recommended minimum for your system:
- 2 vCPU
- 4 GB RAM
- 50+ GB SSD
- Ubuntu 22.04/24.04

## 2) Install On VPS
Install:
- Docker + Docker Compose
- Nginx (reverse proxy)

## 3) Run Services
You will run:
- Postgres container
- Backend container (Nest)
- Frontend static build served by Nginx (or a container)

## 4) Domain + SSL
- Point domain A record to VPS IP
- Use Let’s Encrypt for HTTPS

## 5) Environment Variables
Keep secrets in `.env` on the VPS:
- Database URL
- JWT secret
- Any device integration secrets

## Who Should Do This
Your dev/DevOps person can follow this doc and your existing docker compose to deploy cleanly.

