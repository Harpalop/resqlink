<div align="center">

# 🚨 ResQLink

### Connecting Lives During Emergencies

**A smart emergency response & digital healthcare ecosystem** that unites citizens, doctors,
hospitals, blood donors, ambulances, police, fire departments, NGOs and rescue teams on one
real-time platform — before, during, and after every emergency.

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

## ✨ Highlights

- 🆘 **Smart SOS** — one-tap emergency alerts with GPS, live timeline and responder dispatch
- 🪪 **Smart Medical ID** — QR-powered digital identity that speaks for you when you can't
- 🩸 **Blood Donation Network** — matching donors nearby in minutes, not hours
- 🩺 **Telemedicine** — HD video consultations, digital prescriptions, emergency doctors
- 📡 **LoRa Offline Mesh** — ESP32 + LoRa SX1278 hardware keeps SOS alive without internet
- 👨‍👩‍👧 **Family Safety** — live location sharing, safe check-ins, instant alerts
- 🎨 **Premium UI** — glassmorphism, Framer Motion animations, dark/light/system themes

## 🏗️ Architecture

```
resqlink/
├── frontend/          React 19 · TypeScript · Vite · Tailwind CSS v4
│   ├── src/
│   │   ├── components/    UI primitives, effects, layout, theme
│   │   ├── features/      Feature modules (auth, ...)
│   │   ├── pages/         Route pages (landing, auth, dashboard)
│   │   └── lib/           API client, utils, motion presets
│   └── ...
├── backend/           Java 21 · Spring Boot 3 · Spring Security · JWT · PostgreSQL
│   └── src/main/java/com/resqlink/api/
│       ├── auth/          Register, login, refresh (JWT)
│       ├── user/          User entity, roles, profile
│       ├── security/      JWT service + authentication filter
│       ├── config/        Security & application config
│       └── common/        Health check, global error handling
└── docker-compose.yml PostgreSQL 16 for local development
```

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| Java (JDK) | 21+ |
| Maven | 3.9+ |
| PostgreSQL | 16+ (or Docker) |

### 1 · Database

**Option A — Docker (recommended):**
```bash
docker compose up -d
```

**Option B — Local PostgreSQL:** create a database and user matching
[backend/src/main/resources/application.yml](backend/src/main/resources/application.yml):
```sql
CREATE USER resqlink WITH PASSWORD 'resqlink';
CREATE DATABASE resqlink OWNER resqlink;
```

### 2 · Backend

```bash
cd backend
mvn spring-boot:run
```
API starts at `http://localhost:8080`.

### 3 · Frontend

```bash
cd frontend
npm install
npm run dev
```
App starts at `http://localhost:5173` (API requests are proxied to the backend).

## 🔌 API (Module 1 — Authentication)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/health` | — | Service health check |
| `POST` | `/api/v1/auth/register` | — | Create account, returns JWT pair |
| `POST` | `/api/v1/auth/login` | — | Sign in, returns JWT pair |
| `POST` | `/api/v1/auth/refresh` | — | Rotate tokens with a refresh token |
| `GET` | `/api/v1/users/me` | 🔒 Bearer | Current user profile |

**Quick test:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@resqlink.dev","password":"password123"}'
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/resqlink` | PostgreSQL JDBC URL |
| `DB_USERNAME` | `resqlink` | Database user |
| `DB_PASSWORD` | `resqlink` | Database password |
| `JWT_SECRET` | dev secret (change in prod!) | Base64 HMAC signing key |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated origins |
| `ADMIN_EMAIL` | `admin@resqlink.dev` | Seeded admin account email |
| `ADMIN_PASSWORD` | `admin12345` | Seeded admin password (dev only) |

## 🗺️ Roadmap

- [x] **Phase 1** — Foundation: design system, landing page, JWT authentication
- [x] **Phase 2** — User profiles, Smart Medical ID (QR) & emergency contacts
- [x] **Phase 3** — Smart SOS: countdown trigger, GPS, live timeline, history
- [x] **Phase 4** — Blood network: donor search with compatibility, requests, donor card
- [x] **Phase 5** — Command-center dashboard: live stats, Recharts analytics
- [x] **Phase 6** — First Aid Center: 9 step-by-step emergency guides
- [x] **Phase 7** — Hospital directory: search, emergency depts, blood banks, ratings
- [x] **Phase 8** — Family Safety: groups with invite codes, safe check-ins
- [x] **Phase 9** — Admin panel: platform stats, user management (role-gated)
- [x] **Phase 10** — Telemedicine, AI Emergency Assistant, notifications, disaster alerts, achievements
- [ ] **Future** — FCM push, WebRTC video calls, LoRa/ESP32 offline mesh hardware

## 🧰 Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, React Router,
TanStack Query, React Hook Form, Zod, Axios, Recharts, next-themes, Lucide Icons

**Backend:** Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA, PostgreSQL, JJWT

**Hardware (planned):** ESP32, LoRa SX1278, GPS NEO-6M

---

<div align="center">
Built with ❤️ to save lives · <b>ResQLink</b>
</div>
