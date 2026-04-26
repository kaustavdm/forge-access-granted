(function () {
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

  function setupDashboard() {
    var greeting = document.getElementById("dashboard-passkey-greeting");
    var setupBtn = document.getElementById("setup-passkey-btn");

    greeting.style.display = "none";
    setupBtn.style.display = "none";

    if (App.state.get("passkeyAuthUsed") && App.state.get("passkeyFriendlyName")) {
      greeting.style.display = "";
      document.getElementById("passkey-friendly-name").textContent = App.state.get("passkeyFriendlyName");
    }

    if (!App.state.get("passkeyRegistered") && !App.state.get("passkeyAuthUsed")) {
      setupBtn.style.display = "";
    }

    setChecklistItem("checklist-phone", getChecklistStatus(App.state.get("phoneVerified"), App.state.get("phoneSkipped")));
    setChecklistItem("checklist-email", getChecklistStatus(App.state.get("emailVerified"), App.state.get("emailSkipped")));

    var passkeyStatus;
    if (App.state.get("passkeyRegistered") || App.state.get("passkeyAuthUsed")) {
      passkeyStatus = "done";
    } else if (App.state.get("passkeyFailed")) {
      passkeyStatus = "failed";
    } else {
      passkeyStatus = "skipped";
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

  document.getElementById("start-over-link").onclick = handleStartOver;
  document.getElementById("setup-passkey-btn").onclick = handleSetupPasskey;

  setupDashboard();
})();
