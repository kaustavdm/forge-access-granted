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

    // TODO: Add implementation here
    // 1. Use the twilioClient to fetch phone number details
    // 2. Return a properly formatted response
  } catch (error) {
    const { statusCode, message } = handleTwilioError(error);
    res.status(statusCode).json({ error: message });
  }
});

// 1.2. Lookup with line type intelligence
router.get("/:phone/line-type", async (req, res) => {
  try {
    const { phone } = req.params;

    // TODO: Add implementation here
    // 1. Use the twilioClient to fetch phone number details with line_type_intelligence
    // 2. Extract the line type information
    // 3. Return a properly formatted response
  } catch (error) {
    const { statusCode, message } = handleTwilioError(error);
    res.status(statusCode).json({ error: message });
  }
});

// 1.3. Lookup with SMS pumping risk check
router.get("/:phone/sms-pumping", async (req, res) => {
  try {
    const { phone } = req.params;

    // TODO: Add implementation here
    // 1. Use the twilioClient to fetch phone number details with sms_pumping_risk
    // 2. Return a properly formatted response
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

    // TODO: Add implementation here
    // 1. Use the twilioClient to fetch phone number details with multiple data packages
    // 2. Return the full response
  } catch (error) {
    const { statusCode, message } = handleTwilioError(error);
    res.status(statusCode).json({ error: message });
  }
});

module.exports = {
  router,
  initialize,
};
