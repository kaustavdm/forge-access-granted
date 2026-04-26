(function () {
  function getChecklistStatus(verified, skipped) {
    if (verified) return "done";
    return "skipped";
  }

  function setChecklistItem(id, status) {
    var el = document.getElementById(id);
    el.classList.remove("status-done", "status-skipped", "status-failed");
    el.classList.add("status-" + status);
    var icon = el.querySelector(".checklist-icon");
    if (status === "done") icon.textContent = "✓";
    else if (status === "skipped") icon.textContent = "–";
    else if (status === "failed") icon.textContent = "✗";
    el.setAttribute("aria-label", id.replace("checklist-", "") + ": " + status);
  }

  function setupDashboard() {
    var greeting = document.getElementById("dashboard-passkey-greeting");
    var setupBtn = document.getElementById("setup-passkey-btn");

    greeting.style.display = "none";
    setupBtn.style.display = "none";

    if (App.state.passkeyAuthUsed && App.state.passkeyFriendlyName) {
      greeting.style.display = "";
      document.getElementById("passkey-friendly-name").textContent = App.state.passkeyFriendlyName;
    }

    if (!App.state.passkeyRegistered && !App.state.passkeyAuthUsed) {
      setupBtn.style.display = "";
    }

    setChecklistItem("checklist-phone", getChecklistStatus(App.state.phoneVerified, App.state.phoneSkipped));
    setChecklistItem("checklist-email", getChecklistStatus(App.state.emailVerified, App.state.emailSkipped));

    var passkeyStatus;
    if (App.state.passkeyRegistered || App.state.passkeyAuthUsed) {
      passkeyStatus = "done";
    } else if (App.state.passkeyFailed) {
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

  App.state.load();
  setupDashboard();
})();
