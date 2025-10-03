const express = require("express");

const router = express.Router();
let twilioClient;
let verifyServiceSid;

const initialize = (client, serviceSid) => {
  twilioClient = client;
  verifyServiceSid = serviceSid;
};

// Handle error codes from Twilio Verify API
function handleError(error) {
  if (error.code === 20404) {
    return { statusCode: 404, message: "Verification service not found" };
  }
  if (error.code === 60200) {
    return { statusCode: 400, message: "Invalid phone number format" };
  }
  if (error.code === 60202) {
    return { statusCode: 429, message: "Max verification attempts reached" };
  }
  if (error.code === 20003) {
    return { statusCode: 403, message: "Authentication failed" };
  }
  return { statusCode: 400, message: error.message };
}

// 2.1. Send verification code to phone by SMS
router.post("/phone", async (req, res) => {
  try {
    const { phone, channel } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const selectedChannel =
      channel === "sms" || channel === "call" ? channel : "sms";

    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phone, channel: selectedChannel });

    res.json({ success: true });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    res.status(statusCode).json({ error: message });
  }
});

// 2.2. Validate verification code for phone
router.post("/phone/validate", async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code required" });
    }

    const result = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code });

    res.json({ valid: result.status === "approved" });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    res.status(statusCode).json({ error: message });
  }
});

// 2.3. Send verification code to email
router.post("/email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: email, channel: "email" });

    res.json({ success: true });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    res.status(statusCode).json({ error: message });
  }
});

// 2.4. Validate verification code for email
router.post("/email/validate", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code required" });
    }

    const result = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: email, code });

    res.json({ valid: result.status === "approved" });
  } catch (error) {
    const { statusCode, message } = handleError(error);
    res.status(statusCode).json({ error: message });
  }
});

module.exports = {
  router,
  initialize,
};
