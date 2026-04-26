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

router.get("/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const params = {};
    if (req.query.countryCode) {
      params.CountryCode = req.query.countryCode;
    }
    const response = await twilioFetch(buildUrl(phone, params));
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
    const response = await twilioFetch(
      buildUrl(phone, { Fields: "line_type_intelligence" })
    );
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
    const response = await twilioFetch(
      buildUrl(phone, { Fields: "sms_pumping_risk" })
    );
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
    const response = await twilioFetch(
      buildUrl(phone, {
        Fields: "line_type_intelligence,sms_pumping_risk,caller_name",
      })
    );
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
