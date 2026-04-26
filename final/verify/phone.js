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

router.post("/phone", async (req, res) => {
  try {
    const { phone, channel } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const selectedChannel =
      channel === "sms" || channel === "call" ? channel : "sms";

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
  } catch (error) {
    errorRes(res, error.status || 500, error.message, error.code || "VERIFY_ERROR");
  }
});

router.post("/phone/validate", async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code required" });
    }

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
  } catch (error) {
    errorRes(res, error.status || 500, error.message, error.code || "VERIFY_ERROR");
  }
});

module.exports = { router, initialize };
