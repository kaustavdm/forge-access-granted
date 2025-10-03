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

const errorRes = (status, message, code) => {
  return {
    status: status || 500,
    message: message || "An error occurred",
    code: code || "UNKNOWN_ERROR",
  };
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
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
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
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
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
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
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
    const err = errorRes(error.status, error.message, error.code);
    res.status(err.status).json(err);
  }
});

module.exports = {
  router,
  initialize,
};
