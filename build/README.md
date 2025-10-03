# Workshop Build Files

This directory contains the scaffolded files for the "Twilio Forge: Access Granted" workshop. You will implement the Twilio API calls in these files as you follow along with the workshop.

## Files in this Directory

- `lookup.js` - Implement Twilio Lookup API routes (basic lookup, line type intelligence, SMS pumping risk)
- `verify.js` - Implement Twilio Verify API routes (send and validate verification codes)
- `server.js` - Pre-configured Express.js server (no edits needed)
- `/public/` - Pre-built UI for testing your implementation

## Getting Started

1. Make sure you've installed the dependencies from the root directory:
   ```
   cd ..
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

## Reference

If you get stuck, you can check the complete implementation in the `../final/` directory.

For detailed instructions, refer to the [RUNBOOK.md](../RUNBOOK.md) in the root directory.