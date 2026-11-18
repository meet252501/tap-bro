# UI Style Guide — Honest Review Draft Assistant

**Version:** 1.0 · **Status:** Draft · **Date:** 18 November 2026

## 1. Design intent

Create a quick, clear, mobile-first review-writing experience inspired by the Reel's sequence: ratings → items tried → generated draft → copy/open Google. The interface should feel welcoming and polished, but never pressure the customer to leave a positive review. The system is an assistant to the customer's own account, not a review publisher.

## 2. Principles

- **Customer-led:** Customers choose ratings and details; no defaults imply praise.
- **Honest by design:** Ask about the real visit and make generated text editable.
- **Plain language:** Explain what happens before AI generation and external navigation.
- **Mobile-first:** Large touch targets, short screens, minimal typing.
- **Accessible:** Keyboard operation, screen reader labels, visible focus, high contrast.
- **Trustworthy:** No fake “posted!” message; distinguish copied, opened, generated, and submitted.

## 3. Page structure and flow

### Entry / Step 1: “How was your visit?”
- Short introduction: “Rate each part honestly. Your answers guide your personal draft.”
- Three independent rating groups: product/food, service/staff, overall recommendation.
- Five-star scale may match the familiar pattern in the Reel, but must be unselected at entry.
- Each group has text labels/context and accessible names; support 1–5 without forcing all questions if the research determines ratings should be optional.
- Progress indicator shows step position without relying on color alone.
- Primary action: “Next.”

### Step 2: “What did you try?”
- Selectable chips for actual menu/service items, e.g. Banarasi Chaat, South Indian, Sweets, Mithai, Dosa, Tamatar Chaat, Golgappe, Tikki Chaat, Dahi Bhalla.
- All chips default off. Selection state uses fill/border and accessibility state.
- Optional text box: “Anything else you want to mention?” Include space for constructive/negative comments as well as praise.
- Primary action: “Create my review draft.” Secondary action: “Back.”

### Step 3: “Your review draft”
- Clearly indicate the text is AI-assisted and not yet posted.
- English/Hinglish selection. Optional neutral/male/female grammatical wording selector; neutral default. Avoid describing these as voice options unless audio generation is added.
- Draft in an editable text area. User can correct details, tone, and grammar.
- Actions: “Regenerate draft,” “Copy my review,” “Open Google Reviews.”
- Include short posting guidance: copy → open Google → paste → verify and submit yourself.
- Copy confirmation says only “Review copied.” External navigation confirmation says only “Google Reviews opened.” Never claim the review was submitted.

## 4. Visual system

The inspiration uses a dark interface with gold/yellow controls. Preserve this identity while ensuring readability and reducing visual clutter.

### Color tokens
- `--page`: transparent or `#101114` depending embed context.
- `--surface`: `#1B1D22`.
- `--surface-raised`: `#25272D`.
- `--border`: `#454851`.
- `--text-primary`: `#F7F7F8`.
- `--text-secondary`: `#AEB1BA`.
- `--accent`: `#F5C84C` (CTA, selected state, focus accent; check contrast on dark surfaces).
- `--positive`: dark green surface with pale green text, used only for status confirmation, not review sentiment.
- Error: accessible red/orange treatment with explicit explanatory text.

Color is never the only status cue. Pair selected states with labels/aria-pressed. Verify contrast against WCAG 2.2 AA.

### Typography
- System sans-serif stack (Arial/Helvetica/system UI) for fast load and broad support.
- Page title 22–26px; question headings 15–17px; body 14–16px; helper text 12–13px with adequate contrast.
- Use sentence case, not all-caps paragraphs. Brand eyebrow may be uppercase and small.

### Layout and dimensions
- Content max-width 460px, centered.
- Card padding 20–24px; mobile outer padding 12–16px.
- Touch targets at least 44×44 CSS pixels where practical.
- Comfortable vertical rhythm; avoid dense multi-column layouts on narrow screens.
- Use responsive flex wrapping for chips and language/tone controls.
- Keep the primary action easy to reach; avoid sticky controls that obscure the form.

### Components
- **Progress bar:** Three-step progress with accessible textual step context.
- **Rating:** Five individual keyboard-operable choices, accessible labels such as “4 of 5.” Selected rating is visible in shape and color.
- **Chip:** Rounded pill; clear selected state; native button semantics.
- **Textarea:** Dark surface, border, visible focus, readable line height, limit disclosed where relevant.
- **Buttons:** One clear primary per step. Secondary/back buttons visually quieter but still legible.
- **Status:** `role=status`/live region for generation and copy messages, not disruptive alerts for routine success.
- **Error:** Explain what to fix and retain the customer's text.

## 5. Language and content voice

- Warm, respectful, direct, non-coercive.
- Do not use prompts like “Tell us what you loved” as the only framing; use neutral language like “Tell others about your visit.”
- Say “review draft” or “suggested wording,” not “your review is posted.”
- Avoid claiming “AI in seconds” until latency/provider behavior has been tested.
- For Hinglish, prefer natural conversational Romanized Hindi with the customer able to edit. Provide a neutral setting. “Male/Female” affects grammatical forms only if needed; never infer identity.
- Customer text can contain sensitive information. Warn not to enter private data and cap length.

## 6. Interaction details

- Ratings start unset; chosen value remains visible when navigating back.
- Dishes/topics start unselected; include optional “Other”/free text as appropriate.
- Generation starts only from explicit customer action.
- Loading state: “Creating a draft from your answers…”; prevent duplicate clicks.
- If generation fails, keep inputs and offer retry. Do not fabricate an output as an AI fallback.
- Regenerate changes phrasing while using the same facts. Do not silently clear edits without warning; either confirm replacement or preserve edited draft until regeneration is accepted.
- Copy the current edited content. If clipboard permission fails, select text and explain manual copy.
- Open Google only after explicit click and only if a valid HTTPS URL is configured.

## 7. Accessibility checklist

- All controls operable by keyboard, logical focus order, visible focus outline.
- Ratings announced with group label and current value.
- Chips and toggles expose pressed/selected state.
- Errors and success states announced through live regions.
- Contrast checked for text, buttons, borders, and focus ring.
- Respect reduced motion; avoid flashing/auto-advancing.
- Text zoom to 200% and narrow viewport do not cause horizontal scrolling.
- Do not communicate satisfaction or selection by color alone.

## 8. Responsive behavior

- At 320–460px: single-column card, wrapped chips, full-width CTA.
- At larger widths: card remains narrow/centered; no need to stretch text lines.
- Test Android Chrome and iOS Safari, including clipboard fallback and external link behavior.
- If embedded in Google Sites, test iframe height, focus, clipboard permission behavior, and navigation. Prefer direct hosted URL if embed restrictions interfere.
