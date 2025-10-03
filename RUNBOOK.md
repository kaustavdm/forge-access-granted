# Forge Access Granted – Onboarding Flow Runbook

> **Project:** Onboarding with Phone Verification
> **Focus:** Seamless User Verification Using Twilio Verify & Lookup
> **Tech Stack:** Node.js (Express), Twilio Verify, Twilio Lookup
> **Duration:** ~60 min to build
> **Outcome:** Complete onboarding flow with phone verification

---

## Prerequisites

- **Node.js** (latest LTS version recommended)
- **HTTP client**, Postman preferred
- **Twilio Account**, upgraded and active
- **Basic knowledge:** JavaScript/Node.js, HTML/CSS, HTTP APIs

---

## Build

### 1. Setup

#### 1.1 Create Twilio API keys

1. Log in to your [Twilio Console](https://console.twilio.com/)
2. Navigate to Account Info > API Keys
3. Click "Create API Key"
4. Enter a friendly name for your API key (e.g., "Forge Access Granted")
5. Save your API Key SID and Secret securely - the Secret will only be shown once!

#### 1.2 Setup Postman

1. Download and install [Postman](https://www.postman.com/downloads/) if you haven't already
2. Import the [Postman collection](./Twilio%20Forge-%20Access%20Granted.postman_collection.json) included in this repository
3. Import the [Postman environment](./Forge-%20Access%20Granted.postman_environment.json) or Create a new Environment in Postman with the following variables:
   - `TWILIO_API_KEY_SID`: Your Twilio API Key SID
   - `TWILIO_API_KEY_SECRET`: Your Twilio API Key Secret
   - `PHONE_NUMBER`: A phone number to test with (in E.164 format, e.g., +1234567890)
   - `COUNTRY_CODE`: Your country code (e.g., US)
   - `VERIFY_SERVICE_SID`: Your Twilio Verify Service SID (we'll create this later)
   - `APP_URL`: http://localhost:3000

#### 1.3 Clone repo and setup application

```bash
# Clone the repository
git clone <repository-url>
cd forge-access-granted

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
cp .env.example .env
# Edit .env with your credentials

# Start the server
node server.js
```

---

### 2. Lookup phone numbers using Twilio API (using Postman)

#### 2.1. Basic Lookup

The Lookup API allows you to verify whether a phone number exists and get additional information about it.

1. In Postman, select the "2.1 Lookup - Basic" request
2. Make sure your environment is selected with the correct `PHONE_NUMBER` variable
3. Send the request
4. Observe the response, which includes:
   - `valid`: Whether the phone number is valid
   - `phoneNumber`: The phone number in E.164 format
   - `nationalFormat`: The local format of the phone number
   - `countryCode`: Two-letter country code (e.g., US)
   - `callingCountryCode`: The country calling code (e.g., 1)

You can also provide a national number with a country code:

1. Select the "2.1 Lookup - Basic - national number and country code" request
2. Update the `PHONE_NUMBER` and `COUNTRY_CODE` variables in your environment
3. Send the request
4. Observe the response

#### 2.2 Lookup with Line Type Intelligence

Line Type Intelligence helps you determine if a phone number is a mobile, landline, or VoIP number:

1. Select the "2.2 Lookup - Line Type Intelligence" request
2. Observe the added query param for `Fields` set to `line_type_intelligence`.
3. Send the request
4. Observe the extended response, which includes:
   - `line_type_intelligence`: Contains information about the line type intelligence
   - `line_type_intelligence.type`: Tells you whether the number is a mobile, landline, voip etc.

#### 2.3 Lookup with SMS Pumping Risk check

SMS Pumping Risk check helps identify numbers that might be used for SMS fraud:

1. Select the "2.3 Lookup - SMS pumping risk" request
2. Observe the added query param for `Fields` set to `sms_pumping_risk`.
3. Send the request
4. Observe the response, which includes:
   - `sms_pumping_risk`: Risk assessment information

#### 2.4 Lookup for multiple data packages

You can request multiple data packages in a single lookup:

1. Select the "2.4 Lookup - Multiple packages" request
2. Observe the added query param for `Fields` set to multiple package names.
3. Send the request
4. Observe the comprehensive response with multiple data packages

> [!TIP]
> For a list of all available data packages for Lookup, see [Lookup V2 API docs](https://www.twilio.com/docs/lookup/v2-api).

---

### 3. Implement lookup in code

In your code editor, open [`server.js`](./server.js), [`verify.js`](./verify.js) and [`lookup.js`](./lookup.js). The `./public/` directory contains a basic HTML application that we will use as the UI. We only need to add functionality in the lookup and verify routes.

- `server.js` bootstraps a basic ExpressJS application. It contains a functional application, so you don't need to edit this file, but take a quick look to familiarise yourself. The key points are:
  - Load .env file and populate environment variables
  - Setup basic logging, middlewares, request logging and interrupt handling
  - Mount the `./public/` directory as static file server on `/`
  - Mount routes from `lookup.js` at `/api/lookup`
  - Mount routes from `verify.js` at `/api/verify`
- `lookup.js` contains the route scaffolding for interacting with the Twilio Lookup API. You will implement the Twilio API calls in this file.
- `verify.js` contains the route scaffolding for interacting with the Twilio Verify API. You will implement the Twilio API calls in this file.

#### 3.1 Implement basic lookup

Open `lookup.js` and locate the endpoint `GET /:phone`. This endpoint should handle basic phone number lookups.

**Your task:** Implement the Twilio Lookup API call in this endpoint.

Key implementation points:

- Use `twilioClient.lookups.v2.phoneNumbers(phone).fetch()` to lookup the phone number
- If a `countryCode` query parameter is provided, pass it as an option: `fetch({ countryCode })`
- Return a JSON response with: `valid`, `phoneNumber`, `nationalFormat`, `countryCode`, `callingCountryCode`, and `validationErrors`
- The error handling is already implemented

To test the implementation:

1. Start your server: `npm start`
2. In Postman, select the "Application endpoints" folder
3. Send the "2.1 Basic lookup" request
4. You should receive a response with phone number details

#### 3.2 Implement lookup with line type intelligence

Locate the endpoint `GET /:phone/line-type` in `lookup.js`.

**Your task:** Implement lookup with line type intelligence.

Key implementation points:

- Use `twilioClient.lookups.v2.phoneNumbers(phone).fetch({ fields: ["line_type_intelligence"] })`
- Extract the line type from `result.lineTypeIntelligence?.type`
- Return helpful booleans like `isMobile: lineType === "mobile"` and `isLandline: lineType === "landline"`
- Include the same basic fields as the previous endpoint

Test this implementation:

1. Send the "2.2 Lookup with Line Type Intelligence" request
2. Verify that the response includes the line type information

#### 3.3 Implement lookup with SMS pumping check

Locate the endpoint `GET /:phone/sms-pumping` in `lookup.js`.

**Your task:** Implement lookup with SMS pumping risk assessment.

Key implementation points:

- Use `twilioClient.lookups.v2.phoneNumbers(phone).fetch({ fields: ["sms_pumping_risk"] })`
- Return `smsPumpingRisk` from the result along with basic phone number fields

Test this implementation:

1. Send the "2.3 Lookup with SMS Pumping Risk check" request
2. Verify that the response includes the SMS pumping risk information

#### 3.4 Implement lookup with multiple checks

Locate the endpoint `GET /:phone/multiple` in `lookup.js`.

**Your task:** Implement lookup with multiple data packages.

Key implementation points:

- Request multiple fields: `["line_type_intelligence", "sms_pumping_risk", "caller_name"]`
- Join the array with commas: `fields: ["line_type_intelligence", "sms_pumping_risk", "caller_name"].join()`
- Return the complete Twilio response

Test this implementation:

1. Send the "2.4 Lookup with multiple packages" request
2. Verify that the response includes multiple data packages

#### 3.5 Test the APIs so far + showcase UI for phone screen

Now that we've implemented and tested the Lookup APIs, let's check out the UI:

1. Open your browser to `http://localhost:3000`
2. You should see the phone number input form
3. Enter a valid phone number and click "Send OTP"

The UI automatically uses the Lookup API to validate the phone number before attempting to send an OTP.

#### 3.6 Review

Let's review what you've implemented so far:

- Basic phone number validation with Twilio Lookup
- Enhanced validation with Line Type Intelligence
- Fraud prevention with SMS Pumping Risk check
- Multiple data package lookup for comprehensive information
- A clean UI that integrates with these APIs

> **Hint:** If you get stuck, check the `./final/` directory for the complete implementation.

### 4. Implement Verify code for phone

#### 4.1. Implement verify init for phone over SMS

Open `verify.js` and locate the endpoint `POST /phone`. This endpoint should send verification codes via SMS or voice call.

**Your task:** Implement the Twilio Verify API call to initiate verification.

Key implementation points:

- Determine the channel: use `"sms"` by default, or `"call"` if the `channel` parameter is set to `"call"`
- Use `twilioClient.verify.v2.services(verifyServiceSid).verifications.create({ to: phone, channel })`
- Return a success response: `{ success: true }`
- Input validation is already implemented

Test this implementation:

1. Send the "3.1 Phone verification start - SMS" request
2. Verify that you receive an SMS with a verification code

#### 4.2. Resend code strategy

The same endpoint `/api/verify/phone` you just implemented can be used to resend verification codes.

Key implementation points:

- Your implementation already handles resending - just call the endpoint again
- The frontend maintains a cooldown timer to prevent abuse
- Twilio Verify handles rate limiting on the server side

Test this implementation:

1. Send the "3.2. Phone verification resend - SMS" request
2. Verify that you receive another SMS with a verification code

#### 4.3. Resend code over Voice

Your `/api/verify/phone` implementation already supports sending verification codes via voice call when the `channel` parameter is set to `"call"`.

Key points:

- Your code should accept a `channel` parameter (`"sms"` or `"call"`)
- Default to `"sms"` if no channel is specified
- Twilio Verify handles the voice call automatically

Test this implementation:

1. Send the "3.3 Phone verification resend - Voice" request
2. Verify that you receive a phone call with the verification code

#### 4.4. Implement code validation

Locate the endpoint `POST /phone/validate` in `verify.js`.

**Your task:** Implement the Twilio Verify API call to validate the verification code.

Key implementation points:

- Use `twilioClient.verify.v2.services(verifyServiceSid).verificationChecks.create({ to: phone, code })`
- Check if `result.status === "approved"`
- Return `{ valid: true }` or `{ valid: false }` based on the status
- Input validation is already implemented

Test this implementation:

1. Send the "3.1 Phone verification start - SMS" request to get a code
2. When you receive the code, update the `VERIFY_CODE` variable in your Postman environment
3. Send the "3.4 Validate Verify token for phone" request
4. Verify that you receive a response with `"valid": true`

#### 4.5. Demo the UI

Now test your complete implementation in the UI:

1. Open your browser to `http://localhost:3000`
2. Enter a valid phone number and click "Send OTP"
3. Enter the verification code you receive and click "Verify"
4. Notice the resend OTP option (with countdown) and call option
5. After successful verification, you'll see the completion screen

#### 4.6 Review

Congratulations! You've implemented:

- SMS verification with Twilio Verify
- Voice verification as a fallback
- Resend functionality with rate limiting
- Code validation and error handling
- A user-friendly UI for the entire process

> **Hint:** If you encountered any issues, check the `./final/` directory for the complete implementation.

---

Done! Celebrate! 🎉
