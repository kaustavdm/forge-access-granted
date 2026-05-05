# Section 2: Implement Lookup Routes

[← Previous: Setup](./RUNBOOK_1_SETUP.md) | [Next: Implement Phone OTP Routes →](./RUNBOOK_3_VERIFY_PHONE.md)

---

In this section, you'll implement the Twilio Lookup v2 API to validate phone numbers and retrieve enrichment data. All changes are in `build/lookup.js`.

The scaffolded file already provides:
- `twilioFetch` — an authenticated fetch wrapper (injected via `initialize()`)
- `pickBaseFields(data)` — extracts common fields from Lookup responses
- Route declarations with try/catch and error handling

You only need to fill in the TODO blocks inside each route handler.

---

## 2.1 Implement Basic Lookup

Open `build/lookup.js` and locate the `GET /:phone` route.

This endpoint validates a phone number and returns basic information about it.

**Twilio Lookup v2 API:**
```
GET https://lookups.twilio.com/v2/PhoneNumbers/{phone}
Optional query param: CountryCode={code}
```

**Implementation:**

```javascript
const url = new URL(`https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}`);
if (req.query.countryCode) {
  url.searchParams.set("CountryCode", req.query.countryCode);
}

const response = await twilioFetch(url.toString());
if (!response.ok) {
  const err = await response.json();
  return errorRes(res, response.status, err.message || "Lookup failed", err.code || "LOOKUP_ERROR");
}
const data = await response.json();
res.json(pickBaseFields(data));
```

**Expected response:**

```json
{
  "valid": true,
  "phone_number": "+14155552671",
  "national_format": "(415) 555-2671",
  "country_code": "US",
  "calling_country_code": "1",
  "validation_errors": null
}
```

> [!TIP]
> Test with curl:
> ```bash
> curl http://localhost:3000/api/lookup/%2B14155552671
> ```
> Or use the **"Application endpoints" → "3.1 Basic lookup"** request in the Postman collection.

---

## 2.2 Implement Lookup with Line Type Intelligence

Locate the `GET /:phone/line-type` route.

**Line Type Intelligence** tells you whether a phone number is mobile, landline, VoIP, etc. This helps decide whether to send SMS or use voice.

**Implementation:**

```javascript
const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=line_type_intelligence`;

const response = await twilioFetch(url);
if (!response.ok) {
  const err = await response.json();
  return errorRes(res, response.status, err.message || "Lookup failed", err.code || "LOOKUP_ERROR");
}
const data = await response.json();
const lineType = data.line_type_intelligence?.type;
res.json({
  ...pickBaseFields(data),
  isMobile: lineType === "mobile",
  isLandline: lineType === "landline",
});
```

**Expected response (additional fields):**

```json
{
  "valid": true,
  "phone_number": "+14155552671",
  "isMobile": true,
  "isLandline": false
}
```

> [!TIP]
> Test with curl:
> ```bash
> curl http://localhost:3000/api/lookup/%2B14155552671/line-type
> ```
> Or use the **"Application endpoints" → "3.2 Lookup with Line Type Intelligence"** request in Postman.

---

## 2.3 Implement Lookup with SMS Pumping Risk (Optional)

> [!NOTE]
> This step is optional. SMS Pumping Risk detection helps prevent fraud but is not required for the verification flow.

Locate the `GET /:phone/sms-pumping` route.

**SMS Pumping Risk** identifies numbers that might be used for SMS toll fraud.

**Implementation:**

```javascript
const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=sms_pumping_risk`;

const response = await twilioFetch(url);
if (!response.ok) {
  const err = await response.json();
  return errorRes(res, response.status, err.message || "Lookup failed", err.code || "LOOKUP_ERROR");
}
const data = await response.json();
res.json({
  ...pickBaseFields(data),
  sms_pumping_risk: data.sms_pumping_risk,
});
```

> [!TIP]
> Test with curl:
> ```bash
> curl http://localhost:3000/api/lookup/%2B14155552671/sms-pumping
> ```
> Or use the **"Application endpoints" → "3.3 Lookup with SMS Pumping Risk check"** request in Postman.

---

## 2.4 Implement Lookup with Multiple Packages (Optional)

> [!NOTE]
> This step is optional. It demonstrates how to request multiple data packages in a single API call.

Locate the `GET /:phone/multiple` route.

You can request multiple Lookup data packages by passing a comma-separated list in the `Fields` parameter.

**Implementation:**

```javascript
const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=line_type_intelligence,sms_pumping_risk,caller_name`;

const response = await twilioFetch(url);
if (!response.ok) {
  const err = await response.json();
  return errorRes(res, response.status, err.message || "Lookup failed", err.code || "LOOKUP_ERROR");
}
const data = await response.json();
res.json(data);
```

> [!TIP]
> For a full list of available Lookup data packages, see [Lookup v2 API docs](https://www.twilio.com/docs/lookup/v2-api#data-packages).

> [!TIP]
> Test with curl:
> ```bash
> curl http://localhost:3000/api/lookup/%2B14155552671/multiple
> ```
> Or use the **"Application endpoints" → "3.4 Lookup with multiple packages"** request in Postman.

---

## 2.5 Demo: Web UI Lookup

Now test your implementation through the web UI:

1. Make sure the server is running: `npm start`
2. Open `http://localhost:3000`
3. Enter a valid phone number and click **"Send OTP"**

The UI calls your `GET /api/lookup/:phone` endpoint to validate the phone number before attempting to send a verification code. If the number is invalid, you'll see an error message.

At this point, the OTP send will fail because you haven't implemented the verify routes yet. That's next.

---

[← Previous: Setup](./RUNBOOK_1_SETUP.md) | [Next: Implement Phone OTP Routes →](./RUNBOOK_3_VERIFY_PHONE.md)
