const express = require("express");
const crypto = require("crypto");

const router = express.Router();
const passkeysRouter = express.Router();

let twilioClient;
let verifyServiceSid;
let passkeysAuthHeader;
let passkeysBaseUrl;

// key: factor_sid → { friendly_name, identity, phone, email } (phone/email reserved for future use, currently null)
const factorStore = new Map();

const initialize = (client, serviceSid, apiCredentials) => {
  twilioClient = client;
  verifyServiceSid = serviceSid;
  if (apiCredentials) {
    const { apiKeySid, apiKeySecret } = apiCredentials;
    passkeysAuthHeader =
      "Basic " + Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString("base64");
    passkeysBaseUrl = `https://verify.twilio.com/v2/Services/${serviceSid}/Passkeys`;
  }
};

const errorRes = (status, message, code) => {
  return {
    status: status || 500,
    message: message || "An error occurred",
    code: code || "UNKNOWN_ERROR",
  };
};

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
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
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
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
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
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
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
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
  }
});

const twilioPasskeysPost = async (path, body) => {
  if (!passkeysBaseUrl) {
    const err = new Error("Passkeys not configured");
    err.status = 503;
    err.code = "PASSKEYS_NOT_CONFIGURED";
    throw err;
  }
  const res = await fetch(`${passkeysBaseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: passkeysAuthHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Twilio error");
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
};

// 5.1. Register a passkey - Create a Passkey Factor
passkeysRouter.post("/register", async (req, res) => {
  try {
    const { friendly_name } = req.body;
    const identity = "UA-" + crypto.randomUUID();

    const data = await twilioPasskeysPost("/Factors", {
      friendly_name: friendly_name || "Passkey",
      identity,
    });

    console.log("/Factors", JSON.stringify(data, null, 2));
    res.json({ identity, options: data.options });
  } catch (error) {
    console.error(`Passkey register error ${error.code}: ${error.message}`);
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "An error occurred",
      code: error.code || "UNKNOWN_ERROR",
    });
  }
});

// 5.2. Verify the passkey factor - Complete registration
passkeysRouter.post("/register/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response } = req.body;

    if (!id || !response) {
      return res.status(400).json({ error: "Credential response required" });
    }

    const data = await twilioPasskeysPost("/VerifyFactor", {
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
  } catch (error) {
    console.error(`Passkey verify factor error ${error.code}: ${error.message}`);
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "An error occurred",
      code: error.code || "UNKNOWN_ERROR",
    });
  }
});

// 5.3. Authenticate with passkey - Create a Challenge (discoverable credential flow)
passkeysRouter.post("/authenticate", async (req, res) => {
  try {
    const data = await twilioPasskeysPost("/Challenges", {});
    res.json({ options: data.options });
  } catch (error) {
    console.error(`Passkey challenge error ${error.code}: ${error.message}`);
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "An error occurred",
      code: error.code || "UNKNOWN_ERROR",
    });
  }
});

// 5.4. Verify passkey authentication - Approve the Challenge
passkeysRouter.post("/authenticate/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response } = req.body;

    if (!id || !response) {
      return res.status(400).json({ error: "Assertion response required" });
    }

    const data = await twilioPasskeysPost("/ApproveChallenge", {
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

    const factorInfo = factorStore.get(data.factor_sid) || {};

    res.json({
      success: data.status === "approved",
      status: data.status,
      friendly_name: factorInfo.friendly_name || null,
      identity: factorInfo.identity || null,
    });
  } catch (error) {
    console.error(`Passkey approve challenge error ${error.code}: ${error.message}`);
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "An error occurred",
      code: error.code || "UNKNOWN_ERROR",
    });
  }
});

module.exports = {
  router,
  passkeysRouter,
  initialize,
};
