# Workshop Build Files

This directory contains the scaffolded files for the "Twilio Forge: Access Granted" workshop. You will implement the Twilio API calls in these files as you follow along with the workshop.

## Files in this Directory

- `lib/twilio-fetch.js` - Lightweight fetch wrapper that injects Twilio Basic auth (no edits needed)
- `lib/errors.js` - Shared error response helper (no edits needed)
- `lookup.js` - Implement Twilio Lookup v2 API routes (basic lookup, line type intelligence, SMS pumping risk)
- `verify/phone.js` - Implement phone OTP send and verify routes
- `verify/email.js` - Implement email OTP send and verify routes
- `verify/passkeys.js` - Implement passkey registration and authentication routes
- `verify/index.js` - Sub-router mounting all verify routes (no edits needed)
- `server.js` - Pre-configured Express.js server (no edits needed)
- `public/` - Pre-built multi-page UI for testing your implementation

## Getting Started

1. Install dependencies from the root directory:
   ```
   cd ..
   npm install
   ```

2. Copy the `.env.example` file to `.env` and update it with your Twilio credentials:
   ```
   cp ../.env.example ../.env
   ```

3. Start the server:
   ```
   npm start
   ```

4. Access the application at `http://localhost:3000`

## Reference

If you get stuck, check the complete implementation in the `../final/` directory.

For detailed instructions, refer to the [RUNBOOK.md](../RUNBOOK.md) in the root directory.
