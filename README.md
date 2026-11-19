# Tap-Bro — Tabletop NFC & QR Dining Review SaaS

> **Autonomous, mobile-first, tabletop NFC & QR review assistant designed for restaurants, bistros, cafes, and dining chains.**  
> Built with Next.js 14, Tailwind CSS, NVIDIA AI Foundation Models, Google Gemini AI, and mobile-optimized luxury culinary UI.

---

## 🍽️ Overview

**Tap-Bro** turns a diner's authentic meal experience into a polished, genuine Google Review in under 60 seconds:
1. **Diners arrive at their table**: Tap the tabletop NFC stand or scan the high-resolution QR code.
2. **Rate experience**: Rate Food, Hospitality, Ambiance, and Overall on independent 1–5 star scales (*starts completely unselected*).
3. **Select dishes tasted**: Tap categorized menu items (appetizers, chef specials, beverages) and add optional notes.
4. **Choose language & tone**: English or conversational **Hinglish**, with tones like Foodie/Flavorful, Concise, Hospitality, or Constructive.
5. **AI generates the draft**: Powered by NVIDIA AI / Google Gemini with zero-cost fallback engine.
6. **1-Tap Share to Google**: Diner taps copy, opening the restaurant's direct Google Review dialog in a new tab.

---

## 🏗️ Multi-Tenant Architecture

Tap-Bro provides an end-to-end platform for diners, restaurant owners, and platform administrators:

- **Super Admin Master Dashboard (`/super-admin`)**:
  - Full analytics across all restaurants, total reviews generated, and active stands.
  - One-click restaurant invitation generator with automated Google SMTP email dispatch (`friendlygaming2525@gmail.com`), WhatsApp instant share, and direct link copy.
  - SMTP configuration manager and real-time connection tester.
  - Restaurant account management (credential rotation, deletion, analytics monitoring).

- **Restaurant Onboarding Portal (`/setup`)**:
  - Secure tokenized setup links (`/setup?email=...&pass=...`) sent directly to restaurant owners.
  - Auto-unlocking form for configuring restaurant name, phone, admin PIN, Google Review URL, cuisine, and signature dishes.

- **Restaurant Manager Dashboard (`/admin` & `/admin/[slug]`)**:
  - Mobile-first manager portal accessed via Phone Number & 4-digit Admin PIN.
  - Live Tabletop Station NFC target link with 1-click copy for programming hardware tags.
  - High-resolution (600x600) tabletop QR code generator & PNG download (`/api/restaurants/[slug]/qr`).
  - Real-time menu management, cuisine customization, and Google Review URL sync.

- **Public Diner Station (`/r/[slug]`)**:
  - Lightweight, responsive mobile experience loaded when a diner taps the tabletop stand.
  - Dynamic branding, signature dish presets, and real-time review counter analytics.

---

## 🛡️ Security & Integrity Defenses

- **OWASP Top 10 Headers**: Strict CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy`.
- **Sliding-Window Rate Limiting**:
  - Super Admin & Manager Login: Max 6 failed login attempts per 5 minutes per IP before HTTP 429 lockout.
  - Setup Pass Validation: Max 5 attempts per 10 minutes per email to stop credential stuffing.
  - AI Token Protection: Max 15 review drafts per minute per IP to defend AI API quota.
- **Strict Public URL Resolution**: Outgoing emails, WhatsApp buttons, and QR code payloads strictly resolve to public production domains (e.g. `https://tapbro.vercel.app`), never leaking `localhost`.
- **Credential Masking**: Public APIs strictly omit `adminPin`, custom API keys, and sensitive tokens.

---

## 🧪 Comprehensive QA & Testing Suite

Tap-Bro includes 6 specialized test suites covering unit logic, OWASP security, hardware QR/NFC routing, multilingual generation, manager portal, and real human-user browser journeys:

```bash
# Run all 6 suites sequentially with executive scorecard
npm test

# Run individual specialized suites
npm run test:unit        # DB Schemas, Sliding-Window Limiter, Public URL Resolver, Fallback Engine
npm run test:security    # OWASP Headers, Brute-Force Defense, AI Quota Exhaustion, Auth Guards
npm run test:qr          # 600px Base64 PNG generation, Public Domain Routing, 404 Boundaries
npm run test:languages   # English & Hinglish reviews across all tones, Review Counter increment
npm run test:manager     # Real Chrome Playwright test for Manager Login, NFC URL, Profile & Menu Sync
npm run test:e2e         # Full Human-User Mobile Journey (Admin Invite ➔ Email ➔ Setup ➔ Diner Review)
```

---

## 🚀 Getting Started

### 1. Installation

```bash
git clone https://github.com/meet252501/tap-bro.git
cd tap-bro
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```env
APP_NAME="Tap-Bro"
NEXT_PUBLIC_APP_NAME="Tap-Bro"
APP_URL="https://tapbro.vercel.app"

# Super Admin Credentials
SUPER_ADMIN_EMAIL="princesharma9955a@gmail.com"
SUPER_ADMIN_PASSWORD="prince@777"

# AI Engine
NVIDIA_API_KEY="your_nvidia_api_key"
NVIDIA_MODEL="minimaxai/minimax-m3.1-flash"

# Google SMTP Dispatch
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="friendlygaming2525@gmail.com"
SMTP_PASS="your_gmail_app_password"
SMTP_FROM="Tap-Bro Team <friendlygaming2525@gmail.com>"
SMTP_SECURE="true"
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) or test the mobile diner experience at [http://localhost:3000/r/demo-bistro](http://localhost:3000/r/demo-bistro).

### 4. Production Build

```bash
npm run build
npm run start
```
