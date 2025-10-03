# Twilio Forge: Access Granted

This repository contains follow-along steps and resources for the **"Twilio Forge: Access Granted"** workshop, focused on building a phone verification onboarding flow using Twilio Lookup and Verify APIs. It is designed to help you learn how to validate phone numbers, send verification codes, and create a complete user verification experience.

## 📖 Main Resource: The Runbook

The [RUNBOOK.md](./RUNBOOK.md) provides a step-by-step guide to:

- Setting up your Twilio account with API keys and Verify service
- Using Twilio Lookup API to validate phone numbers
- Implementing Line Type Intelligence and SMS Pumping Risk checks
- Sending verification codes via SMS and voice using Twilio Verify API
- Building a complete phone verification flow with a user-friendly UI
- Testing your implementation with Postman

**Read the [RUNBOOK.md](./RUNBOOK.md) for detailed instructions and workshop steps.**

> [!TIP]
> The workshop uses a scaffolded Express.js application. You'll implement the Twilio API calls in `lookup.js` and `verify.js`. If you get stuck, check the [`./final/`](./final/) directory for the complete implementation.

## 🚀 Quick Links

### Postman resources

- [Postman Collection](./Twilio%20Forge-%20Access%20Granted.postman_collection.json)
- [Postman Environment](./Forge-%20Access%20Granted.postman_environment.json)

Import these files into Postman to easily follow and test the API requests described in the Runbook.

### Workshop structure

This repository is structured for hands-on learning:

- **Root directory**: Contains scaffolded files (`lookup.js`, `verify.js`) where you'll implement the Twilio API calls
- **`./public/` directory**: Pre-built UI for testing your implementation
- **`./final/` directory**: Contains the complete, working implementation for reference

### Key files

- [`lookup.js`](./lookup.js) - Implement Twilio Lookup API routes (basic lookup, line type intelligence, SMS pumping risk)
- [`verify.js`](./verify.js) - Implement Twilio Verify API routes (send and validate verification codes)
- [`server.js`](./server.js) - Pre-configured Express.js server (no edits needed)

---

☮️
