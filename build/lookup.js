"use strict";

const express = require("express");
const { errorRes } = require("./lib/errors");

const router = express.Router();

let twilioFetch;

function initialize(fetchFn) {
  twilioFetch = fetchFn;
}

function pickBaseFields(data) {
  return {
    valid: data.valid,
    phone_number: data.phone_number,
    national_format: data.national_format,
    country_code: data.country_code,
    calling_country_code: data.calling_country_code,
    validation_errors: data.validation_errors,
  };
}

// 2.1 Basic Lookup
router.get("/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    // TODO: Implement basic phone number lookup
    // 1. Build the URL: new URL(`https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}`)
    // 2. If req.query.countryCode exists, add it: url.searchParams.set("CountryCode", req.query.countryCode)
    // 3. Call twilioFetch(url.toString())
    // 4. Check if response.ok — if not, parse error JSON and return with errorRes()
    // 5. Parse the response JSON
    // 6. Return pickBaseFields(data) as the JSON response
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

// 2.2 Lookup with Line Type Intelligence
router.get("/:phone/line-type", async (req, res) => {
  try {
    const { phone } = req.params;

    // TODO: Implement lookup with line type intelligence
    // 1. Build the URL: `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=line_type_intelligence`
    // 2. Call twilioFetch(url)
    // 3. Check if response.ok — if not, parse error JSON and return with errorRes()
    // 4. Parse the response JSON
    // 5. Extract line type: data.line_type_intelligence?.type
    // 6. Return { ...pickBaseFields(data), isMobile: lineType === "mobile", isLandline: lineType === "landline" }
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

// 2.3 Lookup with SMS Pumping Risk
router.get("/:phone/sms-pumping", async (req, res) => {
  try {
    const { phone } = req.params;

    // TODO: Implement lookup with SMS pumping risk
    // 1. Build the URL: `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=sms_pumping_risk`
    // 2. Call twilioFetch(url)
    // 3. Check if response.ok — if not, parse error JSON and return with errorRes()
    // 4. Parse the response JSON
    // 5. Return { ...pickBaseFields(data), sms_pumping_risk: data.sms_pumping_risk }
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

// 2.4 Lookup with multiple data packages
router.get("/:phone/multiple", async (req, res) => {
  try {
    const { phone } = req.params;

    // TODO: Implement lookup with multiple data packages
    // 1. Build the URL: `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=line_type_intelligence,sms_pumping_risk,caller_name`
    // 2. Call twilioFetch(url)
    // 3. Check if response.ok — if not, parse error JSON and return with errorRes()
    // 4. Parse the response JSON
    // 5. Return the full data object as JSON
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

module.exports = { router, initialize };
