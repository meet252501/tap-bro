# Product Requirements Document — Honest Review Draft Assistant

**Status:** Draft for implementation  
**Version:** 1.0  
**Date:** 18 November 2026  
**Working name:** Review Draft Assistant (name to be confirmed)

## 1. Product summary

A mobile-first web experience opened from a QR code or NFC tap. It asks a customer about their actual visit, then uses an AI service to turn only those answers into an editable review draft. Customers can revise the text, copy it, and choose to open the business's public Google review form. The customer—not the system—decides whether to submit the review.

The project is inspired by the interaction shown in the supplied Instagram Reel: rating questions, dish selection, language/style controls, a generated draft, and copy/open-review instructions. The implementation must not reproduce deceptive or review-manipulation behavior.

## 2. Problem and opportunity

Many satisfied customers do not leave feedback because writing a review takes effort. Businesses also want useful feedback about specific parts of a visit. A short guided flow can reduce writing friction while preserving customer authorship and honest expression. The system must support positive, mixed, and negative experiences equally.

## 3. Goals

1. Let a customer create a review draft from their own visit details in about one minute.
2. Support English and Hinglish in the MVP, with language extensible later.
3. Make every draft editable and clearly label it as a draft/suggestion.
4. Avoid inventing details, ratings, sentiment, or claims the customer did not provide.
5. Let customers copy their draft and optionally open the configured review destination.
6. Protect model credentials by keeping them exclusively on the server.
7. Keep the customer flow usable on mobile and embeddable/launchable from a QR code.
8. Provide a low-cost or free-tier-capable deployment path without promising permanent free service.

## 4. Non-goals

- Automatically posting, rating, or submitting reviews.
- Creating fake reviews, review farms, or reviews on behalf of customers.
- Filtering customers by satisfaction, diverting negative customers away from public review platforms, or only soliciting positive ratings.
- Guaranteeing Google acceptance, ranking improvements, business growth, or continued free provider/hosting availability.
- Storing customer names, emails, phone numbers, Google accounts, or review histories in the MVP.
- Generating a review from a business's preferred talking points in place of the customer's account.
- A business analytics dashboard or multi-tenant SaaS administration in MVP.

## 5. Users and roles

### Customer
Scans a QR code/taps NFC, answers short questions, chooses what they experienced, reviews an AI draft, edits it, and optionally opens Google Reviews.

### Business owner/operator
Supplies business name, optional context, public review URL, available menu/service tags, and language options. They can update configuration without having access to customer drafts. MVP configuration may be environment/config-file based rather than a dashboard.

### Project operator
Maintains the app, AI provider integration, usage limits, hosting, privacy notice, and incident response.

## 6. Core customer journey

1. **Entry:** A QR/NFC link opens a business-branded mobile page. State which business the page is for; no account is required.
2. **Experience questions:** Customer rates food/product, service, and overall/recommendation using independent controls. Ratings are optional individually; no minimum positivity is required. It must remain possible to express criticism.
3. **Specifics:** Customer selects zero or more relevant items (e.g., Banarasi Chaat, Dosa) and may add a short free-text detail, including what could be improved.
4. **Language/tone:** Customer selects English or Hinglish and an optional writing voice/style. Gender-specific grammar is a presentation choice only, never an identity inference. Include neutral wording as default.
5. **Generation:** Customer explicitly requests a draft. The app sends only the entered answers and necessary business display context to the server-side generation endpoint. The model is instructed to use only supplied facts and not create claims, star ratings, offers, or recommendation strength not supported by inputs.
6. **Review and edit:** A draft appears in an editable field. The page explains that the text is AI-assisted and must be checked. Customer can edit/regenerate. Regeneration uses the same facts, not invented new experiences.
7. **Copy:** Customer copies the draft. If clipboard permission fails, expose/select text and show manual-copy guidance.
8. **Destination:** Customer may open the configured public review URL in a new tab. The page must not claim that clipboard content has been posted. Customer pastes, checks, and submits themselves.
9. **Exit:** Provide a back/edit path and a clear completion message; do not record the actual posted review.

## 7. Functional requirements

### FR-01 Business configuration
- Each deployment/page configuration has a display name, optional logo/color configuration, public review URL, enabled language set, and topic/tag list.
- Review URL must be HTTPS and validated before use. If missing, hide/disable the destination action and show an owner-facing setup message only in preview/configuration context.
- Do not inject arbitrary HTML/JavaScript from business settings.

### FR-02 Experience input
- Rating controls must support 1–5 and keyboard/screen-reader access.
- UI language must not force five stars. No rating is preselected as five stars; default is no rating selected.
- Dish/service options are user-selected and must not be inserted into a draft unless selected.
- Optional free text has a clear length limit and warns customers not to enter sensitive personal information.

### FR-03 Draft generation
- A visible action initiates generation. Show loading, success, validation, rate-limit, network, and provider error states.
- Generation must not occur on page load or after a silent event.
- Draft content is produced only from supplied input. AI must not claim “best in town,” “fresh,” “fast,” “friendly,” “will return,” or similar unless customer answers support that wording.
- Customer can choose to generate in English or Hinglish. User can edit output.
- Do not force a positive tone or require a 5-star review. Negative/mixed answers should be reflected accurately and respectfully.
- Regenerate must vary phrasing, not invent facts.

### FR-04 Copy and external review destination
- Copy action copies only the visible, edited draft.
- Destination opens only following an explicit click, in a separate tab/window with safe opener handling.
- If copy is blocked, show manual instructions and keep text selectable.
- Posting occurs only on the external platform under the customer's control.

### FR-05 Privacy and data handling
- Do not require identity/account sign-in.
- Do not persist draft text or individual ratings by default. The backend may process request transiently to generate a response.
- Do not log raw answers or generated draft in analytics/server logs. Logs may record timing, result class, rate-limit status, and aggregate non-identifying usage.
- Show a concise privacy notice stating that answers are sent to the AI service to create a draft, and name the provider after selection.
- Never send a Google password, account token, or private customer data to the model.

### FR-06 Abuse prevention and availability
- Enforce request size limits, input schema validation, rate limits, and basic bot/abuse protection at the server endpoint.
- Provide graceful fallback/error text. Do not silently substitute fabricated AI output if provider call fails.
- Apply provider-specific quotas and a configurable daily budget cap where available.

### FR-07 Accessibility and localization
- Responsive at 320px viewport width and above.
- WCAG 2.2 AA target for contrast, focus, labels, errors, controls, and screen-reader announcements.
- Visible focus indicators; keyboard-operable stars/chips/toggles; no meaning conveyed by color alone.
- Human-reviewed English and Hinglish UI copy. Generated Hinglish must remain editable and not assume gender.

## 8. AI behavior and review integrity safeguards

The AI's role is language assistance, not experience creation. It may organize, clarify, translate, or lightly polish what the customer says. It must not add facts from business marketing copy as if the customer experienced them. A generated output must be labeled as a draft and reviewed by the customer. The input/output model contract should encode unknowns explicitly rather than treating missing answers as positive.

The product must not use rating-dependent routing to suppress or intercept negative feedback. All users see the same option to open the public review destination. The app must not automatically append a star rating or claim that a review was posted.

## 9. Success measures

MVP instrumentation should avoid collecting review text. Candidate aggregate metrics:
- Flow completion rate (page visits to draft action / completed drafts), if privacy-safe analytics are enabled.
- Generation success/error rate and latency.
- Copy button success rate where browser permits measurement.
- Accessibility test pass rate and mobile usability feedback.
- Customer-reported usefulness through an optional non-leading feedback control.

Do not optimize on positive-star rate or attempt to increase review positivity.

## 10. Acceptance criteria

1. A customer can complete the flow on a phone without account creation.
2. No rating is prefilled and both positive and negative ratings can lead to the same generation/destination options.
3. Only selected experience tags and entered details appear in generated text.
4. If the customer leaves a detail blank, the draft does not invent one.
5. English/Hinglish and neutral/male/female wording controls work without changing factual content.
6. Draft is editable before copying; edited version is the version copied.
7. Missing/invalid review URL prevents destination navigation and shows a clear message.
8. Google opens only after a direct customer click; no automated submission occurs.
9. AI provider key is absent from client HTML, JavaScript, browser network responses, and source maps.
10. Error handling covers invalid input, offline/network error, rate limit, unavailable provider, and copy permission failure.
11. No raw draft or answers are retained in logs/storage by default.
12. Terms/privacy link and provider disclosure are visible before generation.

## 11. MVP scope and release plan

**Phase 0 — Decisions:** confirm provider/free plan, hosting target, business name, business review link, menu tags, and privacy/contact text.

**Phase 1 — UX & local QA:** complete mobile multi-step UI, accessible interactions, configuration example, and safe non-AI stub for layout/testing (clearly identified as a local preview only).

**Phase 2 — AI service:** add server-side provider adapter, constrained prompt/schema, validation, rate limits, secret storage, and privacy notice.

**Phase 3 — Pilot:** deploy one business instance, test on mobile browsers and Google Sites/NFC/QR entry path, monitor errors/costs without retaining review content.

**Phase 4 — Wider launch:** only after provider terms, privacy obligations, cost limits, and support process are reviewed.

## 12. Open decisions

- Which provider offers a usable free tier at launch, with what limits and data retention terms?
- Where will the page and generation endpoint be hosted? Is Google Sites embedding required, or is a standalone hosted page linked by QR preferred?
- Business name, URL, menu/service choices, preferred languages, and review link?
- What specific “male/female” choice is desired: Hindi grammatical gender, voice, or something else? The initial product interprets it only as optional grammatical style, not audio voice.
- Who owns provider billing/quota monitoring and deployment credentials?
- What privacy contact and retention statement should be published?
