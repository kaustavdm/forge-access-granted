"use strict";

const express = require("express");
const { errorRes } = require("../lib/errors");

const router = express.Router();

let twilioFetch;
let verifyServiceSid;

function initialize(fetch, serviceSid) {
  twilioFetch = fetch;
  verifyServiceSid = serviceSid;
}

// 3.1 Send verification code to phone by SMS or Voice
router.post("/phone", async (req, res) => {
  try {
    const { phone, channel } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const selectedChannel =
      channel === "sms" || channel === "call" ? channel : "sms";

    // The Twilio Verify API endpoint for creating verifications:
    // POST https://verify.twilio.com/v2/Services/{ServiceSid}/Verifications
    // Body (form-urlencoded): To={phone}&Channel={selectedChannel}

    // TODO: Implement phone verification
    // 1. Construct the URL: `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`
    // 2. Create a URLSearchParams body with To and Channel
    // 3. Call twilioFetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body })
    // 4. Check if response.ok — if not, parse error and return with errorRes()
    // 5. Return { success: true }
  } catch (error) {
    errorRes(res, error.status || 500, error.message, error.code || "VERIFY_ERROR");
  }
});

// 3.4 Validate verification code for phone
router.post("/phone/validate", async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code required" });
    }

    // The Twilio Verify API endpoint for checking verifications:
    // POST https://verify.twilio.com/v2/Services/{ServiceSid}/VerificationCheck
    // Body (form-urlencoded): To={phone}&Code={code}

    // TODO: Implement phone verification check
    // 1. Construct the URL: `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`
    // 2. Create a URLSearchParams body with To and Code
    // 3. Call twilioFetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body })
    // 4. Check if response.ok — if not, parse error and return with errorRes()
    // 5. Parse the response JSON
    // 6. Return { valid: data.status === "approved" }
  } catch (error) {
    errorRes(res, error.status || 500, error.message, error.code || "VERIFY_ERROR");
  }
});

module.exports = { router, initialize };
