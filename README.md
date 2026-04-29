# The Block — AIUI_Project

**The Block** is a hyperlocal neighborhood sharing platform where residents can lend tools, borrow items, and offer/request services from people nearby. It is built with a React + Vite frontend and a Node.js/Express backend connected to MongoDB Atlas.

> **Project status:** active development — branch `Final-Changes---Submission`

---

## Table of Contents
1. [Tech Stack & Dependencies](#tech-stack--dependencies)
2. [Project Structure](#project-structure)
3. [Key Modules & Scripts](#key-modules--scripts)
4. [Environment Variables](#environment-variables)
5. [Quick Start](#quick-start)
6. [API Reference](#api-reference)
7. [Development Notes](#development-notes)
8. [Troubleshooting](#troubleshooting)

---

## Tech Stack & Dependencies

### Frontend (`client/`)
| Package | Version | Purpose |
|---|---|---|
| react | ^18 | UI component library |
| react-dom | ^18 | DOM rendering |
| react-router-dom | ^6 | Client-side routing |
| vite | ^5 | Dev server & bundler |
| leaflet | ^1.9 | Interactive map rendering |
| react-leaflet | ^4 | React bindings for Leaflet |
| react-datepicker | ^6 | Date picker for availability |

### Backend (`server/`)
| Package | Version | Purpose |
|---|---|---|
| express | ^4 | HTTP server & routing framework |
| mongoose | ^8 | MongoDB ODM for schema modeling |
| bcryptjs | ^2 | Password hashing |
| jsonwebtoken | ^9 | JWT auth token signing & verification |
| multer | ^1 | Multipart file upload handling |
| cors | ^2 | Cross-origin request headers |
| dotenv | ^16 | Loads `.env` into `process.env` |
| node-fetch / native fetch | built-in (Node 18+) | HTTP calls to Groq AI API |

---

## Project Structure

```
AIUI_Project/
├── client/                        # React + Vite frontend
│   ├── index.html                 # App shell / Vite entry HTML
│   ├── vite.config.js             # Vite dev server config
│   ├── package.json               # Frontend dependencies
│   └── src/
│       ├── main.jsx               # ReactDOM.render entry point
│       ├── app.jsx                # Root component with router
│       ├── api/
│       │   └── api.js             # Axios instance (base URL, auth headers)
│       ├── components/
│       │   ├── Navbar.jsx         # Site-wide navigation + hamburger (mobile)
│       │   ├── Listingcard.jsx    # Reusable listing card component
│       │   ├── ListingModal.jsx   # Full-screen listing detail modal
│       │   ├── Messagebubble.jsx  # Chat bubble used in Messages page
│       │   └── AIChatBubble.jsx   # Floating AI assistant chat panel
│       ├── context/
│       │   └── SearchContext.jsx  # Global listings + search state (React Context)
│       ├── pages/
│       │   ├── Landing.jsx        # Public marketing landing page
│       │   ├── Signup.jsx         # Registration + login form
│       │   ├── Welcome.jsx        # Post-signup onboarding welcome screen
│       │   ├── Onboarding.jsx     # Step-by-step user setup flow
│       │   ├── Listview.jsx       # Browsable listing grid with filters
│       │   ├── ExploreMap.jsx     # Leaflet map view of all listings
│       │   ├── Createpost.jsx     # Create / edit listing form with AI assist
│       │   ├── Profile.jsx        # User profile, saved & my listings modals
│       │   ├── Messages.jsx       # Real-time style conversations screen
│       │   ├── MyListings.jsx     # Standalone my-listings page
│       │   ├── SavedListings.jsx  # Standalone saved-listings page
│       │   └── Success.jsx        # Post-action confirmation screen
│       └── styles/                # Per-page/component CSS files
│           ├── global.css         # Shared grid, page wrapper, reset rules
│           ├── navbar.css         # Top nav + hamburger mobile styles
│           ├── landing.css        # Marketing landing page styles
│           ├── signup.css         # Auth form layout
│           ├── welcome.css        # Welcome / onboarding steps
│           ├── onboarding.css     # Onboarding flow styles
│           ├── listview.css       # Listing grid toolbar & layout
│           ├── map.css            # Map page search & filter overlay
│           ├── exploremap.css     # Map container specific styles
│           ├── createpost.css     # Create-post form & map picker
│           ├── profile.css        # Profile layout, sidebar, modals
│           ├── layouts.css        # Messages page layout (sidebar/chat)
│           ├── modal.css          # ListingModal bottom-sheet styles
│           ├── cards.css          # ListingCard component styles
│           ├── aichat.css         # Floating AI chat bubble styles
│           ├── forms.css          # Shared form input/button styles
│           └── ...
│
└── server/                        # Node.js + Express backend
    ├── server.js                  # Entry point: Express setup, DB connect, route mounting
    ├── package.json               # Backend dependencies
    ├── middleware/
    │   └── auth.js                # JWT verification middleware (requireAuth)
    ├── models/
    │   ├── User.js                # Mongoose User schema (auth, profile, savedListings)
    │   ├── Listing.js             # Mongoose Listing schema (type, location, image)
    │   └── Conversation.js        # Mongoose Conversation + embedded Message schema
    ├── controllers/
    │   ├── authController.js      # signup / login logic
    │   ├── listingController.js   # CRUD for listings + image upload
    │   ├── profileController.js   # Get/update authenticated user profile
    │   ├── savedController.js     # Save / unsave / fetch saved listings
    │   └── messageController.js   # Conversations CRUD + send message
    ├── routes/
    │   ├── authRoutes.js          # POST /signup, POST /login
    │   ├── listingRoutes.js       # GET/POST/PUT/DELETE /api/listings
    │   ├── profileRoutes.js       # GET/PUT /api/profile/me (auth-protected)
    │   ├── savedRoutes.js         # GET/POST/DELETE /api/saved
    │   ├── messageRoutes.js       # GET/POST/DELETE /api/messages
    │   └── aiRoutes.js            # POST /api/ai/chat|generate-listing|smart-search
    └── uploads/                   # Multer-stored listing images (gitignored in prod)
```

---

## Key Modules & Scripts

### `server/server.js`
Application entry point. Validates required environment variables on startup, configures Express middleware (CORS, JSON body parsing, static file serving), mounts all route groups under `/api/*`, and establishes the MongoDB connection before starting the HTTP listener.

### `server/middleware/auth.js`
`requireAuth` — extracts the `Bearer` JWT from the `Authorization` header, verifies it with `JWT_SECRET`, and injects `req.userId` for downstream controllers. Returns `401` if the token is missing, malformed, or expired.

### `server/models/`
- **User.js** — stores credentials (hashed password), profile fields (bio, location, photo), and an array of `savedListings` ObjectId refs.
- **Listing.js** — stores title, description, type (`borrow | lend | service`), image path, availability string, GeoJSON-style `{ lat, lng }` location, and the creator's name/id.
- **Conversation.js** — stores an array of `participants` (User refs), a `listingId` ref for context, and an embedded array of `messages` (each with `senderId`, `text`, and timestamps).

### `server/controllers/`
| File | Exports | Responsibility |
|---|---|---|
| `authController.js` | `signup`, `login` | Hashes passwords with bcrypt, issues signed JWTs |
| `listingController.js` | `getListings`, `getListingById`, `createListing`, `updateListing`, `deleteListing` | Full CRUD; supports type/search/availability query filters |
| `profileController.js` | `getProfile`, `updateProfile` | Returns user + listing stats; updates profile fields selectively |
| `savedController.js` | `getSavedListings`, `saveListing`, `removeSavedListing` | Manages the `savedListings` array on the User document |
| `messageController.js` | `getUserConversations`, `createOrGetConversation`, `sendMessage`, `deleteConversation` | Idempotent conversation creation; pushes messages into embedded array |

### `server/routes/aiRoutes.js`
Three AI endpoints powered by the **Groq API** (`llama-3.3-70b-versatile`):
- `POST /api/ai/generate-listing` — generates a listing title + description from free-form user input
- `POST /api/ai/smart-search` — ranks existing listings by relevance to a natural-language query
- `POST /api/ai/chat` — conversational assistant with system-context awareness of the app

### `client/src/api/api.js`
Axios instance configured with `baseURL: http://localhost:5001/api`. All pages import this instead of calling `fetch` directly, keeping the base URL and auth header injection in one place.

### `client/src/context/SearchContext.jsx`
React Context that fetches all listings from the API on mount, stores them globally, and exposes search/filter helpers so that `Listview`, `ExploreMap`, `Profile`, and `MyListings` all share the same data without redundant network calls.

### Client-side scripts (from `client/package.json`)
| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start Vite dev server with HMR on port 5173 |
| `build` | `vite build` | Production bundle into `dist/` |
| `preview` | `vite preview` | Serve the production build locally |

### Server-side scripts (from `server/package.json`)
| Script | Command | Purpose |
|---|---|---|
| `start` | `node server.js` | Production server start |
| `dev` | `nodemon server.js` | Development server with auto-restart on file changes |

---

## Environment Variables

Create `server/.env` — **do not commit this file**. Required variables:

```
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.mongodb.net/theblock?retryWrites=true&w=majority"
JWT_SECRET="a-long-random-secret-string"
PORT=5001
GROQ_API_KEY="gsk_...yourkey..."
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | Yes | — | MongoDB Atlas (or local) connection string |
| `JWT_SECRET` | Yes | — | Secret used to sign/verify auth tokens |
| `PORT` | No | `5001` | Port the Express server listens on |
| `GROQ_API_KEY` | Yes | — | API key for Groq LLM (AI features) |
---

## Quick Start

### 1. Clone the repo
```bash
git clone <repo-url> && cd AIUI_Project
```

### 2. Install dependencies
```bash
# Backend
cd server && npm install

# Frontend (use --legacy-peer-deps to resolve peer conflicts)
cd ../client && npm install --legacy-peer-deps
```

### 3. Configure environment
Create `server/.env` with the variables listed in the section above. Example values are shown in the "Environment Variables" section — do not commit this file.

If you have an example file in the repo, you can copy it; otherwise create the file manually:

```bash
# If an example exists
cp server/.env.example server/.env

# Or create it manually (recommended for private keys)
# Edit server/.env and set MONGODB_URI, JWT_SECRET, GROQ_API_KEY, and optional PORT
```

### 4. Start both servers

**Terminal A — backend**
```bash
cd /path/to/AIUI_Project/server
npm run dev        # uses nodemon for auto-restart
# or: node server.js
```

**Terminal B — frontend**
```bash
cd /path/to/AIUI_Project/client
npm run dev
```

### 5. Open the app
```
http://localhost:5173/
```

### Stop both servers
```bash
kill $(lsof -ti:5001,5173) 2>/dev/null || true
# or:
pkill -f "node server.js"; pkill -f "vite"
```

---

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`
| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/signup` | No | `{ firstName, lastName, email, password }` | Register new user; returns JWT |
| POST | `/login` | No | `{ email, password }` | Login; returns JWT + user object |

### Listings — `/api/listings`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Fetch all listings; supports `?type=`, `?search=`, `?availability=` query params |
| GET | `/:id` | No | Fetch a single listing by MongoDB ID |
| POST | `/` | No | Create listing; accepts `multipart/form-data` with optional `image` file |
| PUT | `/:id` | No | Update listing fields |
| DELETE | `/:id` | No | Delete listing |

### Profile — `/api/profile`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/me` | Yes | Get current user's profile + listing stats |
| PUT | `/me` | Yes | Update bio, location, photo, name |

### Saved Listings — `/api/saved`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:userId` | No | Get all saved listings for a user |
| POST | `/:userId/:listingId` | No | Save a listing |
| DELETE | `/:userId/:listingId` | No | Remove a saved listing |

### Messages — `/api/messages`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:userId` | No | Get all conversations for a user |
| POST | `/thread` | No | Create or retrieve existing conversation |
| POST | `/:conversationId` | No | Send a message to a conversation |
| DELETE | `/:conversationId` | No | Delete a conversation (participant only) |

### AI — `/api/ai`
| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/generate-listing` | No | `{ userInput }` | Generate listing title + description via Groq LLM |
| POST | `/smart-search` | No | `{ query, listings }` | Return ranked listing IDs by relevance |
| POST | `/chat` | No | `{ message, history[] }` | Conversational neighborhood assistant |

---

## Development Notes
- Backend and frontend run on **separate ports** (5001 and 5173). CORS is configured on the server to allow `http://localhost:5173`.
- Uploaded listing images are stored in `server/uploads/` and served as static files at `/uploads/<filename>`. Ensure this directory is writable.
- If Vite starts on port 5174 (because 5173 is taken), update `server/server.js` CORS `origin` accordingly or free port 5173 first.
- The codebase uses **ES Modules** (`import`/`export`) on both client and server — do not mix `require()`.

---

## Troubleshooting
| Symptom | Fix |
|---|---|
| `EADDRINUSE` on port 5001 | `lsof -i :5001` then `kill <PID>` |
| `MongooseError: buffering timed out` | Check `MONGODB_URI` in `.env` and network access in Atlas |
| `JWT_SECRET is not defined` | Ensure `server/.env` is present and `dotenv` is loaded before routes |
| Frontend API calls fail (CORS) | Ensure backend is running on 5001 and CORS origin matches your Vite port |
| `Pre-transform error` in Vite | Unclosed JSX tag or stray character — check the file Vite reports |
| Images not loading | Verify `server/uploads/` exists and the backend `/uploads` static route is mounted |

---

## Contributing
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and verify both servers run without errors
3. Commit with a descriptive message and open a PR against `main`

