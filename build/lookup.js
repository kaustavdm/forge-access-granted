"use strict";

const express = require("express");
const { errorRes } = require("./lib/errors");

const router = express.Router();
const LOOKUP_BASE = "https://lookups.twilio.com/v2/PhoneNumbers";

let twilioFetch;

function initialize(fetchFn) {
  twilioFetch = fetchFn;
}

function buildUrl(phone, params) {
  const url = new URL(`${LOOKUP_BASE}/${encodeURIComponent(phone)}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
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
    const params = {};
    if (req.query.countryCode) {
      params.CountryCode = req.query.countryCode;
    }

    // TODO: Implement basic phone number lookup
    // 1. Call twilioFetch with buildUrl(phone, params)
    // 2. Check if response.ok — if not, parse error JSON and return with errorRes()
    // 3. Parse the response JSON
    // 4. Return pickBaseFields(data) as the JSON response
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

// 2.2 Lookup with Line Type Intelligence
router.get("/:phone/line-type", async (req, res) => {
  try {
    const { phone } = req.params;

    // TODO: Implement lookup with line type intelligence
    // 1. Call twilioFetch with buildUrl(phone, { Fields: "line_type_intelligence" })
    // 2. Check if response.ok — if not, parse error JSON and return with errorRes()
    // 3. Parse the response JSON
    // 4. Extract line type: data.line_type_intelligence?.type
    // 5. Return { ...pickBaseFields(data), isMobile: lineType === "mobile", isLandline: lineType === "landline" }
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

// 2.3 Lookup with SMS Pumping Risk
router.get("/:phone/sms-pumping", async (req, res) => {
  try {
    const { phone } = req.params;

    // TODO: Implement lookup with SMS pumping risk
    // 1. Call twilioFetch with buildUrl(phone, { Fields: "sms_pumping_risk" })
    // 2. Check if response.ok — if not, parse error JSON and return with errorRes()
    // 3. Parse the response JSON
    // 4. Return { ...pickBaseFields(data), sms_pumping_risk: data.sms_pumping_risk }
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

// 2.4 Lookup with multiple data packages
router.get("/:phone/multiple", async (req, res) => {
  try {
    const { phone } = req.params;

    // TODO: Implement lookup with multiple data packages
    // 1. Call twilioFetch with buildUrl(phone, { Fields: "line_type_intelligence,sms_pumping_risk,caller_name" })
    // 2. Check if response.ok — if not, parse error JSON and return with errorRes()
    // 3. Parse the response JSON
    // 4. Return the full data object as JSON
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

module.exports = { router, initialize };
