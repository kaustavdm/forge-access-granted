# Final Implementation

This directory contains the complete, working implementation of the "Twilio Forge: Access Granted" workshop. Use these files as a reference if you get stuck while working on the workshop exercises in the `../build/` directory.

## Files in this Directory

- `lib/twilio-fetch.js` - Lightweight fetch wrapper that injects Twilio Basic auth
- `lib/errors.js` - Shared error response helper
- `lookup.js` - Twilio Lookup v2 API routes (phone validation, line type, SMS pumping risk)
- `verify/phone.js` - Phone OTP send and verify routes
- `verify/email.js` - Email OTP send and verify routes
- `verify/passkeys.js` - Passkey registration and authentication routes
- `verify/index.js` - Sub-router mounting all verify routes
- `server.js` - Express server bootstrap
- `public/` - Multi-page UI (phone → email → passkey → dashboard)

## Running the Final Version

1. Install dependencies:
   ```
   cd final
   npm install
   ```

2. Copy the `.env.example` file from the root directory to `.env` and update it with your Twilio credentials:
   ```
   cp ../.env.example ../.env
   ```

3. Start the server:
   ```
   node server.js
   ```

4. Access the application at `http://localhost:3000`

## Workshop Instructions

For detailed workshop instructions, refer to the runbooks in the root directory:

- [RUNBOOK.md](../RUNBOOK.md) - Main workshop: phone lookup, SMS/Voice/Email verification
- [RUNBOOK_PASSKEYS.md](../RUNBOOK_PASSKEYS.md) - Passkeys extension: passwordless authentication with WebAuthn
