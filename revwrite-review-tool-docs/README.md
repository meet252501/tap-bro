# Review Draft Assistant — Project Documentation

This folder contains the planning documents for a mobile-first web tool that helps customers turn their own visit details into an editable AI-assisted review draft.

## Documents

- [PRD.md](PRD.md) — user needs, product scope, functional requirements, guardrails, acceptance criteria, and rollout.
- [TDD.md](TDD.md) — proposed architecture, API contract, provider adapter, privacy/security, tests, and operations.
- [UI_STYLE_GUIDE.md](UI_STYLE_GUIDE.md) — screen flow, components, visual tokens, copy tone, responsive behavior, accessibility.
- [PROJECT_INFO.md](PROJECT_INFO.md) — project facts, assumptions, and implementation checklist.
- [DECISIONS.md](DECISIONS.md) — decisions and unresolved questions.

## What the product should do

A customer scans a QR code or taps an NFC tag, rates their actual experience, selects items they tried, and optionally adds details. A server-side AI service produces an editable draft in a chosen language/style. The customer copies it and may open Google Reviews to paste and submit it themselves.

The app must not create false experiences, preselect positive ratings, divert negative feedback, post automatically, or claim a review has been published.

## Important implementation note

The current HTML mockup is a front-end interaction prototype. It assembles draft text locally and is **not connected to an AI service**. For a real AI version, implement the server endpoint and secret handling described in `TDD.md`. Never place an AI API key in HTML, client-side JavaScript, or Google Sites embed code.

## How to use these docs

Use `PRD.md` as the product source of truth, `TDD.md` for engineering planning, and `UI_STYLE_GUIDE.md` during design and implementation. Resolve items in `DECISIONS.md` before production deployment. Provider and hosting pricing/free tiers must be checked at implementation time; “free” service limits and terms can change.
