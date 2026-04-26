# Section 5: Implement Passkeys (Optional)

[← Previous: Implement Email OTP Routes](./RUNBOOK_4_VERIFY_EMAIL.md) | [Back to Runbook →](./RUNBOOK.md)

---

> [!NOTE]
> This section is optional. It requires passkey configuration on your Verify service (see [Section 1.3d](./RUNBOOK_1_SETUP.md#13d-configure-passkeys-optional)) and a browser that supports WebAuthn (Chrome 118+, Safari 17+, Firefox 119+, Edge 118+).

In this section, you'll implement passkey registration and authentication using Twilio Verify Passkeys. All changes are in `build/verify/passkeys.js`.

Passkeys are based on the FIDO/WebAuthn standard. They replace passwords with cryptographic key pairs, using biometrics (Touch ID, Face ID, Windows Hello) for verification. Passkeys are phishing-resistant because they are bound to specific domains.

The scaffolded file already provides:
- `postPasskeys(path, body)` — a helper that calls Twilio Verify Passkeys endpoints with JSON content type
- `factorStore` — an in-memory Map to store factor metadata after registration
- Input validation and error handling for all routes

---

## 5.1 Create a Passkey

### 5.1a Implement Register (Create Factor)

Open `build/verify/passkeys.js` and locate the `POST /register` route.

This endpoint creates a new passkey factor for the user and returns WebAuthn creation options that the browser uses to prompt for biometric verification.

**Twilio Verify Passkeys API:**
```
POST https://verify.twilio.com/v2/Services/{ServiceSid}/Passkeys/Factors
Body (JSON): { "friendly_name": "...", "identity": "..." }
```

**Implementation:**

```javascript
const data = await postPasskeys("/Factors", {
  friendly_name: friendly_name || "Passkey",
  identity,
});

console.log("/Factors", JSON.stringify(data, null, 2));
res.json({ identity, options: data.options });
```

> [!TIP]
> The Postman collection includes a **"[API] Passkeys" → "Create Passkey"** request that calls the Factors endpoint directly against the Twilio API.
>
> Test the app endpoint with curl:
> ```bash
> curl -X POST http://localhost:3000/api/passkeys/register \
>   -H "Content-Type: application/json" \
>   -d '{"friendly_name": "My Passkey"}'
> ```

### 5.1b Implement Register Verify (Verify Factor)

Locate the `POST /register/verify` route.

After the browser creates a credential, it sends the result back to this endpoint to complete registration with Twilio.

**Twilio Verify Passkeys API:**
```
POST https://verify.twilio.com/v2/Services/{ServiceSid}/Passkeys/VerifyFactor
Body (JSON): { id, rawId, authenticatorAttachment, type, response: { attestationObject, clientDataJSON, transports } }
```

**Implementation:**

```javascript
const data = await postPasskeys("/VerifyFactor", {
  id,
  rawId,
  authenticatorAttachment,
  type,
  response: {
    attestationObject: credResponse.attestationObject,
    clientDataJSON: credResponse.clientDataJSON,
    transports: credResponse.transports,
  },
});

console.log("/VerifyFactor", JSON.stringify(data, null, 2));

factorStore.set(data.sid, {
  friendly_name: data.friendly_name,
  identity: data.identity,
  phone: null,
  email: null,
});

res.json({
  success: data.status === "verified",
  status: data.status,
});
```

### 5.1c Explore: Browser Passkey Create Code

The client-side code in `public/js/passkey.js` uses native browser WebAuthn APIs to create a passkey. Here's the flow:

1. Call `POST /api/passkeys/register` to get WebAuthn creation options from Twilio
2. Parse options: `PublicKeyCredential.parseCreationOptionsFromJSON(data.options.publicKey)`
3. Create credential: `navigator.credentials.create({ publicKey: creationOptions })`
4. The browser prompts for biometric verification (Touch ID, Face ID, etc.)
5. Serialize the credential: `credential.toJSON()`
6. Send the serialized credential to `POST /api/passkeys/register/verify`

> [!TIP]
> The native `PublicKeyCredential.parseCreationOptionsFromJSON()` and `.toJSON()` methods handle all base64url encoding/decoding automatically. No external libraries needed.

---

## 5.2 Demo: Web UI Create and Save a Passkey

Test passkey registration:

1. Restart the server: `npm start`
2. Complete or skip the phone and email steps to reach the passkey screen
3. Optionally enter a friendly name (e.g., "My MacBook") or leave blank
4. Click **"Register Passkey"**
5. Your browser will prompt for biometric verification
6. After successful registration, you'll be redirected to the dashboard

The dashboard shows a verification checklist with the status of each step (phone, email, passkey).

---

## 5.3 Authenticate with a Passkey

### 5.3a Implement Challenge Create

Locate the `POST /authenticate` route.

This endpoint creates an authentication challenge that generates WebAuthn request options for the browser.

**Twilio Verify Passkeys API:**
```
POST https://verify.twilio.com/v2/Services/{ServiceSid}/Passkeys/Challenges
Body (JSON): {}
```

**Implementation:**

```javascript
const data = await postPasskeys("/Challenges", {});
res.json({ options: data.options });
```

> [!TIP]
> Test with curl:
> ```bash
> curl -X POST http://localhost:3000/api/passkeys/authenticate \
>   -H "Content-Type: application/json" \
>   -d '{}'
> ```

### 5.3b Implement Challenge Approve

Locate the `POST /authenticate/verify` route.

After the browser retrieves the assertion, it sends the result to this endpoint to complete authentication.

**Twilio Verify Passkeys API:**
```
POST https://verify.twilio.com/v2/Services/{ServiceSid}/Passkeys/ApproveChallenge
Body (JSON): { id, rawId, authenticatorAttachment, type, response: { authenticatorData, clientDataJSON, signature, userHandle } }
```

**Implementation:**

```javascript
const data = await postPasskeys("/ApproveChallenge", {
  id,
  rawId,
  authenticatorAttachment,
  type,
  response: {
    authenticatorData: assertionResponse.authenticatorData,
    clientDataJSON: assertionResponse.clientDataJSON,
    signature: assertionResponse.signature,
    userHandle: assertionResponse.userHandle,
  },
});

const factorInfo = factorStore.get(data.factor_sid) || {};

res.json({
  success: data.status === "approved",
  status: data.status,
  friendly_name: factorInfo.friendly_name || null,
  identity: factorInfo.identity || null,
});
```

> [!TIP]
> Test with curl:
> ```bash
> curl -X POST http://localhost:3000/api/passkeys/authenticate \
>   -H "Content-Type: application/json" \
>   -d '{}'
> ```
> Note: Full authentication requires browser WebAuthn interaction — curl can only test the challenge creation step.

---

## 5.4 Demo: Web UI Verify Passkey in Dashboard

Test passkey authentication:

1. Make sure you've registered a passkey (step 5.2)
2. Restart the server: `npm start`
3. Open `http://localhost:3000`
4. Click **"Sign in with Passkey"** on the phone screen
5. Your browser prompts for biometric verification
6. After successful authentication, you skip directly to the dashboard

Alternatively, from the dashboard:
1. If you registered a passkey but haven't authenticated with it yet, click **"Verify passkey"**
2. Complete biometric verification
3. The dashboard updates to show the passkey as verified

---

[← Previous: Implement Email OTP Routes](./RUNBOOK_4_VERIFY_EMAIL.md) | [Back to Runbook →](./RUNBOOK.md)
