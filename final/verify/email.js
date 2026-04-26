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

router.post("/email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;
    const body = new URLSearchParams({ To: email, Channel: "email" });

    const response = await twilioFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await response.json();
    if (!response.ok) {
      return errorRes(res, data.status || response.status, data.message, data.code);
    }

    res.json({ success: true });
  } catch (error) {
    errorRes(res, error.status, error.message, error.code);
  }
});

router.post("/email/validate", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code required" });
    }

    const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
    const body = new URLSearchParams({ To: email, Code: code });

    const response = await twilioFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await response.json();
    if (!response.ok) {
      return errorRes(res, data.status || response.status, data.message, data.code);
    }

    res.json({ valid: data.status === "approved" });
  } catch (error) {
    errorRes(res, error.status, error.message, error.code);
  }
});

module.exports = { router, initialize };
