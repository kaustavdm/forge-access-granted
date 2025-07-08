# Forge Access Granted

A multi-step user onboarding flow with email and phone verification using Twilio Verify and Lookup APIs.

## Overview

This application demonstrates a complete onboarding experience where users verify their email address and phone number through OTP (One-Time Password) codes. Built with Node.js, Fastify, and vanilla JavaScript for a clean, maintainable architecture.

### Features

- **Email Verification**: Send and validate OTP codes via email
- **Phone Verification**: Validate phone numbers using Twilio Lookup, then send SMS OTP
- **Multi-Step Flow**: Progressive onboarding with smooth step transitions
- **Error Handling**: Graceful error handling with user-friendly messages
- **Responsive Design**: Clean, modern UI that works on desktop and mobile
- **Modular Code**: Well-organized frontend and backend architecture

### Demo Flow

1. User enters email → receives email OTP → validates code
2. User enters phone → phone validation → receives SMS OTP → validates code
3. Success dashboard displayed

## Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- Twilio account with Verify & Lookup services enabled

### Installation

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

## Getting Twilio Credentials

You'll need three credentials from your Twilio Console:

### TWILIO_ACCOUNT_SID
- **Location**: [Twilio Console Dashboard](https://console.twilio.com/)
- **Format**: Starts with "AC" + 32 hex characters

### TWILIO_AUTH_TOKEN  
- **Location**: [Twilio Console Dashboard](https://console.twilio.com/) - click "Show" next to Auth Token
- **Security**: Keep this secret! Never expose in client code or repositories

### TWILIO_VERIFY_SERVICE_SID
- **Location**: [Twilio Console > Verify > Services](https://console.twilio.com/us1/develop/verify/services)
- **Setup**: Create a new Verify service if you don't have one
- **Format**: Starts with "VA" + 32 hex characters

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lookup` | POST | Validate phone number using Twilio Lookup |
| `/api/verify/email` | POST | Send email OTP |
| `/api/verify/email/validate` | POST | Validate email OTP |
| `/api/verify/phone` | POST | Send SMS OTP |
| `/api/verify/phone/validate` | POST | Validate SMS OTP |

## Project Structure

```
forge-access-granted/
├── .env                    # Environment variables (not in git)
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── package.json           # Project dependencies
├── server.js              # Main Fastify server
├── runbook.md             # Detailed implementation guide
└── public/                # Static frontend files
    ├── index.html         # HTML structure
    ├── style.css          # Styling
    └── main.js            # Frontend JavaScript
```

## Technology Stack

- **Backend**: [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- **Verification**: [Twilio Verify API](https://www.twilio.com/docs/verify) - Email and SMS OTP
- **Validation**: [Twilio Lookup API](https://www.twilio.com/docs/lookup) - Phone number validation
- **Frontend**: Vanilla HTML/CSS/JavaScript - No frameworks, pure web standards

## Testing

### Manual Testing

Test the email verification:
```bash
curl -X POST http://localhost:3000/api/verify/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Test phone lookup:
```bash
curl -X POST http://localhost:3000/api/lookup \
  -H "Content-Type: application/json" \
  -d '{"phone":"+15551234567"}'
```

## Common Issues

### "Username is required" Error
- **Cause**: Missing Twilio credentials
- **Fix**: Check your `.env` file has correct `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`

### Email/SMS Not Received
- **Email**: Check spam folder, verify email address
- **SMS**: Ensure phone number is valid and mobile (not landline)
- **Debug**: Check [Twilio Console](https://console.twilio.com/) for delivery logs

### "Converting circular structure to JSON" Error
- **Cause**: Already fixed in this implementation
- **Note**: We extract only essential properties from Twilio responses

## Production Considerations

- **Rate Limiting**: Add rate limiting for OTP endpoints
- **Input Validation**: Validate inputs on both client and server
- **HTTPS**: Use HTTPS in production
- **Environment Variables**: Never commit `.env` to version control
- **Monitoring**: Monitor delivery rates and conversion metrics

## Documentation

- **[runbook.md](./runbook.md)** - Complete implementation guide with step-by-step instructions
- **[Twilio Verify Documentation](https://www.twilio.com/docs/verify)**
- **[Twilio Lookup Documentation](https://www.twilio.com/docs/lookup)**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ using Twilio, Fastify, and modern web standards**
