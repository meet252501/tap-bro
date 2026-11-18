# Decisions and Open Questions

Use this document to track decisions before production implementation.

## Decisions already established

### D-001: Customer remains the author and publisher
**Status:** Accepted  
The app may suggest wording based on customer answers, but the customer edits and submits any review themselves. No automatic posting.

### D-002: Do not fabricate or filter feedback
**Status:** Accepted  
No preselected five-star ratings, no suppression/diversion of negative experiences, and no claims beyond the customer's input.

### D-003: Keep model credentials server-side
**Status:** Accepted  
No AI API key in client code, HTML embeds, query strings, or public configuration.

### D-004: No review text persistence in MVP
**Status:** Proposed default  
Do not log/store raw answers or generated drafts. Confirm provider data handling before launch.

### D-005: Prefer standalone hosted page over embed if needed
**Status:** Recommendation  
Use a QR/NFC URL pointing to the hosted page directly if Google Sites iframe restrictions prevent reliable API calls, clipboard, or navigation.

## Decisions requiring owner input

### O-001: AI provider and model
What provider is acceptable? It should have a viable free tier or low-cost plan, acceptable commercial-use terms, supported language quality for Hinglish, and suitable data handling. Verify current terms and limits during implementation; do not assume a free tier is permanent.

### O-002: Hosting
Where should the frontend and server-side endpoint be deployed, and who owns that account? Confirm whether the user has a custom domain or wants a provided hosting URL.

### O-003: Business identity and review link
What business name, direct public Google review link, and logo/colors should the tool display?

### O-004: Menu/service list
Which choices should customers see? Current sample tags are illustrative only.

### O-005: Language/style controls
Should the MVP support English and Hinglish only? Does “male/female” mean Hindi grammatical agreement (as represented in current drafts) or an audio voice? Audio is not in MVP scope.

### O-006: Privacy notice
Who is the data controller/contact, what privacy contact should be shown, and should any non-identifying analytics be enabled?

### O-007: Free-tier quota management
Who monitors usage and chooses the maximum daily/monthly requests or spend? What user-facing message should appear on quota exhaustion?

## Change log

- 2026-11-18 — Initial documentation bundle drafted from user request and supplied Reel flow.
