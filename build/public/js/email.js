(function () {
  var emailForm = document.getElementById("email-form");
  var emailOtpForm = document.getElementById("email-otp-form");
  var emailInput = document.getElementById("email");
  var emailOtpInput = document.getElementById("email-otp");
  var emailError = document.getElementById("email-error");
  var emailOtpError = document.getElementById("email-otp-error");
  var skipEmailLink = document.getElementById("skip-email");
  var resendLink = document.getElementById("resend-email-otp");

  var resendTimerId = null;

  function showView(id) {
    emailForm.style.display = id === "email-form" ? "" : "none";
    emailOtpForm.style.display = id === "email-otp-form" ? "" : "none";
  }

  var clearError = App.ui.clearError;
  var showError = App.ui.showError;
  var toggleButton = App.ui.toggleButton;

  function startResendTimer(duration) {
    var remaining = duration;
    resendLink.classList.add("disabled");
    resendLink.textContent = "Resend OTP in " + remaining + " seconds";
    resendTimerId = setInterval(function () {
      remaining--;
      if (remaining <= 0) {
        clearInterval(resendTimerId);
        resendTimerId = null;
        resendLink.classList.remove("disabled");
        resendLink.textContent = "Resend OTP";
        return;
      }
      resendLink.textContent = "Resend OTP in " + remaining + " seconds";
    }, 1000);
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    clearError(emailError);
    var email = emailInput.value.trim();
    var btn = emailForm.querySelector("button");
    toggleButton(btn, true);

    App.api.post("/api/verify/email", { email: email }).then(function (data) {
      toggleButton(btn, false);
      if (data.success) {
        App.state.set("userEmail", email);
        showView("email-otp-form");
        startResendTimer(30);
      } else {
        showError(emailError, data.message || "Failed to send OTP");
      }
    }).catch(function () {
      toggleButton(btn, false);
      showError(emailError, "Network error. Please try again.");
    });
  }

  function handleEmailOtpSubmit(e) {
    e.preventDefault();
    clearError(emailOtpError);
    var code = emailOtpInput.value.trim();
    var btn = emailOtpForm.querySelector("button");
    toggleButton(btn, true);

    App.api.post("/api/verify/email/validate", { email: App.state.get("userEmail"), code: code }).then(function (data) {
      toggleButton(btn, false);
      if (data.valid) {
        App.state.set("emailVerified", true);
        window.location.href = "passkey.html";
      } else {
        showError(emailOtpError, data.message || "Invalid code");
      }
    }).catch(function () {
      toggleButton(btn, false);
      showError(emailOtpError, "Network error. Please try again.");
    });
  }

  function handleResendEmailOtp(e) {
    e.preventDefault();
    if (resendLink.classList.contains("disabled")) return;
    clearError(emailOtpError);

    App.api.post("/api/verify/email", { email: App.state.get("userEmail") })
      .then(function (res) {
        if (!res.success) {
          showError(emailOtpError, res.message || "Failed to resend OTP.");
          return;
        }
        startResendTimer(30);
      })
      .catch(function () {
        showError(emailOtpError, "Failed to resend OTP. Please try again.");
      });
  }

  function handleSkipEmail(e) {
    e.preventDefault();
    App.state.set("emailSkipped", true);
    window.location.href = "passkey.html";
  }

  emailForm.onsubmit = handleEmailSubmit;
  emailOtpForm.onsubmit = handleEmailOtpSubmit;
  resendLink.onclick = handleResendEmailOtp;
  skipEmailLink.onclick = handleSkipEmail;

})();
