# The Block (AIUI_Project)

A local marketplace / lending app built with a React + Vite frontend and an Express + Node backend (MongoDB). This README explains how to get the project running locally, what environment variables are required, useful developer commands, and troubleshooting tips.

**Project status:** active development — this repo contains two main folders: `client/` (frontend) and `server/` (backend).

---

**Tech Stack**
- Frontend: React, Vite, react-router
- Backend: Node.js, Express, nodemon (dev)
- Database: MongoDB (Atlas suggested)
- Map: react-leaflet (and optional clustering packages)
- Styling: plain CSS files under `client/src/styles/`

---

**Quick Start (macOS / Linux)**
1. Clone the repo:

   git clone <repo-url> && cd AIUI_Project

2. Install dependencies (one-time):

   # Backend
   cd server && npm install

   # Frontend
   cd ../client && npm install --legacy-peer-deps

3. Create a `.env` file in `server/` (see Environment variables below).

4. Start servers in two terminals.

   Terminal A — backend

   export GROQ_API_KEY="<your_groq_api_key>"
   cd /path/to/AIUI_Project/server
   npm run dev

   Terminal B — frontend

   cd /path/to/AIUI_Project/client
   npm run dev

5. Open the app at: http://localhost:5173/

To stop both quickly:

   kill $(lsof -ti:5001,5173) 2>/dev/null || true

---

**Environment variables**
Create `server/.env` (or export variables in your terminal). The backend expects at least:

- `MONGO_URI` — MongoDB connection string (Atlas recommended)
- `PORT` — server port (default 5001 if not set)
- `GROQ_API_KEY` — Groq / AI key used by the AI endpoint (example key used during development; keep secret)

Example `.env` (do NOT commit to git):

```
MONGO_URI="mongodb+srv://<user>:<pass>@cluster0.mongodb.net/dbname?retryWrites=true&w=majority"
PORT=5001
GROQ_API_KEY="gsk_...yourkey..."
```

---

**Project structure (high level)**

- `client/` — React app (Vite)
  - `src/` — application source
  - `src/pages/` — route pages (Createpost, Listview, Profile, Messages, etc.)
  - `src/components/` — reusable components
  - `src/styles/` — CSS files (styles are organized by component/page)

- `server/` — Express backend
  - `controllers/`, `models/`, `routes/`, `middleware/`
  - `server.js` — entrypoint

---

**API (high-level)**
The backend exposes several routes under `/api/*` (see `server/routes/`):

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login
- `GET /api/listings` — list listings
- `POST /api/listings` — create listing (auth)
- `GET /api/messages` — messages endpoints
- `POST /api/ai/chat` — AI assistant chat endpoint (uses `GROQ_API_KEY`)

Refer to the files in `server/routes/` for exact route names and required fields.

---

**Uploads & Static files**
- Uploaded files are stored in `server/uploads/` (check backend multer config). If running locally, ensure `uploads/` exists and is writable.

---

**Development notes & tips**
- If you see `EADDRINUSE` when starting the backend, free the port with `lsof -i :5001` and `kill <PID>` (or use the combined kill command above).
- Vite/HMR errors will point to the file and line number — most common errors are unclosed JSX tags or stray characters introduced by editors/formatters.
- The codebase attempts to minimize inline styles and keep CSS in `client/src/styles/`.

---

**Common commands**
- Start backend (dev): `cd server && npm run dev`
- Start frontend (dev): `cd client && npm run dev`
- Install dependencies (backend): `cd server && npm install`
- Install dependencies (frontend): `cd client && npm install --legacy-peer-deps`
- Stop servers: `kill $(lsof -ti:5001,5173) 2>/dev/null || true`

---

**Troubleshooting**
- Backend returns `Connected to MongoDB` then crashes with `EADDRINUSE`: another process is already bound to the port — kill it.
- Frontend shows `Pre-transform error` or `Expected corresponding JSX closing tag`: open the file and check JSX syntax — unclosed tags or duplicate closers are the usual cause.
- If API calls from the frontend fail, ensure CORS and `Access-Control-Allow-Origin` are configured (the server sets `Access-Control-Allow-Origin: http://localhost:5173` in development), and the backend is reachable on port 5001.

---

**Contributing**
- Create a feature branch off `main` (e.g. `git checkout -b feature/your-feature`)
- Make changes, run frontend & backend locally to verify
- Commit and push, then open a PR for review

---

If you want, I can add a minimal `docker-compose` configuration to run both services and Mongo locally, or add a script to run both servers with `concurrently` — tell me which you prefer.

---

License: add license information here (MIT/Apache/Proprietary) — currently unspecified.
# AIUI_Project

Tech Used:

Frontend<br>

React 18 + Vite — component framework, dev server at localhost:5173<br>
React Router DOM v6 — client-side routing<br>
React Leaflet + Leaflet — interactive map with custom SVG pins<br>
CartoDB Positron tiles — the light map style<br>
react-datepicker — date range picker on Create Post<br>
Axios — HTTP client for API calls<br>
CSS modules per page — no CSS framework, all hand-written<br>


Backend<br>

Node.js + Express — REST API on port 5001<br>
MongoDB Atlas — cloud database<br>
Mongoose — ODM for schema/models<br>
bcryptjs — password hashing<br>
jsonwebtoken (JWT) — auth tokens (7-day expiry)<br>
dotenv — environment variable management<br>
