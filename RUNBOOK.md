# Forge Access Granted – Workshop Runbook

- **Workshop:** Twilio Forge: Access Granted
- **Focus:** User Verification with Twilio Verify, Lookup, and Passkeys
- **Tech Stack:** Node.js (Express), Twilio Verify, Twilio Lookup, WebAuthn
- **Duration:** ~90 min to build
- **Outcome:** Complete onboarding flow with phone, email, and passkey verification

---

## Prerequisites

- **Node.js** (latest LTS version recommended)
- **Twilio Account**, upgraded and active. Verify Passkeys enabled on account to use Passkeys.
- **Supported browser** for passkeys: Chrome 118+, Safari 17+, Firefox 119+, or Edge 118+
- **Basic knowledge:** JavaScript/Node.js, HTML/CSS, HTTP APIs

---

## Project Structure

This workshop uses npm workspaces to simplify dependency management:

- **Root directory**: Configuration files and documentation
- **`./build/` directory**: Scaffolded files where you'll implement the Twilio API calls
- **`./final/` directory**: Complete implementation for reference

The npm scripts make it easy to run either version:

- `npm start` (or `npm run start:build`): Run the workshop version you're building
- `npm run start:final`: Run the completed reference implementation

### Key Files in `build/`

| File                  | Purpose                                             | Edit?   |
| --------------------- | --------------------------------------------------- | ------- |
| `server.js`           | Express server bootstrap                            | No      |
| `lib/twilio-fetch.js` | Fetch wrapper with Twilio Basic auth                | No      |
| `lib/errors.js`       | Shared error response helper                        | No      |
| `lookup.js`           | Twilio Lookup v2 API routes                         | **Yes** |
| `verify/phone.js`     | Phone OTP send and verify routes                    | **Yes** |
| `verify/email.js`     | Email OTP send and verify routes                    | **Yes** |
| `verify/passkeys.js`  | Passkey registration and authentication routes      | **Yes** |
| `verify/index.js`     | Sub-router mounting all verify routes               | No      |
| `public/`             | Multi-page UI (phone → email → passkey → dashboard) | No      |

---

## Workshop Sections

| #   | Section                                                   | File                        | Duration | Optional? |
| --- | --------------------------------------------------------- | --------------------------- | -------- | --------- |
| 1   | [Setup](./RUNBOOK_1_SETUP.md)                             | `RUNBOOK_1_SETUP.md`        | ~15 min  | No        |
| 2   | [Implement Lookup Routes](./RUNBOOK_2_LOOKUP.md)          | `RUNBOOK_2_LOOKUP.md`       | ~15 min  | No        |
| 3   | [Implement Phone OTP Routes](./RUNBOOK_3_VERIFY_PHONE.md) | `RUNBOOK_3_VERIFY_PHONE.md` | ~15 min  | No        |
| 4   | [Implement Email OTP Routes](./RUNBOOK_4_VERIFY_EMAIL.md) | `RUNBOOK_4_VERIFY_EMAIL.md` | ~10 min  | Yes       |
| 5   | [Implement Passkeys](./RUNBOOK_5_PASSKEYS.md)             | `RUNBOOK_5_PASSKEYS.md`     | ~20 min  | Yes       |

---

## Demo: Verify with All Configured Factors

After completing all sections, you can run through the complete onboarding flow:

1. Start the server: `npm start`
2. Open `http://localhost:3000`
3. Enter a phone number → receive and verify SMS OTP
4. Enter an email → receive and verify email OTP
5. Register a passkey using biometrics (Touch ID, Face ID, Windows Hello)
6. View the dashboard with verification status
7. Click "Start over" and sign in with your passkey to skip directly to the dashboard

---

## Resources

- [Twilio Lookup v2 API](https://www.twilio.com/docs/lookup/v2-api)
- [Twilio Verify API](https://www.twilio.com/docs/verify/api)
- [Twilio Verify Passkeys](https://www.twilio.com/docs/verify/passkeys)
- [WebAuthn Guide (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- [Postman Collection](./postman/Twilio%20Forge-%20Access%20Granted.postman_collection.json) (supplementary)
