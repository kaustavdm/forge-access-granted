# Forge Access Granted

A multi-step user onboarding flow with email and phone verification using Twilio Verify and Lookup APIs.

## Overview

This application demonstrates a complete onboarding experience where users verify their email address and phone number through OTP (One-Time Password) codes. Built with Node.js, Fastify, and vanilla JavaScript for a clean, maintainable architecture.

### Demo Flow

1. User enters email → receives email OTP → validates code
2. User enters phone → phone validation → receives SMS OTP → validates code
3. Success dashboard displayed

## Quick Start

### Prerequisites

- Node.js (latest LTS version recommended)
- Twilio account with Verify & Lookup services enabled
- Sendgrid account with domain configured to send verify emails
- Verify service Email sender configured

### Getting Twilio Credentials

You'll need three credentials from your Twilio Console:

`TWILIO_ACCOUNT_SID`:

- **Location**: [Twilio Console Dashboard](https://console.twilio.com/)
- **Format**: Starts with "AC" + 32 hex characters

`TWILIO_AUTH_TOKEN`:

- **Location**: [Twilio Console Dashboard](https://console.twilio.com/) - click "Show" next to Auth Token
- **Security**: Keep this secret! Never expose in client code or repositories

`TWILIO_VERIFY_SERVICE_SID`:

- **Location**: [Twilio Console > Verify > Services](https://console.twilio.com/us1/develop/verify/services)
- **Setup**: Create a new Verify service if you don't have one
- **Format**: Starts with "VA" + 32 hex characters

### Installation

If you want to give the demo a try, without going through the runbook:

<details>
<summary>View installation steps</summary>

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd forge-access-granted
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Twilio credentials
   ```

4. **Configure Twilio credentials in `.env`**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PORT=3000
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```
</details>

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lookup` | POST | Validate phone number using Twilio Lookup |
| `/api/verify/email` | POST | Send email OTP |
| `/api/verify/email/validate` | POST | Validate email OTP |
| `/api/verify/phone` | POST | Send SMS OTP |
| `/api/verify/phone/validate` | POST | Validate SMS OTP |

## Documentation

- **[runbook.md](./runbook.md)** - Complete implementation guide with step-by-step instructions
- **[Twilio Verify Documentation](https://www.twilio.com/docs/verify)**
- **[Twilio Lookup Documentation](https://www.twilio.com/docs/lookup)**

---

☮️
