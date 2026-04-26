# Section 3: Implement Phone OTP Routes

[← Previous: Implement Lookup Routes](./RUNBOOK_2_LOOKUP.md) | [Next: Implement Email OTP Routes →](./RUNBOOK_4_VERIFY_EMAIL.md)

---

In this section, you'll implement phone number verification using the Twilio Verify API. All changes are in `build/verify/phone.js`.

The scaffolded file already provides:
- `twilioFetch` and `verifyServiceSid` — injected via `initialize()`
- Channel selection logic — `selectedChannel` defaults to `"sms"`, accepts `"call"`
- Input validation — checks for required `phone` and `code` fields
- Error handling — catches errors and returns structured responses

You only need to fill in the TODO blocks inside each route handler.

---

## 3.1 Implement Phone OTP Create

Open `build/verify/phone.js` and locate the `POST /phone` route.

This endpoint sends a verification code to the user's phone via SMS (default) or voice call.

**Twilio Verify API:**
```
POST https://verify.twilio.com/v2/Services/{ServiceSid}/Verifications
Body (form-urlencoded): To={phone}&Channel={channel}
```

**Implementation:**

```javascript
const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;
const body = new URLSearchParams({ To: phone, Channel: selectedChannel });

const response = await twilioFetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body,
});

if (!response.ok) {
  const err = await response.json().catch(() => ({}));
  return errorRes(res, response.status, err.message || "Verification failed", err.code || "VERIFY_ERROR");
}

res.json({ success: true });
```

After adding this code, restart the server and try the UI — enter a phone number and click **"Send OTP"**. You should receive an SMS with a 6-digit code.

> [!TIP]
> Test with curl:
> ```bash
> curl -X POST http://localhost:3000/api/verify/phone \
>   -H "Content-Type: application/json" \
>   -d '{"phone": "+14155552671"}'
> ```
> Or use the **"Application endpoints" → "4.1 Phone verification start - SMS"** request in Postman.

---

## 3.2 Channel: SMS and Call

Your implementation already supports both SMS and voice channels through the `selectedChannel` logic provided in the scaffold:

```javascript
const selectedChannel =
  channel === "sms" || channel === "call" ? channel : "sms";
```

- When `channel` is omitted or `"sms"`, the code is sent via **SMS**
- When `channel` is `"call"`, Twilio calls the phone and reads the code aloud

The UI handles this automatically — after the resend timer expires, a **"Call for OTP"** button appears that sends the request with `channel: "call"`.

---

## 3.3 Explore: Resend and Phone Call

Test the resend and voice call features in the UI:

1. Enter a phone number and send an OTP
2. On the OTP entry screen, wait 30 seconds for the resend timer to expire
3. Click **"Resend OTP"** — the same `POST /api/verify/phone` endpoint is called again
4. The **"Call for OTP"** button also appears — click it to receive a voice call with the code

The resend and call features use the same endpoint you already implemented. Twilio Verify handles code generation and delivery on the server side.

> [!TIP]
> Test the voice channel with curl:
> ```bash
> curl -X POST http://localhost:3000/api/verify/phone \
>   -H "Content-Type: application/json" \
>   -d '{"phone": "+14155552671", "channel": "call"}'
> ```
> Or use the **"Application endpoints" → "4.3 Phone verification resend - Voice"** request in Postman.

---

## 3.4 Implement Phone OTP Check

Locate the `POST /phone/validate` route.

This endpoint validates the 6-digit code the user received.

**Twilio Verify API:**
```
POST https://verify.twilio.com/v2/Services/{ServiceSid}/VerificationCheck
Body (form-urlencoded): To={phone}&Code={code}
```

**Implementation:**

```javascript
const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
const body = new URLSearchParams({ To: phone, Code: code });

const response = await twilioFetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body,
});

if (!response.ok) {
  const err = await response.json().catch(() => ({}));
  return errorRes(res, response.status, err.message || "Verification check failed", err.code || "VERIFY_ERROR");
}
const data = await response.json();

res.json({ valid: data.status === "approved" });
```

> [!TIP]
> Test with curl:
> ```bash
> curl -X POST http://localhost:3000/api/verify/phone/validate \
>   -H "Content-Type: application/json" \
>   -d '{"phone": "+14155552671", "code": "123456"}'
> ```
> Or use the **"Application endpoints" → "4.4 Validate Verify token for phone"** request in Postman.

---

## 3.5 Demo: Web UI Send OTP and Verify

Test the complete phone verification flow:

1. Restart the server: `npm start`
2. Open `http://localhost:3000`
3. Enter a valid phone number → click **"Send OTP"**
4. Enter the 6-digit code from your SMS → click **"Verify"**
5. After successful verification, you'll be redirected to the email step

You can also:
- Click **"Skip step"** to skip phone verification and proceed to email
- Click **"Sign in with Passkey"** if you've already registered a passkey (Section 5)

---

[← Previous: Implement Lookup Routes](./RUNBOOK_2_LOOKUP.md) | [Next: Implement Email OTP Routes →](./RUNBOOK_4_VERIFY_EMAIL.md)
