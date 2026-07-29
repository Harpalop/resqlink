# ResQLink — Codebase Tour

A complete guide to how this project works, file by file, concept by concept.
Read this before demos and interviews — every section ends with likely interview
questions and their answers.

---

## 1. The Big Picture

```
project x/
├── frontend/     React 19 + TypeScript SPA (Vite dev server, port 5173)
├── backend/      Java 21 + Spring Boot 3 REST API (port 8080)
└── docker-compose.yml   PostgreSQL 16 in Docker (port 5432)
```

**How a request flows:**

```
Browser → React page → TanStack Query → axios (src/lib/api.ts)
   → Vite proxy (/api → localhost:8080)
   → JwtAuthenticationFilter (validates token)
   → Controller → Service → Repository (Spring Data JPA)
   → PostgreSQL
```

- The frontend never talks to the database. It only calls the REST API.
- The Vite dev proxy (`frontend/vite.config.ts`) forwards any `/api/*` request
  to the Spring Boot server — this avoids CORS issues in development.
- Hibernate (`ddl-auto: update`) creates/updates tables automatically from the
  `@Entity` classes, so there are no SQL migration files (yet).

---

## 2. Backend Architecture (`backend/src/main/java/com/resqlink/api/`)

Organized **by feature, not by layer**. Each package is one module and contains
its own entity, repository, service, controller, and DTOs:

| Package | Module |
|---|---|
| `auth/` | Register, login, token refresh |
| `user/` | User entity, roles, /users/me |
| `security/` | JWT creation + validation filter |
| `config/` | Spring Security setup, password encoder, CORS |
| `profile/` | Medical profile + public Medical ID |
| `contact/` | Emergency contacts |
| `emergency/` | Smart SOS + event timeline |
| `blood/` | Donors, compatibility, blood requests |
| `hospital/` | Hospital directory (seeded) |
| `family/` | Family groups + check-ins |
| `telemedicine/` | Doctors + appointments |
| `assistant/` | AI emergency assistant (rule engine) |
| `notification/` | In-app notification hub |
| `disaster/` | Disaster alerts |
| `gamification/` | Achievements (computed live) |
| `dashboard/` | Aggregated stats |
| `admin/` | Admin-only endpoints |
| `common/` | Health check + global error handling |

**The standard pattern in every module:**

```
Controller  – HTTP layer. Validates input (@Valid), returns DTOs. No logic.
Service     – Business rules + @Transactional boundaries.
Repository  – Interface extending JpaRepository. Spring writes the SQL.
Entity      – @Entity class = one database table.
DTOs        – Java records. What the API sends/receives (never the entity itself).
```

Why DTOs instead of returning entities? Three reasons:
1. **Security** — the `User` entity has a password hash; DTOs expose only safe fields.
2. **Stability** — the API contract doesn't change when the database schema does.
3. **Lazy loading** — serializing an entity outside a transaction throws
   `LazyInitializationException` (we hit this bug — see §12).

---

## 3. Authentication — the deepest part (auth/, security/, config/)

### Registration flow
1. `POST /api/v1/auth/register` hits `AuthController`.
2. `RegisterRequest` record is validated by Bean Validation annotations
   (`@Email`, `@Size(min=8)` for password, etc.). Invalid → automatic 400.
3. `AuthService.register()`:
   - normalizes the email (trim + lowercase),
   - rejects duplicates with 409,
   - hashes the password with **BCrypt** (never stored in plain text),
   - resolves the role — only CITIZEN/DOCTOR/NURSE/VOLUNTEER/NGO can
     self-register; ADMIN/POLICE etc. are blocked (403),
   - saves the user and returns **two JWTs**.

### The two-token system
| Token | Lifetime | Purpose |
|---|---|---|
| Access token | 24 h | Sent with every API call in the `Authorization: Bearer` header |
| Refresh token | 7 days | Only used to get a new pair when the access token expires |

Both are HMAC-SHA-signed JWTs (JJWT library). The payload carries the email
(subject), user id, role, and a `token_type` claim. The **filter refuses
refresh tokens for API access** — a stolen refresh token can't read data
directly; it can only be exchanged at `/auth/refresh`, giving a smaller
attack surface.

### How a protected request is authenticated (security/JwtAuthenticationFilter)
1. Filter runs **once per request** (extends `OncePerRequestFilter`), before
   Spring Security's own checks.
2. Reads the `Authorization` header. No header → passes through anonymously
   (protected endpoints will then 401).
3. Parses + verifies the JWT signature and expiry (`JwtService.parseClaims`).
4. Checks `token_type == access`.
5. Loads the user from the DB and puts an authenticated principal into
   `SecurityContextHolder` — from then on, controllers can inject the user
   with `@AuthenticationPrincipal User user`.
6. Any JWT exception → context cleared, request continues unauthenticated.
   No stack traces leak to the client.

### SecurityConfig (config/SecurityConfig.java)
- `SessionCreationPolicy.STATELESS` — no server-side sessions; every request
  proves itself with the JWT. This is what makes the API horizontally scalable.
- CSRF disabled — CSRF protection matters for cookie-based sessions; we use
  header-based tokens, which browsers don't attach automatically.
- Public endpoints: `/auth/**`, `/health`, `/medical-id/**` (responders
  scanning a QR aren't logged in!). Everything else requires authentication.
- `@EnableMethodSecurity` turns on `@PreAuthorize("hasRole('ADMIN')")` used
  by the admin and disaster-alert-creation endpoints.

### Frontend side (features/auth/)
- `auth-context.tsx` — React context holding `user` + status
  (`loading | authenticated | guest`). On app start it calls `/users/me`
  with the stored token to restore the session.
- `lib/api.ts` — the axios instance. Two interceptors:
  - **request**: attaches `Authorization: Bearer <token>` from localStorage.
  - **response**: on a 401 (expired access token) it automatically calls
    `/auth/refresh`, stores the new pair, and **retries the original request
    once** (`_retry` flag prevents infinite loops). If refresh also fails →
    tokens cleared, redirect to /login.
- `protected-route.tsx` — wraps private pages; guests are redirected to
  /login (remembering where they came from).

**Interview Q&A**
- *Why JWT over sessions?* Stateless → no session store, scales horizontally,
  works naturally for SPAs and mobile clients.
- *Where are tokens stored, and is that safe?* localStorage. Tradeoff:
  vulnerable to XSS but immune to CSRF. Production hardening would use
  httpOnly cookies for the refresh token + short-lived access tokens.
- *Why BCrypt?* Adaptive salted hashing — deliberately slow, so brute-forcing
  leaked hashes is expensive. Salt is embedded per-hash automatically.

---

## 4. Medical Profile & Smart Medical ID (profile/)

- `MedicalProfile` is **1-to-1 with User** (`@OneToOne`, unique user_id).
  It's created lazily — the first time the user opens their profile
  (`getOrCreate()` pattern in `ProfileService`).
- Every profile gets a **publicToken**: a random UUID with dashes stripped
  (32 hex chars). This is the secret in the QR code URL: `/m/<token>`.
- **The public endpoint** `GET /api/v1/medical-id/{token}` is intentionally
  unauthenticated (whitelisted in SecurityConfig) — an unconscious person
  can't log in for the paramedic. Security comes from the token being
  unguessable (122 bits of randomness), revocable (regenerate = new token,
  old QR dead), and disableable (`medicalIdEnabled` switch).
- The QR code itself is generated **client-side** by `qrcode.react` — the
  QR simply encodes the URL.
- `completionPercent` is computed server-side from how many of the 10 profile
  fields are filled — the frontend progress bar and dashboard nudge use it.
- The public page (`pages/medical-id/public.tsx`) is mobile-first: blood
  group is the biggest element on screen, allergies get a warning color,
  and every emergency contact is a `tel:` link → one tap calls them.

---

## 5. Smart SOS (emergency/)

**Data model:** `Emergency` (one SOS incident) has many `EmergencyEvent`s
(timeline entries) via `@OneToMany(cascade = ALL)` — saving the emergency
saves its events in one go.

**Trigger flow** (`EmergencyService.trigger`):
1. Reject if the user already has an ACTIVE emergency (409) — one at a time.
2. Generate a human-friendly reference `RQ-XXXX` (SecureRandom, uniqueness
   checked against the DB) — easy to read over a phone.
3. Store GPS coords + accuracy (captured in the browser via the
   Geolocation API — `features/sos/api.ts getCurrentPosition()`, which
   resolves to an empty object if permission is denied, never blocking the SOS).
4. Auto-build the timeline: *SOS triggered → Location locked / unavailable →
   Contacts notified → Medical ID shared* — each an `EmergencyEvent` row.
5. Fire an in-app notification (see §9).

**Lifecycle:** ACTIVE → RESOLVED ("I'm safe") or CANCELLED (false alarm),
via separate endpoints; closing stamps `closedAt` and appends a final event.

**The SOS button** (`features/sos/sos-button.tsx`) is worth studying:
- Tap starts a **5-second countdown** (accidental-trigger protection);
  tapping again aborts.
- SVG circle with animated `strokeDashoffset` draws the countdown ring.
- **The StrictMode bug we fixed:** originally `onActivate()` was called
  inside the `setState` updater. React StrictMode intentionally
  double-invokes updaters in dev → the SOS fired **twice** (two POST
  requests). Fix: updaters must be pure — the side effect moved into a
  `useEffect` that fires exactly once when `remaining === 0`.

---

## 6. Blood Network (blood/)

Two entities: `DonorProfile` (1-to-1 with user: group, city, availability,
last donation, count) and `BloodRequest` (group, units, urgency, hospital,
status lifecycle OPEN → FULFILLED/CLOSED).

**The compatibility engine** (`BloodCompatibility.java`) is the interesting
part — a static map of real transfusion rules:

```
Recipient AB+ can receive from: everyone (universal recipient)
Recipient O-  can receive from: O- only
Searching for A+ donors returns: A+, A-, O+, O-
```

`searchDonors("A+")` expands the requested group into all compatible donor
groups and queries `WHERE bloodGroup IN (...) AND available = true`, with an
optional case-insensitive city filter. So a search finds donors who can
*actually give* to that patient — not just exact-group matches.

**Eligibility rule:** donors must wait 90 days between whole-blood donations.
Computed in `DonorResponse.from()` from `lastDonationDate` — the UI shows
"Eligible now" vs "Recently donated" badges.

---

## 7. Telemedicine (telemedicine/) & Hospitals (hospital/)

Both follow the same pattern: an entity + a **CommandLineRunner seeder**
(`DoctorSeeder`, `HospitalSeeder`) that inserts starter data on first boot
(`if (repository.count() > 0) return;` makes it idempotent — safe on every
restart).

- Hospital search: one derived query method
  `findTop50ByNameContainingIgnoreCaseOrCityContainingIgnoreCase...` —
  Spring Data JPA generates SQL from the method name. The frontend debounces
  the search input by 350 ms so we don't fire a request per keystroke.
- Appointments: booking validates the time is in the future (`@Future`),
  links patient + doctor, fires a notification, and only UPCOMING
  appointments can be cancelled (409 otherwise).

---

## 8. Family Safety (family/)

- `FamilyGroup` has a 6-character **invite code** generated from an alphabet
  with no confusing characters (no 0/O, no 1/I) using SecureRandom, retried
  until unique.
- `FamilyMember` is the join table (group ↔ user) with a unique constraint
  on (group_id, user_id) so you can't join twice — plus per-member check-in
  state (`lastCheckInAt`, note).
- Check-in = "I'm safe" button → timestamps the membership. The UI shows a
  green dot for members who checked in within 24 h.
- Leaving as the last member deletes the group (no orphan groups).
- Groups cap at 12 members (409 beyond).

---

## 9. Notifications (notification/)

`NotificationService.notify(user, type, title, body)` is a tiny hub any
module can call — SOS trigger/close and appointment booking already do.
Because it runs inside the caller's transaction, a failed SOS never leaves
a stray notification.

Frontend: the bell in the sidebar polls `/notifications/unread-count` every
30 s (TanStack Query `refetchInterval`) and shows a badge; the page lists
notifications with type-specific icons and a "mark all read" button (one
bulk `@Modifying @Query` UPDATE, not N row updates).

*Honest limitation to mention if asked:* this is **polling, not push**. The
production upgrade path is WebSocket/SSE or Firebase Cloud Messaging — the
service-hub design means only the delivery mechanism would change.

---

## 10. AI Emergency Assistant (assistant/)

A **rule-based expert system**, not an LLM (deliberate choice: free, offline,
zero latency, and **deterministic** — in emergency guidance you don't want
hallucinations).

- `AssistantEngine` holds ~14 `Rule`s: keyword lists → curated first-aid
  replies (CPR, choking, bleeding, stroke, burns, snake bite, earthquake…).
- Matching is simple `String.contains` over the lowercased message; first
  rule wins. Unknown input → a help message listing what it can do.
- Every response carries **follow-up suggestion chips** and the mandatory
  disclaimer: *"AI assistance does not replace professional medical advice."*
- The engine is isolated behind one method (`answer(message)`) so swapping
  in a real LLM (Claude API) later means changing only this class — the
  controller and the chat UI stay identical.

The chat UI (`pages/assistant/index.tsx`) keeps messages in local state
(conversation is stateless server-side), renders `**bold**` with a tiny
custom formatter, auto-scrolls, and shows a typing indicator while the
mutation is in flight.

---

## 11. Gamification (gamification/) & Dashboard (dashboard/)

**Achievements have no table.** `AchievementController` computes them live
from real data each request: profile completion, contact count, SOS usage,
donor status, donation count, family membership → 10 badges with points,
level = totalPoints / 60. Zero risk of achievements drifting out of sync
with reality, at the cost of a few extra queries — fine at this scale.

**Dashboard** (`DashboardService.getStats`) aggregates across all modules in
one endpoint: personal stats + network stats + two chart datasets
(my emergencies bucketed per day over the last 7 days; available donors per
blood group).

Charts are **Recharts** bar charts. The colors are not arbitrary: they were
run through a **palette validator** checking lightness band, chroma, contrast
vs surface, and color-vision-deficiency (CVD) separation in both light and
dark mode. The first palette (blue+violet) FAILED the deuteranopia check
(ΔE 0.3 — indistinguishable) and was replaced with a validated one
(`features/dashboard/types.ts CHART_COLORS`). Great accessibility story
for interviews.

---

## 12. Error Handling & the Bugs We Fixed

`common/exception/GlobalExceptionHandler` (`@RestControllerAdvice`) maps
every failure to a consistent JSON shape `{status, message, errors?, timestamp}`:

| Exception | HTTP |
|---|---|
| `ApiException` (our own, carries a status) | as specified |
| `MethodArgumentNotValidException` | 400 + per-field errors map |
| `BadCredentials/UsernameNotFound` | 401 (same message — don't reveal which emails exist) |
| `AccessDenied/AuthorizationDenied` | 403 |
| `DataIntegrityViolation` | 409 |
| anything else | 500, logged server-side, generic message to client |

**Three real bugs found by testing (tell these stories!):**

1. **Double SOS fire** — React StrictMode double-invokes state updaters;
   a side effect inside one fired the emergency twice. Fixed by moving the
   effect into `useEffect`. Lesson: updaters must be pure.
2. **500 instead of 403** — Spring's `AuthorizationDeniedException` from
   `@PreAuthorize` fell into the generic `Exception` handler. Fixed by adding
   a dedicated handler. Lesson: handler specificity matters.
3. **LazyInitializationException** — `GET /appointments` serialized
   `appointment.getDoctor().getName()` after the transaction closed
   (`FetchType.LAZY`). Fixed with `@Transactional(readOnly = true)` on the
   endpoint. Lesson: know your ORM's session boundaries.

---

## 13. Frontend Design System (`frontend/src/`)

```
components/ui/        Button, GlassCard, Badge, Input, Select, Switch, Skeleton…
components/effects/   Magnetic, SpotlightCard, Particles, GradientOrbs, WordReveal…
components/layout/    Navbar (landing), AppShell (sidebar app), Footer
components/theme/     next-themes provider + animated toggle
features/<module>/    types.ts + api.ts (+ special components) per module
pages/<route>/        One folder per route
lib/                  api.ts (axios), utils.ts (cn), motion.ts (presets), storage.ts
```

Key decisions:
- **Tailwind CSS v4** — design tokens are CSS variables in `index.css`
  (`@theme inline`), colors in **OKLCH** (perceptually uniform color space).
  Dark mode = a `.dark` class swapping the variables; `next-themes` manages
  light/dark/system and an inline `<script>` in `index.html` applies the
  saved theme before first paint (no flash).
- **CVA (class-variance-authority)** gives Button/Badge typed variants;
  `cn()` (clsx + tailwind-merge) merges classes without conflicts.
- **Glassmorphism** = `.glass-panel` utility (semi-transparent bg +
  backdrop-blur + subtle border) used everywhere.
- **Framer Motion** presets in `lib/motion.ts` (fadeUp, staggerContainer,
  shared EASE curve) keep animation consistent; scroll reveals use
  `whileInView` with `once: true`.
- **TanStack Query** owns all server state: caching, loading states,
  `refetchInterval` polling (notifications 30 s, dashboard 60 s), and
  `invalidateQueries` after mutations. No Redux needed — server state lives
  in Query's cache, the only real client state is the auth context.
- **Forms** = React Hook Form + Zod resolver — the schema is both the
  validation and the TypeScript type (`z.infer`), mirroring backend
  Bean Validation so users get instant feedback and the API stays defended.

---

## 14. Database Schema (created by Hibernate)

```
users 1──1 medical_profiles        users 1──* emergencies 1──* emergency_events
users 1──* emergency_contacts      users 1──1 donor_profiles
users 1──* blood_requests          users 1──* appointments *──1 doctors
users 1──* notifications           users 1──* family_members *──1 family_groups
hospitals, disaster_alerts         (standalone, seeded)
```

All primary keys are UUIDs (`GenerationType.UUID`) — non-guessable IDs safe
to expose in URLs. Timestamps via `@CreationTimestamp`/`@UpdateTimestamp`.

---

## 15. Likely Interview Questions — Quick Answers

**"Walk me through what happens when someone presses the SOS button."**
Countdown (cancel window) → browser geolocation → POST /emergencies with
type+coords → server checks no active emergency, generates RQ-ref, builds
the event timeline, fires a notification → UI switches to the live timeline
view, polling every 15 s → "I'm safe" resolves it.

**"How do you secure the public Medical ID?"**
Capability-URL pattern: an unguessable 128-bit token in the URL is the
credential. Revocable (regenerate), disableable (switch), and it exposes
only medically relevant fields — no account data.

**"Why PostgreSQL?"**
Relational data with real relationships (user→emergencies→events), ACID
transactions for things like SOS + notification consistency, great Spring
Data support, and free hosting options (Neon) for deployment.

**"What would you improve with more time?"**
Flyway migrations instead of ddl-auto; refresh tokens in httpOnly cookies +
rotation/revocation list; WebSocket push instead of polling; integration
tests (Testcontainers); rate limiting on auth endpoints; real SMS via an
SMS gateway; the LoRa/ESP32 hardware mesh.

**"What was the hardest bug?"**
The StrictMode double-fire (story in §12) — invisible in production builds,
only reproducible in dev, and it taught me why React demands pure updaters.

---

*End of tour. Read §3 (auth) and §12 (bugs) twice — they're the most-asked.*
