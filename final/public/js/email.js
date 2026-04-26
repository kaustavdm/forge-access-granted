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

  function clearError(el) {
    el.textContent = "";
  }

  function showError(el, msg) {
    el.textContent = msg;
  }

  function toggleButton(btn, disabled) {
    btn.disabled = disabled;
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
        App.state.userEmail = email;
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

    App.api.post("/api/verify/email/validate", { email: App.state.userEmail, code: code }).then(function (data) {
      toggleButton(btn, false);
      if (data.valid) {
        App.state.emailVerified = true;
        App.state.save("emailVerified");
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
    App.state.emailSkipped = true;
    App.state.save("emailSkipped");
    window.location.href = "passkey.html";
  }

  emailForm.onsubmit = handleEmailSubmit;
  emailOtpForm.onsubmit = handleEmailOtpSubmit;
  skipEmailLink.onclick = handleSkipEmail;

  App.state.load();
})();
