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

// 4.1 Send verification code to email
router.post("/email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    // The Twilio Verify API endpoint for creating verifications:
    // POST https://verify.twilio.com/v2/Services/{ServiceSid}/Verifications
    // Body (form-urlencoded): To={email}&Channel=email

    // TODO: Implement email verification
    // 1. Construct the URL: `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`
    // 2. Create a URLSearchParams body with To and Channel (set to "email")
    // 3. Call twilioFetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body })
    // 4. Check if response.ok — if not, parse error and return with errorRes()
    // 5. Return { success: true }
  } catch (error) {
    errorRes(res, error.status || 500, error.message, error.code || "VERIFY_ERROR");
  }
});

// 4.2 Validate verification code for email
router.post("/email/validate", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code required" });
    }

    // The Twilio Verify API endpoint for checking verifications:
    // POST https://verify.twilio.com/v2/Services/{ServiceSid}/VerificationCheck
    // Body (form-urlencoded): To={email}&Code={code}

    // TODO: Implement email verification check
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
