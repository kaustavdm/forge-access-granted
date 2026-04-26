"use strict";

function buildAuthHeader(apiKeySid, apiKeySecret) {
  const encoded = Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString("base64");
  return `Basic ${encoded}`;
}

function createTwilioFetch(apiKeySid, apiKeySecret) {
  const authorization = buildAuthHeader(apiKeySid, apiKeySecret);

  return function twilioFetch(url, options = {}) {
    const merged = {
      ...options,
      headers: {
        Authorization: authorization,
        ...options.headers,
      },
    };
    return fetch(url, merged);
  };
}

module.exports = { createTwilioFetch };
