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

router.get("/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const url = new URL(`https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}`);
    if (req.query.countryCode) {
      url.searchParams.set("CountryCode", req.query.countryCode);
    }

    const response = await twilioFetch(url.toString());
    if (!response.ok) {
      const err = await response.json();
      return errorRes(res, response.status, err.message || "Lookup failed", err.code || "LOOKUP_ERROR");
    }
    const data = await response.json();
    res.json(pickBaseFields(data));
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

router.get("/:phone/line-type", async (req, res) => {
  try {
    const { phone } = req.params;
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=line_type_intelligence`;

    const response = await twilioFetch(url);
    if (!response.ok) {
      const err = await response.json();
      return errorRes(res, response.status, err.message || "Lookup failed", err.code || "LOOKUP_ERROR");
    }
    const data = await response.json();
    const lineType = data.line_type_intelligence?.type;
    res.json({
      ...pickBaseFields(data),
      isMobile: lineType === "mobile",
      isLandline: lineType === "landline",
    });
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

router.get("/:phone/sms-pumping", async (req, res) => {
  try {
    const { phone } = req.params;
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=sms_pumping_risk`;

    const response = await twilioFetch(url);
    if (!response.ok) {
      const err = await response.json();
      return errorRes(res, response.status, err.message || "Lookup failed", err.code || "LOOKUP_ERROR");
    }
    const data = await response.json();
    res.json({
      ...pickBaseFields(data),
      sms_pumping_risk: data.sms_pumping_risk,
    });
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

router.get("/:phone/multiple", async (req, res) => {
  try {
    const { phone } = req.params;
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=line_type_intelligence,sms_pumping_risk,caller_name`;

    const response = await twilioFetch(url);
    if (!response.ok) {
      const err = await response.json();
      return errorRes(res, response.status, err.message || "Lookup failed", err.code || "LOOKUP_ERROR");
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    errorRes(res, 500, error.message, "LOOKUP_ERROR");
  }
});

module.exports = { router, initialize };
