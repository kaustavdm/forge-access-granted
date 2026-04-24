const express = require("express");
const crypto = require("crypto");
const router = express.Router();

let authHeader;
let baseUrl;

// NOTE: In-memory store for workshop purposes only.
// Cleared on server restart. In production, use a persistent store.
const identityStore = new Map();

const initialize = (credentials, serviceSid) => {
  const { apiKeySid, apiKeySecret } = credentials;
  authHeader =
    "Basic " +
    Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString("base64");
  baseUrl = `https://verify.twilio.com/v2/Services/${serviceSid}/Passkeys`;
};

const twilioPost = async (path, body) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
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
router.post("/register", async (req, res) => {
  try {
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

    const data = await twilioPost("/Factors", {
      friendly_name: "Passkey",
      identity,
    });

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
router.post("/register/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response } = req.body;

    if (!id || !response) {
      return res.status(400).json({ error: "Credential response required" });
    }

    const data = await twilioPost("/VerifyFactor", {
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
      success: data.status === "verified",
      status: data.status,
    });
  } catch (error) {
    console.error(
      `Passkey verify factor error ${error.code}: ${error.message}`,
    );
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "An error occurred",
      code: error.code || "UNKNOWN_ERROR",
    });
  }
});

// 5.3. Authenticate with passkey - Create a Challenge
router.post("/authenticate", async (req, res) => {
  try {
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

    const data = await twilioPost("/Challenges", { identity });

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
router.post("/authenticate/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response } = req.body;

    if (!id || !response) {
      return res.status(400).json({ error: "Assertion response required" });
    }

    const data = await twilioPost("/ApproveChallenge", {
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
      success: data.status === "approved",
      status: data.status,
    });
  } catch (error) {
    console.error(
      `Passkey approve challenge error ${error.code}: ${error.message}`,
    );
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "An error occurred",
      code: error.code || "UNKNOWN_ERROR",
    });
  }
});

module.exports = {
  router,
  initialize,
};
