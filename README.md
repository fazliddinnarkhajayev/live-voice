# Tour Guide Live Voice

A complete **live voice broadcast** system for tour guides:
- **Guide** broadcasts live audio to a group
- **Listeners** hear the guide in real-time (listen-only, no mic)
- Built with **Flutter** (mobile) + **NestJS** (API) + **LiveKit** (WebRTC SFU)

---

## Architecture

```
monorepo/
├── apps/
│   ├── api/          NestJS + Knex + PostgreSQL
│   └── mobile/       Flutter (iOS + Android)
├── infra/
│   ├── docker-compose.yml
│   └── livekit.yaml
└── README.md
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Mobile | Flutter 3 + Riverpod |
| Backend | NestJS 10 + Knex + PostgreSQL 16 |
| Live Voice | LiveKit (WebRTC SFU) |
| Auth | JWT (email + password) |
| Real-time | Socket.IO WebSocket gateway |
| Deployment | Docker Compose (local) / Render (cloud) |

---

## Assumptions & Decisions

1. **Role is fixed at registration** – a user is either a guide or a listener permanently (MVP simplification).
2. **One active session per group** – starting a new session auto-ends the previous one.
3. **Listener is truly listen-only** – enforced at both the server level (LiveKit token `canPublish: false`) and client level (mic never requested/enabled).
4. **Focus/DND** – we instruct users via a pre-tour checklist UI but do NOT claim to block calls/SMS (we cannot).
5. **LiveKit SFU** – no custom media server; LiveKit handles WebRTC complexity.

---

## Prerequisites

- **Docker** >= 24 + **Docker Compose** v2
- **Node.js** >= 20 (for local API dev without Docker)
- **Flutter** >= 3.10 (for mobile)
- An Android emulator/device or iOS simulator/device

---

## Quick Start (Local – Docker Compose)

```bash
# 1. Clone
git clone https://github.com/fazliddinnarkhajayev/live-voice.git
cd live-voice

# 2. Copy env (optional – defaults work for local dev)
cp infra/.env.example infra/.env

# 3. Start everything (Postgres + LiveKit + API)
cd infra
docker compose up --build

# 4. Verify API is up
curl http://localhost:3000/auth/me
# → 401 Unauthorized (expected – means API is running)
```

Services:
| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| LiveKit | ws://localhost:7880 |
| PostgreSQL | localhost:5432 |

---

## Demo Credentials (seeded automatically)

| Role | Email | Password |
|------|-------|----------|
| Guide | guide@demo.com | guide1234 |
| Listener | listener@demo.com | listen1234 |

Demo group invite code: **`DEMO2024`**

---

## API Reference

### Auth
```
POST /auth/register   { email, password, name, role: "guide"|"listener" }
POST /auth/login      { email, password }
GET  /auth/me         → { id, email, name, role }   (Bearer token required)
```

### Groups
```
POST /groups                   Create group (guide only)
GET  /groups                   List my groups
GET  /groups/:id               Get group details
POST /groups/join              { invite_code } Join group (listener only)
```

### Sessions
```
GET  /groups/:id/session/status  Check if session is active
POST /groups/:id/session/start   Guide starts session → returns LiveKit token
POST /groups/:id/session/join    Listener joins → returns subscribe-only token
POST /groups/:id/session/end     Guide ends session
```

---

## Local API Development (without Docker)

```bash
# 1. Start Postgres + LiveKit only
cd infra
docker compose up postgres livekit

# 2. Set up API
cd ../apps/api
cp .env.example .env
# Edit .env as needed

npm install

# 3. Run migrations + seeds
npm run migrate:latest
npm run seed:run

# 4. Start API in dev mode
npm run start:dev
```

---

## Flutter Mobile App

### Setup

```bash
cd apps/mobile
flutter pub get
```

### Configure API URL

Edit `lib/core/constants/api_constants.dart`:

```dart
// For Android emulator pointing to host machine:
const String kApiBaseUrl = 'http://10.0.2.2:3000';

// For iOS simulator:
const String kApiBaseUrl = 'http://localhost:3000';

// For real device (same WiFi):
const String kApiBaseUrl = 'http://192.168.x.x:3000';

// For deployed backend:
const String kApiBaseUrl = 'https://your-api.onrender.com';
```

Or pass it at build time:
```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

### Run

```bash
# Android emulator
flutter run

# Specific device
flutter devices
flutter run -d <device-id>
```

---

## Environment Variables

### apps/api/.env

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API port |
| `DB_HOST` | `localhost` | Postgres host |
| `DB_PORT` | `5432` | Postgres port |
| `DB_USER` | `postgres` | Postgres user |
| `DB_PASSWORD` | `postgres` | Postgres password |
| `DB_NAME` | `livevoice` | Database name |
| `JWT_SECRET` | `change-me` | **Change in production!** |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `LIVEKIT_URL` | `ws://localhost:7880` | LiveKit server URL |
| `LIVEKIT_API_KEY` | `devkey` | LiveKit API key |
| `LIVEKIT_API_SECRET` | `devsecret` | **Change in production!** |

---

## End-to-End Verification

```
1. docker compose up (in infra/)
2. Phone/emulator A: login as guide@demo.com / guide1234
   → Groups screen → "Demo Tour Group" → Guide Home
3. Phone/emulator B: login as listener@demo.com / listen1234
   → Groups screen → (already in DEMO2024 group) → Listener Home
4. Guide: tap "Go Live" → allow microphone permission
5. Listener: tap "Check for Live Session" → session appears
   → Pre-Tour Checklist → "I'm Ready" → Tour Mode screen
6. Guide speaks → Listener hears audio in real-time
7. Listener CANNOT talk (no mic track, no publish button)
8. Listener CANNOT access other group rooms (token is scoped to group_{id})
9. Guide taps "End Session" → listener is disconnected
```

---

## Deployment (Render)

### 1. Deploy PostgreSQL on Render

- Render Dashboard → New → PostgreSQL → Free tier
- Note the **Internal Database URL**

### 2. Deploy LiveKit

Option A – Use LiveKit Cloud (https://cloud.livekit.io) (recommended):
- Sign up → get URL, API key, API secret

Option B – Self-host on a VPS with public IP:
```bash
docker run -d \
  -p 7880:7880 -p 7881:7881 -p 50000-50100:50000-50100/udp \
  -v /path/to/livekit.yaml:/etc/livekit.yaml \
  livekit/livekit-server --config /etc/livekit.yaml
```
Edit `livekit.yaml`: set `rtc.use_external_ip: true`

### 3. Deploy NestJS API on Render

- New → Web Service → Connect repo
- Root Directory: `apps/api`
- Build Command: `npm install && npm run build`
- Start Command: `npm run migrate:latest && npm start`
- Environment variables:
  ```
  DATABASE_URL=<render-postgres-internal-url>
  JWT_SECRET=<strong-random-secret>
  LIVEKIT_URL=wss://<your-livekit-host>
  LIVEKIT_API_KEY=<your-key>
  LIVEKIT_API_SECRET=<your-secret>
  NODE_ENV=production
  ```

### 4. Update Flutter App

```dart
// lib/core/constants/api_constants.dart
const String kApiBaseUrl = 'https://your-api.onrender.com';
```

Build release APK:
```bash
flutter build apk --release \
  --dart-define=API_BASE_URL=https://your-api.onrender.com
```

---

## Security Notes

- Passwords hashed with **bcrypt** (10 rounds)
- JWT with configurable secret + expiry
- LiveKit tokens are **scoped to the group's room** – a listener cannot join another group's room
- Listeners receive `canPublish: false` tokens – the LiveKit server enforces this
- Input validation via `class-validator` on all DTOs
- CORS enabled for development (restrict in production)

---

## Project Structure

```
apps/api/src/
├── auth/           Login, register, JWT strategy
├── users/          User CRUD (via Knex)
├── groups/         Group management + invite codes
├── sessions/       LiveKit session lifecycle
├── livekit/        Token generation service
├── gateway/        Socket.IO WebSocket gateway
├── database/       Knex DI module
└── common/         Shared constants

apps/mobile/lib/
├── core/
│   ├── constants/  API base URL
│   └── network/    HTTP client wrapper
└── features/
    ├── auth/       Login + register screens + Riverpod state
    ├── groups/     Group list + create/join dialogs
    ├── guide/      Go Live + End session screen
    └── listener/   Listener home + pre-tour checklist + tour mode
```
