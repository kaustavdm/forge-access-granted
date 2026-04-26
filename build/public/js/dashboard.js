(function () {
  var verifyPasskeyBtn = document.getElementById("verify-passkey-btn");
  var verifyResult = document.getElementById("passkey-verify-result");
  var verifyInFlight = false;

  function getChecklistStatus(verified, skipped) {
    if (verified) return "done";
    if (skipped) return "skipped";
    return "pending";
  }

  function setChecklistItem(id, status) {
    var el = document.getElementById(id);
    el.classList.remove("status-done", "status-skipped", "status-failed");
    el.classList.add("status-" + status);
    var icon = el.querySelector(".checklist-icon");
    if (status === "done") icon.textContent = "✓";
    else if (status === "skipped") icon.textContent = "–";
    else if (status === "failed") icon.textContent = "✗";
    else icon.textContent = "○";
    el.setAttribute("aria-label", id.replace("checklist-", "") + ": " + status);
  }

  function getSummaryMessage() {
    var anyVerified = App.state.get("phoneVerified") || App.state.get("emailVerified") ||
      App.state.get("passkeyRegistered") || App.state.get("passkeyAuthUsed");
    return anyVerified ? "You have completed onboarding!" : "You have skipped onboarding.";
  }

  function setupDashboard() {
    var greeting = document.getElementById("dashboard-passkey-greeting");
    var setupBtn = document.getElementById("setup-passkey-btn");

    greeting.style.display = "none";
    setupBtn.style.display = "none";
    verifyPasskeyBtn.style.display = "none";

    if (App.state.get("passkeyAuthUsed") && App.state.get("passkeyFriendlyName")) {
      greeting.style.display = "";
      document.getElementById("passkey-friendly-name").textContent = App.state.get("passkeyFriendlyName");
    }

    var anyVerified = App.state.get("phoneVerified") || App.state.get("emailVerified") ||
      App.state.get("passkeyRegistered") || App.state.get("passkeyAuthUsed");
    if (!App.state.get("passkeyRegistered") && !App.state.get("passkeyAuthUsed") &&
        !App.state.get("passkeySkipped") && anyVerified) {
      setupBtn.style.display = "";
    }

    if (App.state.get("passkeyRegistered") && !App.state.get("passkeyAuthUsed")) {
      verifyPasskeyBtn.style.display = "";
    }

    document.getElementById("dashboard-summary").textContent = getSummaryMessage();

    setChecklistItem("checklist-phone", getChecklistStatus(App.state.get("phoneVerified"), App.state.get("phoneSkipped")));
    setChecklistItem("checklist-email", getChecklistStatus(App.state.get("emailVerified"), App.state.get("emailSkipped")));

    var passkeyStatus;
    if (App.state.get("passkeyRegistered") || App.state.get("passkeyAuthUsed")) {
      passkeyStatus = "done";
    } else if (App.state.get("passkeyFailed")) {
      passkeyStatus = "failed";
    } else if (App.state.get("passkeySkipped")) {
      passkeyStatus = "skipped";
    } else {
      passkeyStatus = "pending";
    }
    setChecklistItem("checklist-passkey", passkeyStatus);
  }

  function handleStartOver(e) {
    e.preventDefault();
    App.state.clear();
    window.location.href = "phone.html";
  }

  function handleSetupPasskey(e) {
    e.preventDefault();
    window.location.href = "passkey.html";
  }

  function handleVerifyPasskey(e) {
    e.preventDefault();
    if (verifyInFlight) return;
    verifyInFlight = true;
    verifyResult.style.display = "none";
    verifyResult.textContent = "";
    App.ui.toggleButton(verifyPasskeyBtn, true);

    App.api.post("/api/passkeys/authenticate", {})
      .then(function (data) {
        if (data.error || !data.options) {
          verifyResult.textContent = data.error || "Failed to start passkey verification.";
          verifyResult.style.display = "";
          verifyInFlight = false;
          App.ui.toggleButton(verifyPasskeyBtn, false);
          return;
        }
        var requestOptions = PublicKeyCredential.parseRequestOptionsFromJSON(data.options.publicKey);
        return navigator.credentials.get({ publicKey: requestOptions })
          .then(function (assertion) {
            if (!assertion) {
              verifyResult.textContent = "Passkey verification was cancelled.";
              verifyResult.style.display = "";
              verifyInFlight = false;
              App.ui.toggleButton(verifyPasskeyBtn, false);
              return;
            }
            return App.api.post("/api/passkeys/authenticate/verify", assertion.toJSON())
              .then(function (result) {
                if (result && result.success) {
                  App.state.set("passkeyAuthUsed", true);
                  App.state.set("passkeyFriendlyName", result.friendly_name || null);
                  verifyResult.textContent = "Passkey verified successfully" +
                    (result.friendly_name ? " (" + result.friendly_name + ")" : "") + ".";
                } else {
                  verifyResult.textContent = "Passkey verification failed. Please try again.";
                }
                verifyResult.style.display = "";
                verifyInFlight = false;
                App.ui.toggleButton(verifyPasskeyBtn, false);
                setupDashboard();
              });
          });
      })
      .catch(function (err) {
        verifyInFlight = false;
        App.ui.toggleButton(verifyPasskeyBtn, false);
        verifyResult.textContent = err.name === "NotAllowedError"
          ? "Passkey verification was cancelled."
          : "Passkey verification failed. Please try again.";
        verifyResult.style.display = "";
      });
  }

  document.getElementById("start-over-link").onclick = handleStartOver;
  document.getElementById("setup-passkey-btn").onclick = handleSetupPasskey;
  verifyPasskeyBtn.onclick = handleVerifyPasskey;

  setupDashboard();
})();
