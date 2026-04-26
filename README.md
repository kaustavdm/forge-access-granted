# Twilio Forge: Access Granted

This repository contains follow-along steps and resources for the **"Twilio Forge: Access Granted"** workshop, focused on building a user verification onboarding flow using Twilio Lookup, Verify, and Passkeys APIs.

## The Runbook

The [RUNBOOK.md](./RUNBOOK.md) is a step-by-step guide split into sections:

| # | Section | What You'll Build |
|---|---------|-------------------|
| 1 | [Setup](./RUNBOOK_1_SETUP.md) | Twilio credentials, Verify service, local dev environment |
| 2 | [Lookup Routes](./RUNBOOK_2_LOOKUP.md) | Phone validation, line type intelligence, SMS pumping risk |
| 3 | [Phone OTP Routes](./RUNBOOK_3_VERIFY_PHONE.md) | SMS/voice verification send and check |
| 4 | [Email OTP Routes](./RUNBOOK_4_VERIFY_EMAIL.md) | Email verification send and check (optional) |
| 5 | [Passkeys](./RUNBOOK_5_PASSKEYS.md) | WebAuthn passkey registration and authentication (optional) |

**Start with the [RUNBOOK.md](./RUNBOOK.md) for an overview and prerequisites.**

## Workshop Structure

This repository is structured for hands-on learning:

- **[`./build/`](./build/) directory**: Scaffolded files with TODO placeholders where you'll implement the Twilio API calls
- **[`./final/`](./final/) directory**: Complete, working implementation for reference
- **[`./postman/`](./postman/) directory**: Postman collection and environment for testing Twilio APIs directly

This project uses npm workspaces. Running `npm install` in the root directory installs dependencies for both `build/` and `final/`.

### Key Files

| File | Purpose | Edit? |
|------|---------|-------|
| `build/lookup.js` | Twilio Lookup v2 API routes | **Yes** |
| `build/verify/phone.js` | Phone OTP send and verify routes | **Yes** |
| `build/verify/email.js` | Email OTP send and verify routes | **Yes** |
| `build/verify/passkeys.js` | Passkey registration and authentication | **Yes** |
| `build/server.js` | Express server bootstrap | No |
| `build/lib/twilio-fetch.js` | Fetch wrapper with Twilio Basic auth | No |
| `build/lib/errors.js` | Shared error response helper | No |
| `build/public/` | Multi-page UI (phone, email, passkey, dashboard) | No |

### Running the Workshop

```bash
npm install        # Install all dependencies
npm start          # Run the build version (your workshop code)
npm run start:final  # Run the complete reference implementation
```
