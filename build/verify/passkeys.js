"use strict";

const express = require("express");
const crypto = require("crypto");
const { errorRes } = require("../lib/errors");

const passkeysRouter = express.Router();

let twilioFetch;
let verifyServiceSid;

const factorStore = new Map();

function initialize(fetch, serviceSid) {
  twilioFetch = fetch;
  verifyServiceSid = serviceSid;
}

// 5.1 Register a passkey — create a Factor
passkeysRouter.post("/register", async (req, res) => {
  try {
    const { friendly_name } = req.body;
    const identity = "UA-" + crypto.randomUUID();

    // TODO: Implement passkey registration (create Factor)
    // 1. Build URL: `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Passkeys/Factors`
    // 2. Call twilioFetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ friendly_name: friendly_name || "Passkey", identity }) })
    // 3. Parse: const data = await response.json()
    // 4. If !response.ok, throw error with data.message, response.status, data.code
    // 5. Log: console.log("/Factors", JSON.stringify(data, null, 2))
    // 6. Return { identity, options: data.options }
  } catch (error) {
    console.error(`Passkey register error ${error.code}: ${error.message}`);
    errorRes(res, error.status, error.message, error.code);
  }
});

// 5.2 Register a passkey — verify the Factor
passkeysRouter.post("/register/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response: credResponse } = req.body;

    if (!id || !credResponse) {
      return res.status(400).json({ error: "Credential response required" });
    }

    // TODO: Implement passkey factor verification
    // 1. Build URL: `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Passkeys/VerifyFactor`
    // 2. Call twilioFetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ id, rawId, authenticatorAttachment, type, response: { attestationObject: credResponse.attestationObject, clientDataJSON: credResponse.clientDataJSON, transports: credResponse.transports } }) })
    // 3. Parse: const data = await response.json()
    // 4. If !response.ok, throw error with data.message, response.status, data.code
    // 5. Log: console.log("/VerifyFactor", JSON.stringify(data, null, 2))
    // 6. Store factor info: factorStore.set(data.sid, { friendly_name: data.friendly_name, identity: data.identity, phone: null, email: null })
    // 7. Return { success: data.status === "verified", status: data.status }
  } catch (error) {
    console.error(`Passkey verify factor error ${error.code}: ${error.message}`);
    errorRes(res, error.status, error.message, error.code);
  }
});

// 5.3 Authenticate with a passkey — create a Challenge
passkeysRouter.post("/authenticate", async (req, res) => {
  try {
    // TODO: Implement passkey authentication challenge
    // 1. Build URL: `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Passkeys/Challenges`
    // 2. Call twilioFetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({}) })
    // 3. Parse: const data = await response.json()
    // 4. If !response.ok, throw error with data.message, response.status, data.code
    // 5. Return { options: data.options }
  } catch (error) {
    console.error(`Passkey challenge error ${error.code}: ${error.message}`);
    errorRes(res, error.status, error.message, error.code);
  }
});

// 5.4 Authenticate with a passkey — approve the Challenge
passkeysRouter.post("/authenticate/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response: assertionResponse } = req.body;

    if (!id || !assertionResponse) {
      return res.status(400).json({ error: "Assertion response required" });
    }

    // TODO: Implement passkey challenge approval
    // 1. Build URL: `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Passkeys/ApproveChallenge`
    // 2. Call twilioFetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ id, rawId, authenticatorAttachment, type, response: { authenticatorData: assertionResponse.authenticatorData, clientDataJSON: assertionResponse.clientDataJSON, signature: assertionResponse.signature, userHandle: assertionResponse.userHandle } }) })
    // 3. Parse: const data = await response.json()
    // 4. If !response.ok, throw error with data.message, response.status, data.code
    // 5. Look up factor info: const factorInfo = factorStore.get(data.factor_sid) || {}
    // 6. Return { success: data.status === "approved", status: data.status, friendly_name: factorInfo.friendly_name || null, identity: factorInfo.identity || null }
  } catch (error) {
    console.error(`Passkey approve challenge error ${error.code}: ${error.message}`);
    errorRes(res, error.status, error.message, error.code);
  }
});

module.exports = { passkeysRouter, initialize };
