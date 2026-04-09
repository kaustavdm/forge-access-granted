const express = require("express");
const crypto = require("crypto");

const router = express.Router();
let twilioClient;
let verifyServiceSid;

// NOTE: In-memory store for workshop purposes only.
// Cleared on server restart. In production, use a persistent store.
const identityStore = new Map();

const initialize = (client, serviceSid) => {
  twilioClient = client;
  verifyServiceSid = serviceSid;
};

const errorRes = (status, message, code) => {
  return {
    status: status || 500,
    message: message || "An error occurred",
    code: code || "UNKNOWN_ERROR",
  };
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

    const factor = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .newFactors.create({
        friendlyName: "Passkey",
        identity,
      });

    res.json({
      identity,
      options: factor.options,
    });
  } catch (error) {
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
  }
});

// 5.2. Verify the passkey factor - Complete registration
router.post("/register/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response } = req.body;

    if (!id || !response) {
      return res
        .status(400)
        .json({ error: "Credential response required" });
    }

    const result = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .newVerifyFactors.update({
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
      success: result.status === "verified",
      status: result.status,
    });
  } catch (error) {
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
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

    const challenge = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .newChallenge()
      .create({ identity });

    res.json({
      options: challenge.options,
    });
  } catch (error) {
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
  }
});

// 5.4. Verify passkey authentication - Approve the Challenge
router.post("/authenticate/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response } = req.body;

    if (!id || !response) {
      return res
        .status(400)
        .json({ error: "Assertion response required" });
    }

    const result = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .approveChallenge.update({
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
      success: result.status === "approved",
      status: result.status,
    });
  } catch (error) {
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
  }
});

module.exports = {
  router,
  initialize,
};
