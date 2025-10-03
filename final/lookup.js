/**
 * Routes for Twilio Lookup API
 *
 * See: https://www.twilio.com/docs/lookup/v2-api
 */

const express = require("express");

const router = express.Router();
let twilioClient;

const initialize = (client) => {
  twilioClient = client;
};

const handleTwilioError = (error) => {
  if (error.code === 20404) {
    return { statusCode: 404, message: "Phone number not found or invalid" };
  }
  if (error.code === 20003) {
    return { statusCode: 403, message: "Authentication failed" };
  }
  return { statusCode: 400, message: error.message };
};

// 1.1. Basic Lookup for phone number
router.get("/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const { countryCode } = req.query;
    const opts = {};

    if (countryCode) {
      opts.countryCode = req.query.countryCode;
    }

    const result = await twilioClient.lookups.v2
      .phoneNumbers(phone)
      .fetch(opts);

    res.json({
      valid: result.valid,
      phoneNumber: result.phoneNumber,
      nationalFormat: result.nationalFormat,
      countryCode: result.countryCode,
      callingCountryCode: result.callingCountryCode,
      validationErrors: result.validationErrors,
    });
  } catch (error) {
    const { statusCode, message } = handleTwilioError(error);
    res.status(statusCode).json({ error: message });
  }
});

// 1.2. Lookup with line type intelligence
router.get("/:phone/line-type", async (req, res) => {
  try {
    const { phone } = req.params;
    const opts = {
      fields: ["line_type_intelligence"],
    };

    const result = await twilioClient.lookups.v2
      .phoneNumbers(phone)
      .fetch(opts);

    const lineType = result.lineTypeIntelligence?.type;

    res.json({
      valid: result.valid,
      phoneNumber: result.phoneNumber,
      nationalFormat: result.nationalFormat,
      countryCode: result.countryCode,
      callingCountryCode: result.callingCountryCode,
      validationErrors: result.validationErrors,
      // check for mobile
      isMobile: lineType === "mobile",
      // check for landline
      isLandline: lineType === "landline",
      // send the entire line type intelligence object
      // lineTypeIntelligence: result.lineTypeIntelligence,
    });
  } catch (error) {
    const { statusCode, message } = handleTwilioError(error);
    res.status(statusCode).json({ error: message });
  }
});

// 1.3. Lookup with line type intelligence
router.get("/:phone/sms-pumping", async (req, res) => {
  try {
    const { phone } = req.params;
    const opts = {
      fields: ["sms_pumping_risk"],
    };

    const result = await twilioClient.lookups.v2
      .phoneNumbers(phone)
      .fetch(opts);

    res.json({
      valid: result.valid,
      phoneNumber: result.phoneNumber,
      nationalFormat: result.nationalFormat,
      countryCode: result.countryCode,
      callingCountryCode: result.callingCountryCode,
      validationErrors: result.validationErrors,
      smsPumpingRisk: result.smsPumpingRisk,
    });
  } catch (error) {
    const { statusCode, message } = handleTwilioError(error);
    res.status(statusCode).json({ error: message });
  }
});

// 1.4. Lookup with multiple packages
// For list of all Lookup data packages, see https://www.twilio.com/docs/lookup/v2-api#data-packages
router.get("/:phone/multiple", async (req, res) => {
  try {
    const { phone } = req.params;
    const opts = {
      fields: [
        "line_type_intelligence", // Worldwide
        "sms_pumping_risk", // Worldwide
        // "sim_swap", // private beta
        // "call_forwarding", // private beta
        // "line_status", // private beta
        // "identity_match", // Europe, LATAM, North America, Australia: https://www.twilio.com/docs/lookup/v2-api/identity-match
        "caller_name", // US carrier numbers only
        // "reassigned_number", // US only
      ].join(),
    };

    const result = await twilioClient.lookups.v2
      .phoneNumbers(phone)
      .fetch(opts);

    res.json(result);
  } catch (error) {
    const { statusCode, message } = handleTwilioError(error);
    res.status(statusCode).json({ error: message });
  }
});

module.exports = {
  router,
  initialize,
};
