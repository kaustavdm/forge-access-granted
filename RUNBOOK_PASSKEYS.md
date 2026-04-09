# Forge Access Granted – Passkeys Runbook

- **Project:** Onboarding with Phone Verification + Passkeys
- **Focus:** Passwordless Authentication Using Twilio Verify Passkeys
- **Tech Stack:** Node.js (Express), Twilio Verify Passkeys, WebAuthn
- **Duration:** ~30 min to build (after completing the main Runbook)
- **Outcome:** Passkey registration and authentication added to the onboarding flow

---

## Prerequisites

- **Completed the main [RUNBOOK.md](./RUNBOOK.md)** — you should have a working phone + email verification flow
- **HTTPS or localhost** — WebAuthn requires HTTPS in production, but works on `http://localhost` in most browsers
- **Supported browser** — Chrome 118+, Safari 17+, Firefox 119+, or Edge 118+ (with WebAuthn JSON API support)

---

## Build

### 5. Add Passkeys to the onboarding flow

Passkeys are an industry-standard authentication method based on the FIDO/WebAuthn specification. They replace passwords with cryptographic key pairs, using biometrics (Touch ID, Face ID, Windows Hello) or a PIN for verification. Passkeys are phishing-resistant because they are bound to specific domains.

In this section, you'll add passkey registration and authentication to your onboarding flow using Twilio Verify Passkeys.

#### 5.0 Configure Passkeys on your Verify Service

Before implementing passkeys in code, you need to configure your existing Verify service with Relying Party (RP) settings for passkeys.

**Using the Twilio Console:**

1. Go to **Twilio Console → Verify → Services**
2. Select the Verify service you created in step 1 of the main Runbook
3. Navigate to the **Passkeys** configuration section
4. Configure the following settings:

| Setting | Value | Description |
|---------|-------|-------------|
| **Relying Party ID** | `localhost` | The domain where passkeys will be used. Use `localhost` for development. |
| **Relying Party Name** | `Forge Access Granted` | A human-readable name shown during passkey prompts. |
| **Allowed Origins** | `http://localhost:3000` | The full origin URL(s) allowed to create and use passkeys. |
| **Authenticator Attachment** | `platform` | Use device-integrated authenticators (Touch ID, Face ID, Windows Hello). |
| **User Verification** | `preferred` | Request biometric/PIN verification when available. |
| **Discoverable Credentials** | `preferred` | Enable username-free login when supported. |

5. Save your changes

<details>
<summary>Configure using Postman/API instead</summary>

You can also configure passkeys by updating your Verify service via the API. Send a **POST** request to update the service:

**Endpoint:** `POST https://verify.twilio.com/v2/Services/{VERIFY_SERVICE_SID}`

**Body (form-urlencoded):**

```
FriendlyName=Forge Access Granted
Passkeys.RelyingParty.id=localhost
Passkeys.RelyingParty.name=Forge Access Granted
Passkeys.RelyingParty.origins=http://localhost:3000
Passkeys.AuthenticatorAttachment=platform
Passkeys.DiscoverableCredentials=preferred
Passkeys.UserVerification=preferred
```

**Authentication:** Use your Twilio API Key SID and Secret as Basic Auth credentials.

</details>

> [!IMPORTANT]
> The Relying Party ID (`localhost`) and Allowed Origins (`http://localhost:3000`) must match your development environment. In production, these would be your actual domain (e.g., `example.com`) and origin (e.g., `https://example.com`).

✅ Passkeys configured on your Verify service.

---

#### 5.1 Implement passkey registration - Create a Factor

Open `build/passkeys.js` and locate the endpoint `POST /register`. This endpoint should create a passkey factor for the user.

> [!IMPORTANT]
> **Your task:** Implement the Twilio Verify Passkeys API call to create a new passkey factor.

**Key implementation points:**

- Generate a unique identity for the user using `crypto.randomUUID()` (or reuse an existing one)
- Store the mapping between the user's phone number and their identity
- Use `twilioClient.verify.v2.services(verifyServiceSid).newFactors.create(...)` to create the factor
- Pass `friendlyName` and `identity` in the request
- Return the `identity` and `options` (WebAuthn creation options) from the response

<details>
<summary>💡 Click to see the solution</summary>

```javascript
const { phone } = req.body;
if (!phone) {
  return res.status(400).json({ error: "Phone required" });
}

// Reuse existing identity or generate a new one
let identity = identityStore.get(phone);
if (!identity) {
  identity = crypto.randomUUID();
  identityStore.set(phone, identity);
}

const factor = await twilioClient.verify.v2
  .services(verifyServiceSid)
  .newFactors.create({
    friendlyName: "Passkey",
    identity,
  });

res.json({
  identity,
  options: factor.options,
});
```

</details>

---

#### 5.2 Implement passkey registration - Verify the Factor

Locate the endpoint `POST /register/verify` in `build/passkeys.js`.

> [!IMPORTANT]
> **Your task:** Implement the API call to verify the passkey factor with the credential response from the browser.

**Key implementation points:**

- The request body contains the WebAuthn credential response from the browser (id, rawId, authenticatorAttachment, type, response)
- Use `twilioClient.verify.v2.services(verifyServiceSid).newVerifyFactors.update(...)` to verify the factor
- Pass the credential fields: `id`, `rawId`, `authenticatorAttachment`, `type`, and `response` (containing `attestationObject`, `clientDataJSON`, `transports`)
- Check if `result.status === "verified"` for success

<details>
<summary>💡 Click to see the solution</summary>

```javascript
const { id, rawId, authenticatorAttachment, type, response } = req.body;

if (!id || !response) {
  return res
    .status(400)
    .json({ error: "Credential response required" });
}

const result = await twilioClient.verify.v2
  .services(verifyServiceSid)
  .newVerifyFactors.update({
    id,
    rawId,
    authenticatorAttachment,
    type,
    response: {
      attestationObject: response.attestationObject,
      clientDataJSON: response.clientDataJSON,
      transports: response.transports,
    },
  });

res.json({
  success: result.status === "verified",
  status: result.status,
});
```

</details>

---

#### 5.3 Implement passkey authentication - Create a Challenge

Locate the endpoint `POST /authenticate` in `build/passkeys.js`.

> [!IMPORTANT]
> **Your task:** Implement the API call to create an authentication challenge for a registered passkey.

**Key implementation points:**

- Look up the user's identity from the in-memory store using their phone number
- Return a 404 error if no passkey is registered for the phone number
- Use `twilioClient.verify.v2.services(verifyServiceSid).newChallenge().create(...)` to create the challenge
- Pass the `identity` in the request
- Return the `options` (WebAuthn request options) from the response

<details>
<summary>💡 Click to see the solution</summary>

```javascript
const { phone } = req.body;
if (!phone) {
  return res.status(400).json({ error: "Phone required" });
}

const identity = identityStore.get(phone);
if (!identity) {
  return res
    .status(404)
    .json({ error: "No passkey registered for this phone number" });
}

const challenge = await twilioClient.verify.v2
  .services(verifyServiceSid)
  .newChallenge()
  .create({ identity });

res.json({
  options: challenge.options,
});
```

</details>

---

#### 5.4 Implement passkey authentication - Approve the Challenge

Locate the endpoint `POST /authenticate/verify` in `build/passkeys.js`.

> [!IMPORTANT]
> **Your task:** Implement the API call to verify the authentication challenge with the assertion response from the browser.

**Key implementation points:**

- The request body contains the WebAuthn assertion response from the browser
- Use `twilioClient.verify.v2.services(verifyServiceSid).approveChallenge.update(...)` to approve the challenge
- Pass the assertion fields: `id`, `rawId`, `authenticatorAttachment`, `type`, and `response` (containing `authenticatorData`, `clientDataJSON`, `signature`, `userHandle`)
- Check if `result.status === "approved"` for success

<details>
<summary>💡 Click to see the solution</summary>

```javascript
const { id, rawId, authenticatorAttachment, type, response } = req.body;

if (!id || !response) {
  return res
    .status(400)
    .json({ error: "Assertion response required" });
}

const result = await twilioClient.verify.v2
  .services(verifyServiceSid)
  .approveChallenge.update({
    id,
    rawId,
    authenticatorAttachment,
    type,
    response: {
      authenticatorData: response.authenticatorData,
      clientDataJSON: response.clientDataJSON,
      signature: response.signature,
      userHandle: response.userHandle,
    },
  });

res.json({
  success: result.status === "approved",
  status: result.status,
});
```

</details>

---

#### 5.5 Client-side: WebAuthn browser APIs

The client-side code in `public/main.js` uses the native browser WebAuthn APIs to interact with passkeys. Here's how the two flows work:

**Registration (creating a passkey):**

1. Call your server's `/api/passkeys/register` endpoint to get WebAuthn creation options
2. Parse the options using `PublicKeyCredential.parseCreationOptionsFromJSON(options)`
3. Create the credential using `navigator.credentials.create({ publicKey: creationOptions })`
4. The browser prompts the user for biometric verification (Touch ID, Face ID, etc.)
5. Serialize the credential using `credential.toJSON()`
6. Send the serialized credential to `/api/passkeys/register/verify`

**Authentication (signing in with a passkey):**

1. Call your server's `/api/passkeys/authenticate` endpoint to get WebAuthn request options
2. Parse the options using `PublicKeyCredential.parseRequestOptionsFromJSON(options)`
3. Get the assertion using `navigator.credentials.get({ publicKey: requestOptions })`
4. The browser prompts the user for biometric verification
5. Serialize the assertion using `assertion.toJSON()`
6. Send the serialized assertion to `/api/passkeys/authenticate/verify`

> [!TIP]
> The native `PublicKeyCredential.parseCreationOptionsFromJSON()`, `parseRequestOptionsFromJSON()`, and `.toJSON()` methods handle all base64url encoding/decoding automatically. These are supported in all modern browsers (Chrome 118+, Safari 17+, Firefox 119+).

---

#### 5.6 Demo the complete flow

1. Start the server: `npm run start:final` (or `npm start` if using your build)
2. Open `http://localhost:3000` in your browser
3. Complete the onboarding flow: phone verification → email verification
4. After email verification, you'll see **"Set up a Passkey"**
5. Click **"Register Passkey"** — your browser will prompt for biometric verification
6. After successful registration, you'll see the final dashboard
7. Reload the page
8. Click **"Sign in with Passkey"** on the initial screen
9. Enter the same phone number and click **"Authenticate"**
10. Your browser will prompt for biometric verification
11. After successful authentication, you'll skip directly to the dashboard

#### 5.7 Review

Congratulations! You've added passkeys to your onboarding flow:

- Passkey registration using Twilio Verify Passkeys Factor API
- Passkey authentication using Twilio Verify Passkeys Challenge API
- Native browser WebAuthn integration (no external libraries needed)
- Phishing-resistant, biometric-based authentication

> **Hint:** If you encountered any issues, check the `./final/` directory for the complete implementation. You can run the final version with `npm run start:final`.

---

Done! Celebrate! 🎉
