"use strict";

const express = require("express");
const phone = require("./phone");
const email = require("./email");
const passkeys = require("./passkeys");

const router = express.Router();

function initialize(twilioFetch, verifyServiceSid) {
  phone.initialize(twilioFetch, verifyServiceSid);
  email.initialize(twilioFetch, verifyServiceSid);
  passkeys.initialize(twilioFetch, verifyServiceSid);
}

router.use(phone.router);
router.use(email.router);

module.exports = { router, passkeysRouter: passkeys.passkeysRouter, initialize };
