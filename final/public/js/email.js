(function () {
  var emailForm = document.getElementById("email-form");
  var emailOtpForm = document.getElementById("email-otp-form");
  var emailInput = document.getElementById("email");
  var emailOtpInput = document.getElementById("email-otp");
  var emailError = document.getElementById("email-error");
  var emailOtpError = document.getElementById("email-otp-error");
  var skipEmailLink = document.getElementById("skip-email");

  function showView(id) {
    emailForm.style.display = id === "email-form" ? "" : "none";
    emailOtpForm.style.display = id === "email-otp-form" ? "" : "none";
  }

  var clearError = App.ui.clearError;
  var showError = App.ui.showError;
  var toggleButton = App.ui.toggleButton;

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

  function handleSkipEmail(e) {
    e.preventDefault();
    App.state.set("emailSkipped", true);
    window.location.href = "passkey.html";
  }

  emailForm.onsubmit = handleEmailSubmit;
  emailOtpForm.onsubmit = handleEmailOtpSubmit;
  skipEmailLink.onclick = handleSkipEmail;

})();
