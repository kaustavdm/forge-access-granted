# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A hands-on workshop repo for **Twilio Forge: Access Granted** — participants build a user verification onboarding flow using Twilio Lookup v2, Verify (phone/email OTP), and Passkeys (WebAuthn). Structured for follow-along learning, not production use.

## Commands

```bash
npm install            # Install all workspace dependencies (root, build/, final/)
npm start              # Run the build/ server (participant version)
npm run start:final    # Run the final/ server (reference implementation)
```

No test suite, no linter, no build step. Express on port 3000 (`PORT` env var). Requires `.env` — see `.env.example`.

## Architecture

### The Three-Way Invariant

**`build/` + RUNBOOKs = `final/`** — this is the core constraint.

- `final/` — complete, working implementation (source of truth for behavior)
- `build/` — scaffolded version with TODO placeholders where participants write code
- `RUNBOOK_*.md` — step-by-step instructions that tell participants what to fill in

A TODO comment in `build/` corresponds to a RUNBOOK section number and to the completed code in the same `final/` file.

### Edit Workflow

- **New features:** Edit `final/` first. Then propagate to `build/` (with appropriate TODOs) and update relevant RUNBOOKs.
- **Bug fixes / existing features:** `build/` and `final/` can be edited in parallel, but changes MUST be applied across all three (relevant `build/`, `final/`, and RUNBOOK files) in the same commit set.
- **TODO numbering:** `build/` TODO comments use section numbers (e.g., `// 2.1 Basic Lookup`) matching RUNBOOK sections. If RUNBOOK numbers change, `build/` TODOs must be updated to match.

### Project Layout (identical in `build/` and `final/`, npm workspaces)

```
server.js                  # Express bootstrap, env validation, route mounting
├── lib/twilio-fetch.js    # fetch() wrapper with Twilio Basic auth (API Key)
├── lib/errors.js          # errorRes() helper
├── lookup.js              # GET /api/lookup/:phone (Lookup v2)
├── verify/index.js        # Sub-router mounting phone, email, passkeys
│   ├── verify/phone.js    # POST /api/verify/phone, /api/verify/phone/validate
│   ├── verify/email.js    # POST /api/verify/email, /api/verify/email/validate
│   └── verify/passkeys.js # POST /api/passkeys/* (register, authenticate)
└── public/                # Multi-page static UI
    ├── css/style.css      # Single stylesheet for all pages
    ├── js/shared.js       # App global (state, api, ui helpers)
    ├── js/phone.js        # Phone verification + passkey sign-in
    ├── js/email.js        # Email verification
    ├── js/passkey.js      # Passkey registration
    └── js/dashboard.js    # Onboarding checklist + passkey verify
```

### Twilio API Integration

- Route modules receive `twilioFetch` via `initialize()` called from `server.js` — module-scoped `let`, no classes
- Uses raw `fetch()` via `createTwilioFetch()` — **not** the Twilio SDK
- Auth: HTTP Basic with API Key SID + Secret (not Account SID + Auth Token)
- Lookup: GET to `https://lookups.twilio.com/v2/PhoneNumbers/`
- Verify OTP: POST form-urlencoded to `https://verify.twilio.com/v2/Services/{SID}/`
- Passkeys: POST JSON to `https://verify.twilio.com/v2/Services/{SID}/Passkeys/`

## Code Style

- CommonJS (`require`/`module.exports`), `"use strict"` in every file
- Flat module-scoped variables, small composable functions with verb prefixes (`handle*`, `setup*`, `build*`, `pick*`, `post*`)
- No classes, no OOP abstractions
- Vanilla JS frontend — no framework, no bundler, IIFE-wrapped per file
- Single global `App` object (`shared.js`): `App.api`, `App.ui`, `App.state`
- `App.state` persists to `localStorage` with `forge_` prefixed keys
- `document.getElementById()` over `querySelector`; event binding at bottom of file
- Multiple `<script>` tags per HTML page (`shared.js` loaded first)
- Multi-page flow: `phone.html` → `email.html` → `passkey.html` → `dashboard.html` (pages can be skipped)

## RUNBOOK Management

- `RUNBOOK.md` — index file with section table and prerequisites; not a tutorial itself
- `RUNBOOK_N_NAME.md` — one file per workshop section, numbered to match `build/` TODO prefixes
- Each section file opens with prev/next navigation links and closes with a link to the next section
- Section numbers in RUNBOOK filenames, section headers, and `build/` TODO comments must all stay in sync
- When adding a section: create `RUNBOOK_N_NAME.md`, update the table in `RUNBOOK.md`, add corresponding TODO comments in `build/`, and add completed code in `final/`
- When removing or reordering sections: rename affected files, update `RUNBOOK.md` table, update prev/next links in neighbouring section files, and renumber all affected `build/` TODOs

## Files NOT to Edit in `build/`

Keep identical to `final/` (except the `Running: build` log label in `server.js`):

`server.js`, `lib/twilio-fetch.js`, `lib/errors.js`, `verify/index.js`, `public/`
