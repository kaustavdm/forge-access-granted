# Section 4: Implement Email OTP Routes (Optional)

[← Previous: Implement Phone OTP Routes](./RUNBOOK_3_VERIFY_PHONE.md) | [Next: Implement Passkeys →](./RUNBOOK_5_PASSKEYS.md)

---

> [!NOTE]
> This section is optional. If you haven't configured email on your Verify service (see [Section 1.3c](./RUNBOOK_1_SETUP.md#13c-configure-email-optional)), you can skip this and proceed to [Section 5: Implement Passkeys](./RUNBOOK_5_PASSKEYS.md). The UI's "Skip step" link lets you bypass email verification.

In this section, you'll implement email verification using the same Twilio Verify API. All changes are in `build/verify/email.js`.

The scaffolded file is structured identically to `verify/phone.js` — same `twilioFetch` wrapper, input validation, and error handling. The only differences are the field name (`email` instead of `phone`) and the channel (`"email"` instead of `"sms"`/`"call"`).

---

## 4.1 Implement Email Verification Create

Open `build/verify/email.js` and locate the `POST /email` route.

This endpoint sends a verification code to the user's email address.

**Twilio Verify API:**
```
POST https://verify.twilio.com/v2/Services/{ServiceSid}/Verifications
Body (form-urlencoded): To={email}&Channel=email
```

**Implementation:**

```javascript
const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;
const body = new URLSearchParams({ To: email, Channel: "email" });

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

> [!TIP]
> Test with curl:
> ```bash
> curl -X POST http://localhost:3000/api/verify/email \
>   -H "Content-Type: application/json" \
>   -d '{"email": "user@example.com"}'
> ```

---

## 4.2 Implement Email Verification Check

Locate the `POST /email/validate` route.

This endpoint validates the 6-digit code sent to the user's email.

**Twilio Verify API:**
```
POST https://verify.twilio.com/v2/Services/{ServiceSid}/VerificationCheck
Body (form-urlencoded): To={email}&Code={code}
```

**Implementation:**

```javascript
const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
const body = new URLSearchParams({ To: email, Code: code });

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
> curl -X POST http://localhost:3000/api/verify/email/validate \
>   -H "Content-Type: application/json" \
>   -d '{"email": "user@example.com", "code": "123456"}'
> ```

---

## 4.3 Explore: Resend for Email

The email verification screen includes a resend timer, just like the phone step:

1. After sending an email OTP, wait 30 seconds for the timer to expire
2. Click **"Resend OTP"** to send a new code

The resend calls the same `POST /api/verify/email` endpoint you implemented in 4.1.

---

## 4.4 Demo: Web UI Send Email OTP and Verify

Test the complete email verification flow:

1. Restart the server: `npm start`
2. Complete or skip the phone step to reach the email screen
3. Enter a valid email address → click **"Send OTP"**
4. Check your email for the 6-digit code → enter it and click **"Verify"**
5. After successful verification, you'll be redirected to the passkey step

You can also click **"Skip step"** to proceed without email verification.

---

[← Previous: Implement Phone OTP Routes](./RUNBOOK_3_VERIFY_PHONE.md) | [Next: Implement Passkeys →](./RUNBOOK_5_PASSKEYS.md)
