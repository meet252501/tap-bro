# Review AI — Honest Food & Restaurant Review Assistant

> **A mobile-first, tabletop QR & NFC review assistant designed specifically for dining spots, bistros, and restaurants.**  
> Built with Next.js 14, Tailwind CSS, Google Gemini AI, and mobile-optimized luxury culinary UI.

---

## 🍽️ Overview

**Review AI** turns a customer's genuine dining visit details into a polished, authentic Google Review draft in under 60 seconds.

Inspired by real-world dining reels and tabletop customer flows:
1. **Diners arrive** by scanning a QR code on the table or tapping an NFC puck.
2. **Rate experience** on independent 1–5 star scales (Food & Taste, Hospitality, Ambiance, Overall) — *ratings start completely unselected*.
3. **Select dishes & drinks** they actually tasted (Banarasi Chaat, Dal Makhani, Dum Biryani, etc.) and add optional custom feedback notes.
4. **Choose language & tone** (English or conversational **Hinglish**, Foodie / Crisp / Warm / Balanced).
5. **Review AI drafts the review** using Google Gemini (or deterministic fallback engine) strictly grounded in what the diner selected.
6. **One-tap Copy & Open Google Reviews**: The diner copies the draft, opens Google Reviews in a new tab, pastes, and posts their honest review.

---

## 🛡️ Core Review Integrity Safeguards

In accordance with consumer review guidelines and the project's PRD:
- **No Deceptive Defaults**: Ratings start unselected. No preselected 5 stars.
- **Accurate Reflection of Negative/Mixed Experiences**: If a diner rates service or food as 1 or 2 stars, the AI produces respectful, constructive feedback rather than artificial praise.
- **Strict Anti-Hallucination Guardrails**: The draft only mentions dishes and notes explicitly chosen by the diner.
- **Non-Custodial & Privacy-First**: No diner phone numbers, emails, or review texts are stored on the server.
- **Customer is the Publisher**: Review AI does not auto-post to Google. Diners have 100% control to edit, refine, or discard before submitting.

---

## 🎨 Culinary Visual System

- **Palette**: Dark obsidian backdrop (`#0B0C10`), elevated surface cards (`#191B24`), and warm culinary saffron/amber accents (`#F5C84C`, `#E5A93C`).
- **Touch-First**: 44px+ touch targets, rounded pill chips with bouncy state feedback, and celebratory confetti on copy.
- **Accessibility**: High contrast WCAG 2.2 AA compliant, full keyboard navigation, explicit ARIA labels.

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or navigate to the project
cd reviewai

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file:

```env
# Optional: Google Gemini API Key for dynamic AI generation
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Default restaurant overrides
NEXT_PUBLIC_RESTAURANT_NAME="Saffron & Spice Bistro"
NEXT_PUBLIC_GOOGLE_REVIEW_URL="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
```

*(Note: If no API key is provided, Review AI automatically uses its built-in deterministic fallback generator, so the entire flow works out-of-the-box!)*

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your mobile browser or emulator.

---

## 📂 Project Architecture

```
reviewai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── review-draft/route.ts   # Secure server-side AI endpoint
│   │   ├── globals.css                 # Culinary dark theme & animations
│   │   ├── layout.tsx                  # Mobile-first viewport & typography
│   │   └── page.tsx                    # 3-step review coordinator
│   ├── components/
│   │   ├── Header.tsx                  # Restaurant branding & settings trigger
│   │   ├── StepIndicator.tsx           # 3-step progress bar
│   │   ├── StepRatings.tsx             # Step 1: Star ratings with descriptions
│   │   ├── StepDishes.tsx              # Step 2: Categorized menu chips & notes
│   │   ├── StepDraft.tsx               # Step 3: AI draft, copy & Google link
│   │   ├── SettingsModal.tsx           # Owner settings (Review URL & name)
│   │   └── Footer.tsx                  # Transparency & privacy notice
│   ├── config/
│   │   └── restaurantConfig.ts         # Default menu items & restaurant metadata
│   ├── lib/
│   │   └── geminiReviewGenerator.ts    # AI prompt engineering & fallback engine
│   └── types/
│       └── review.ts                   # TypeScript interfaces & types
├── skills/                             # Custom AI skills
├── rules/                              # Behavioral and design rules
└── revwrite-review-tool-docs/          # PRD, TDD, and UI style guides
```

---

## ⚙️ Restaurant Customization

Restaurant managers can tap the **Settings icon** in the top header to configure:
1. **Restaurant Name & Cuisine** (e.g., *The Grand Maharaja Chaat House*).
2. **Direct Google Review URL**: Extracted directly from Google Business Profile ("Ask for reviews" link).
3. **Menu Categories**: Configured in `src/config/restaurantConfig.ts`.
