# RakitIO

AI-native browser platform for designing, programming, wiring, simulating, and deploying embedded systems.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite 8, TypeScript 6, TailwindCSS 4, Zustand, TanStack Query, Monaco Editor, Framer Motion |
| Backend | Hono, Cloudflare Workers, Drizzle ORM, Turso (SQLite) |
| AI | OpenAI-compatible provider abstraction (OpenAI, Anthropic, Gemini, OpenRouter, custom endpoints) |

## Project Structure

```
rakit-io/
├── client/                    # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Route pages (Landing, Auth, Dashboard, Editor)
│   │   ├── lib/
│   │   │   ├── svg/           # SVG board & component renderers
│   │   │   ├── stores/        # Zustand stores (auth, project, simulation, ui)
│   │   │   ├── hooks/         # TanStack Query hooks
│   │   │   ├── api.ts         # API client
│   │   │   ├── types.ts       # TypeScript types
│   │   │   └── export.ts      # Export utilities
│   │   └── workers/           # Web Workers (simulation)
│   └── package.json
│
├── service/                   # Backend (Hono + Cloudflare Workers)
│   ├── src/
│   │   ├── db/                # Drizzle schema + Turso client
│   │   ├── routes/            # API routes (auth, projects, ai, providers)
│   │   ├── middleware/        # Auth middleware
│   │   ├── lib/
│   │   │   ├── shared/        # Types, constants, utils
│   │   │   ├── ai/            # AI provider abstraction
│   │   │   ├── simulator/     # Simulation engine + subsystems
│   │   │   ├── project/       # Project model
│   │   │   ├── parser/        # Arduino code parser
│   │   │   ├── runtime/       # Arduino runtime abstraction
│   │   │   └── device-sdk/    # Module registry
│   │   └── scripts/           # Database seed script
│   ├── drizzle.config.ts
│   └── package.json
│
├── spec/                      # Architecture RFC
└── package.json               # Root scripts
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.4+
- [Turso](https://turso.tech) database (free tier works)

### 1. Install Dependencies

```bash
# Install root dependencies
bun install

# Install client dependencies
cd client && bun install && cd ..

# Install service dependencies
cd service && bun install && cd ..
```

### 2. Set Up Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create rakit-io-db

# Get connection URL and token
turso db show rakit-io-db --url
turso db tokens create rakit-io-db
```

### 3. Configure Environment

Create `service/.dev.vars`:

```env
TURSO_URL=libsql://<your-db-url>.turso.io
TURSO_AUTH_TOKEN=<your-token>
AI_API_KEY=
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o
```

### 4. Push Database Schema

```bash
cd service

# Create tables (users, sessions, projects, ai_providers)
export TURSO_DATABASE_URL="<your-url>"
export TURSO_AUTH_TOKEN="<your-token>"

bun -e "
const { createClient } = require('@libsql/client');
const c = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const stmts = [
  'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT NOT NULL, avatar_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, token TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT \\'\\', board_id TEXT NOT NULL, data TEXT NOT NULL DEFAULT \\'{}\\', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1)',
  'CREATE TABLE IF NOT EXISTS ai_providers (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, provider TEXT NOT NULL, base_url TEXT NOT NULL, api_key TEXT NOT NULL, model TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)'
];
for (const sql of stmts) { await c.execute(sql); console.log('OK:', sql.split('(')[0].trim()); }
console.log('All tables created');
"

cd ..
```

### 5. Seed Demo Data

```bash
cd service

# Seeds a demo user + 3 sample projects
bun seed

# Output:
#   Created demo user: demo@rakit.io
#     Created project: LED Blink
#     Created project: DHT22 Weather Station
#     Created project: Servo Sweep
#   Seed complete!
#     Email:    demo@rakit.io
#     Password: demo1234
#     Projects: 3

cd ..
```

### 6. Run Development

```bash
# Start both client (port 5173) and service (port 8787)
bun dev

# Or run individually
bun dev:client    # Frontend only
bun dev:service   # Backend only
```

Open http://localhost:5173

## Demo Credentials

| Field | Value |
|-------|-------|
| Email | `demo@rakit.io` |
| Password | `demo1234` |

The demo account comes pre-seeded with 3 projects:

1. **LED Blink** (Arduino Uno) — Classic pin 13 blink with Serial output
2. **DHT22 Weather Station** (ESP32) — Temperature/humidity sensor readings
3. **Servo Sweep** (Arduino Uno) — 0-180° servo sweep

## Scripts

### Root

```bash
bun dev              # Run client + service concurrently
bun dev:client       # Run frontend only (port 5173)
bun dev:service      # Run backend only (port 8787)
bun build:client     # Build frontend for production
bun build:service    # Build backend
bun typecheck        # Typecheck both client and service
bun lint             # Lint client code
```

### Service

```bash
cd service
bun dev              # Start Wrangler dev server
bun seed             # Seed database with demo data
bun typecheck        # Typecheck service
bun deploy           # Deploy to Cloudflare Workers
```

### Client

```bash
cd client
bun dev              # Start Vite dev server
bun build            # Production build (tsc + vite)
bun typecheck        # Typecheck only
bun lint             # Lint with oxlint
```

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| POST | `/api/auth/logout` | Yes | Sign out |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/projects` | Yes | List projects |
| GET | `/api/projects/:id` | Yes | Get project |
| POST | `/api/projects` | Yes | Create project |
| PUT | `/api/projects/:id` | Yes | Update project |
| DELETE | `/api/projects/:id` | Yes | Delete project |
| POST | `/api/ai/chat` | Yes | AI chat |
| POST | `/api/ai/generate` | Yes | Generate project from description |
| POST | `/api/ai/explain` | Yes | Explain code |
| POST | `/api/ai/fix-wiring` | Yes | Validate/fix wiring |
| GET | `/api/providers` | Yes | List AI providers |
| POST | `/api/providers` | Yes | Add AI provider |
| PUT | `/api/providers/:id` | Yes | Update AI provider |
| DELETE | `/api/providers/:id` | Yes | Delete AI provider |
| POST | `/api/providers/:id/activate` | Yes | Set active provider |

## Supported Boards

- Arduino Uno, Nano, Mega
- ESP32 DevKit V1
- ESP8266 NodeMCU
- Raspberry Pi Pico

## Supported Components

LED, Button, Resistor, Potentiometer, DHT22, BME280, SSD1306 OLED, Servo, Relay, GPS, MPU6050, BH1750, DS3231 RTC, SD Card, LoRa, LDR, PIR, Rotary Encoder

## License

MIT
