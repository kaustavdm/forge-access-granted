(function () {
  var phoneForm = document.getElementById("phone-form");
  var phoneOtpForm = document.getElementById("phone-otp-form");
  var phoneInput = document.getElementById("phone");
  var phoneOtpInput = document.getElementById("phone-otp");
  var phoneError = document.getElementById("phone-error");
  var phoneOtpError = document.getElementById("phone-otp-error");
  var resendLink = document.getElementById("resend-phone-otp");
  var callLink = document.getElementById("call-phone-otp");
  var skipPhoneLink = document.getElementById("skip-phone");
  var passkeyLoginLink = document.getElementById("passkey-login");

  var resendTimerId = null;

  function showView(id) {
    phoneForm.style.display = id === "phone-form" ? "" : "none";
    phoneOtpForm.style.display = id === "phone-otp-form" ? "" : "none";
  }

  var clearError = App.ui.clearError;
  var showError = App.ui.showError;
  var toggleButton = App.ui.toggleButton;

  function startResendTimer(duration) {
    var remaining = duration;
    resendLink.classList.add("disabled");
    resendLink.textContent = "Resend OTP in " + remaining + " seconds";
    callLink.style.display = "none";

    resendTimerId = setInterval(function () {
      remaining--;
      if (remaining <= 0) {
        clearInterval(resendTimerId);
        resendTimerId = null;
        resendLink.classList.remove("disabled");
        resendLink.textContent = "Resend OTP";
        callLink.style.display = "";
        return;
      }
      resendLink.textContent = "Resend OTP in " + remaining + " seconds";
    }, 1000);
  }

  function stopResendTimer() {
    if (resendTimerId) {
      clearInterval(resendTimerId);
      resendTimerId = null;
    }
    callLink.style.display = "none";
  }

  function handlePhoneSubmit(e) {
    e.preventDefault();
    clearError(phoneError);
    var phone = phoneInput.value.trim();
    if (!phone) return;

    var submitBtn = phoneForm.querySelector("button[type=submit]");
    toggleButton(submitBtn, true);

    App.api.get("/api/lookup/" + encodeURIComponent(phone))
      .then(function (data) {
        if (!data.valid) {
          showError(phoneError, data.message || "Invalid phone number");
          toggleButton(submitBtn, false);
          return;
        }
        return App.api.post("/api/verify/phone", { phone: phone })
          .then(function (res) {
            if (res.error) {
              showError(phoneError, res.error);
              toggleButton(submitBtn, false);
              return;
            }
            App.state.set("userPhone", phone);
            showView("phone-otp-form");
            startResendTimer(30);
            toggleButton(submitBtn, false);
          });
      })
      .catch(function (err) {
        showError(phoneError, "Something went wrong. Please try again.");
        toggleButton(submitBtn, false);
      });
  }

  function handlePhoneOtpSubmit(e) {
    e.preventDefault();
    clearError(phoneOtpError);
    var code = phoneOtpInput.value.trim();
    if (!code) return;

    var submitBtn = phoneOtpForm.querySelector("button[type=submit]");
    toggleButton(submitBtn, true);

    App.api.post("/api/verify/phone/validate", { phone: App.state.get("userPhone"), code: code })
      .then(function (data) {
        if (!data.valid) {
          showError(phoneOtpError, data.message || "Invalid code. Please try again.");
          toggleButton(submitBtn, false);
          return;
        }
        App.state.set("phoneVerified", true);
        stopResendTimer();
        window.location.href = "email.html";
      })
      .catch(function (err) {
        showError(phoneOtpError, "Something went wrong. Please try again.");
        toggleButton(submitBtn, false);
      });
  }

  function handleResendPhoneOtp(e) {
    e.preventDefault();
    if (resendLink.classList.contains("disabled")) return;
    clearError(phoneOtpError);

    App.api.post("/api/verify/phone", { phone: App.state.get("userPhone") })
      .then(function (res) {
        if (res.error) {
          showError(phoneOtpError, res.error);
          return;
        }
        startResendTimer(30);
      })
      .catch(function (err) {
        showError(phoneOtpError, "Failed to resend OTP. Please try again.");
      });
  }

  function handleCallPhoneOtp(e) {
    e.preventDefault();
    clearError(phoneOtpError);

    App.api.post("/api/verify/phone", { phone: App.state.get("userPhone"), channel: "call" })
      .then(function (res) {
        if (res.error) {
          showError(phoneOtpError, res.error);
          return;
        }
        startResendTimer(30);
      })
      .catch(function (err) {
        showError(phoneOtpError, "Failed to initiate call. Please try again.");
      });
  }

  function handleSkipPhone(e) {
    e.preventDefault();
    App.state.set("phoneSkipped", true);
    window.location.href = "email.html";
  }

  var passkeyAuthInFlight = false;

  function handlePasskeyLogin(e) {
    e.preventDefault();
    if (passkeyAuthInFlight) return;
    passkeyAuthInFlight = true;
    clearError(phoneError);

    App.api.post("/api/passkeys/authenticate", {})
      .then(function (data) {
        if (data.error || !data.options) {
          showError(phoneError, data.error || "Failed to start authentication.");
          return;
        }
        var requestOptions =
          PublicKeyCredential.parseRequestOptionsFromJSON(data.options.publicKey);
        return navigator.credentials.get({ publicKey: requestOptions })
          .then(function (assertion) {
            if (!assertion) {
              showError(phoneError, "Passkey authentication was cancelled.");
              return;
            }
            return App.api.post("/api/passkeys/authenticate/verify", assertion.toJSON());
          })
          .then(function (result) {
            if (!result || !result.success) {
              showError(phoneError, "Passkey authentication failed.");
              passkeyAuthInFlight = false;
              return;
            }
            App.state.set("passkeyFriendlyName", result.friendly_name || null);
            App.state.set("passkeyAuthUsed", true);
            window.location.href = "dashboard.html";
          });
      })
      .catch(function (err) {
        passkeyAuthInFlight = false;
        if (err.name === "NotAllowedError") {
          showError(phoneError, "Passkey authentication was cancelled.");
        } else {
          showError(phoneError, "Passkey authentication failed. Please try again.");
        }
      });
  }

  phoneForm.onsubmit = handlePhoneSubmit;
  phoneOtpForm.onsubmit = handlePhoneOtpSubmit;
  resendLink.onclick = handleResendPhoneOtp;
  callLink.onclick = handleCallPhoneOtp;
  skipPhoneLink.onclick = handleSkipPhone;
  passkeyLoginLink.onclick = handlePasskeyLogin;

})();
