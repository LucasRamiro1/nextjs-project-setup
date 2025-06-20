# BotBetMaster Deployment Instructions

This repository contains three main services:

- **Backend**: API service located in `backend/`
- **Frontend**: React web app located in `frontend/`
- **Bot**: Telegram bot located in `bot/`

## Deployment on fly.io

Each service has its own fly.io configuration file (`fly.toml`) and should be deployed independently.

### Backend

- Location: `backend/`
- Deploy command:  
  ```bash
  cd backend
  flyctl deploy
  ```
- Environment variables:  
  - `DATABASE_URL` (required)  
  - `NODE_ENV=production`

### Frontend

- Location: `frontend/`
- Deploy command:  
  ```bash
  cd frontend
  flyctl deploy
  ```
- Environment variables:  
  - `VITE_API_URL` (points to backend API URL)  
  - `NODE_ENV=production`

### Bot

- Location: `bot/`
- Deploy command:  
  ```bash
  cd bot
  flyctl deploy
  ```
- Environment variables (set via `flyctl secrets`):  
  - `TELEGRAM_TOKEN` (required)  
  - `DATABASE_URL` (required)  
  - `ADMIN_IDS` (comma-separated list)  
  - `REQUIRED_GROUP_ID`  
  - `GALERA_GROUP_ID`  
  - `API_BASE_URL` (default set in fly.toml)

## Shared Code

The `shared/` folder contains common database schema and types used by all services.  
Ensure import paths are correct and relative to each service.

## Local Development

- Run `npm install` in each service folder before starting.  
- Use `npm run dev` or equivalent commands to start services locally.

## Notes

- Ensure all environment variables are set before deploying.  
- Use `flyctl secrets set` to securely store sensitive environment variables.  
- Test each service locally before deploying to catch import or runtime errors.

---

This setup ensures smooth deployment and integration of all three services on fly.io.
