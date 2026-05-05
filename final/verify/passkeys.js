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

passkeysRouter.post("/register", async (req, res) => {
  try {
    const { friendly_name } = req.body;
    const identity = "UA-" + crypto.randomUUID();

    const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Passkeys/Factors`;
    const response = await twilioFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ friendly_name: friendly_name || "Passkey", identity }),
    });

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.message || "Twilio error");
      err.status = response.status;
      err.code = data.code;
      throw err;
    }

    console.log("/Factors", JSON.stringify(data, null, 2));
    res.json({ identity, options: data.options });
  } catch (error) {
    console.error(`Passkey register error ${error.code}: ${error.message}`);
    errorRes(res, error.status, error.message, error.code);
  }
});

passkeysRouter.post("/register/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response: credResponse } = req.body;

    if (!id || !credResponse) {
      return res.status(400).json({ error: "Credential response required" });
    }

    const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Passkeys/VerifyFactor`;
    const response = await twilioFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        id,
        rawId,
        authenticatorAttachment,
        type,
        response: {
          attestationObject: credResponse.attestationObject,
          clientDataJSON: credResponse.clientDataJSON,
          transports: credResponse.transports,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.message || "Twilio error");
      err.status = response.status;
      err.code = data.code;
      throw err;
    }

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
    errorRes(res, error.status, error.message, error.code);
  }
});

passkeysRouter.post("/authenticate", async (req, res) => {
  try {
    const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Passkeys/Challenges`;
    const response = await twilioFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.message || "Twilio error");
      err.status = response.status;
      err.code = data.code;
      throw err;
    }

    res.json({ options: data.options });
  } catch (error) {
    console.error(`Passkey challenge error ${error.code}: ${error.message}`);
    errorRes(res, error.status, error.message, error.code);
  }
});

passkeysRouter.post("/authenticate/verify", async (req, res) => {
  try {
    const { id, rawId, authenticatorAttachment, type, response: assertionResponse } = req.body;

    if (!id || !assertionResponse) {
      return res.status(400).json({ error: "Assertion response required" });
    }

    const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Passkeys/ApproveChallenge`;
    const response = await twilioFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        id,
        rawId,
        authenticatorAttachment,
        type,
        response: {
          authenticatorData: assertionResponse.authenticatorData,
          clientDataJSON: assertionResponse.clientDataJSON,
          signature: assertionResponse.signature,
          userHandle: assertionResponse.userHandle,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.message || "Twilio error");
      err.status = response.status;
      err.code = data.code;
      throw err;
    }

    const factorInfo = factorStore.get(data.factor_sid) || {};

    res.json({
      success: data.status === "approved",
      status: data.status,
      friendly_name: factorInfo.friendly_name || null,
      identity: factorInfo.identity || null,
    });
  } catch (error) {
    console.error(`Passkey approve challenge error ${error.code}: ${error.message}`);
    errorRes(res, error.status, error.message, error.code);
  }
});

module.exports = { passkeysRouter, initialize };
