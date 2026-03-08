# COSC-480 Website

Node.js + Express project with:
- Session-based login demo (`/`, `/user`, `/logout`)
- Notes API backed by MySQL (`/api/notes`)
- Static HTML/CSS practice page (`/lecture0-exercises`)

## Tech Stack
- Node.js
- Express
- express-session
- cookie-parser
- dotenv
- mysql2

## Project Structure
- `server.js`: Main app on port `3000` (login + notes API)
- `app.js`: Session tutorial app on port `4000`
- `db.js`: MySQL pool/config helpers
- `views/index.html`: Login form
- `views/app.css`: Login form styles
- `.env.example`: Environment variable template

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create your local env file:
- Duplicate `.env.example` to `.env`
- Fill in your database values and session/auth values

Example values are documented in `.env.example`.

## Run
- Main app (port 3000):
```bash
npm start
```

- Session tutorial app (port 4000):
```bash
npm run start:session
```

## Default Routes (main app)
- `GET /` login page (or welcome if logged in)
- `POST /user` login submit
- `GET /logout` logout and clear session
- `GET /lecture0-exercises` static HTML exercise page
- `GET /api/notes` list notes
- `POST /api/notes` create note (`{ "content": "..." }`)

## Environment Variables
Required for database-backed features:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Session/auth variables:
- `LOGIN_USERNAME`
- `LOGIN_PASSWORD`
- `SESSION_SECRET`

## Security Notes
- Do not commit `.env` (already ignored by `.gitignore`).
- Rotate any password that was ever exposed in logs, screenshots, or chat.
- Use a long, random `SESSION_SECRET` in real deployments.

## Troubleshooting
- If `npm start` fails with DB errors, verify `.env` values and that MySQL is running.
- If login fails, confirm `LOGIN_USERNAME` and `LOGIN_PASSWORD` in `.env`.
- If port `3000` is busy, stop the other process using it and restart.
