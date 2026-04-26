"use strict";

function errorRes(res, status = 500, message = "An error occurred", code = "UNKNOWN_ERROR") {
  console.error(status, code, message);
  res.status(status).json({ status, message, code });
}

module.exports = { errorRes };
