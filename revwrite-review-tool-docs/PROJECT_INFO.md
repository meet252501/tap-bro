# Project Information

## Current project

- **Working title:** Honest Review Draft Assistant
- **Product form:** Mobile-first web page, QR/NFC accessible
- **Inspiration:** User-supplied Instagram Reel showing ratings, dish selection, language/style options, an AI review draft, and copy/open-Google steps
- **Primary purpose:** Help a customer express their own genuine experience more easily
- **Primary platform:** Browser on mobile; embeddable/linkable from a business site
- **Current artifact:** A standalone HTML interaction prototype exists in the user's shared files. It is not deployed and its draft generation is template-based, not AI.

## User experience intended

1. Customer arrives from QR/NFC.
2. Customer rates experience categories honestly.
3. Customer chooses products/dishes/services they actually tried and may add a specific comment.
4. Customer chooses English/Hinglish and optional grammatical style.
5. Server-side AI proposes a draft based only on the customer's submitted details.
6. Customer edits, copies, and optionally opens the public review page.
7. Customer independently decides whether to submit.

## Product integrity rules

- Equal support for positive, mixed, and negative experiences.
- No fake or unsupported claims.
- No default five stars and no rating-based diversion.
- No auto-posting or claim of submission.
- Customer must be able to edit and decline to post.
- Do not store free-text answers or generated drafts by default.

## Configuration needed from business

- Business display name and optional logo.
- Direct public Google review URL.
- Menu/service choices to show as tags.
- Whether English and Hinglish are sufficient for MVP.
- Optional business color palette and contact/privacy text.
- QR/NFC destination URL after hosting is established.

## Technical decisions not yet made

- AI provider, model, free quota, and provider data-retention terms.
- Frontend/API hosting provider, domain, and deployment account.
- Standalone site versus Google Sites embed. Standalone hosted URL is preferred if iframe/API restrictions cause issues.
- Usage-limit mechanism and privacy-preserving operational analytics.

## Readiness checklist

### Product
- [ ] Confirm business context, menu/service tags, supported languages, and review URL.
- [ ] Confirm neutral wording for ratings and non-positive feedback.
- [ ] Approve privacy notice and AI-provider disclosure.

### AI and backend
- [ ] Select a provider after checking current pricing/free tier, commercial terms, data retention, and availability.
- [ ] Create provider account/API key under the project owner's control.
- [ ] Store key in server-side secret manager only.
- [ ] Implement input/output validation, rate limits, size caps, and budget ceiling.
- [ ] Test hallucination resistance against positive, mixed, and negative examples.

### Hosting and launch
- [ ] Select hosting and deployment account owner.
- [ ] Configure HTTPS and server endpoint.
- [ ] Configure business public settings without secrets.
- [ ] Test Android/iOS, keyboard accessibility, screen readers, clipboard fallback, and Google URL.
- [ ] Generate QR/NFC link only after production URL is stable.
- [ ] Test quota exhaustion and provider outage behavior.

### Operations
- [ ] Define who monitors quotas and errors.
- [ ] Define key rotation and emergency disable process.
- [ ] Decide whether any non-text aggregate analytics are necessary (default: no analytics until justified).
