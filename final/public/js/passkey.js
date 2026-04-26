(function () {
  var form = document.getElementById("passkey-register");
  var newDiv = document.getElementById("passkey-register-new");
  var existingDiv = document.getElementById("passkey-register-existing");
  var errorEl = document.getElementById("passkey-register-error");
  var friendlyNameInput = document.getElementById("passkey-friendly-name-input");
  var signinBtn = document.getElementById("passkey-signin-btn");
  var createNewLink = document.getElementById("passkey-create-new");
  var skipLink = document.getElementById("skip-passkey");

  var clearError = App.ui.clearError;
  var showError = App.ui.showError;
  var toggleButton = App.ui.toggleButton;

  function setupView() {
    if (App.state.get("passkeyRegistered")) {
      newDiv.style.display = "none";
      existingDiv.style.display = "";
    } else {
      newDiv.style.display = "";
      existingDiv.style.display = "none";
    }
  }

  function runPasskeyAuth() {
    clearError(errorEl);
    return App.api.post("/api/passkeys/authenticate", {}).then(function (data) {
      if (data.error || !data.options) {
        showError(errorEl, data.error || "Failed to start authentication.");
        return false;
      }

      var requestOptions =
        PublicKeyCredential.parseRequestOptionsFromJSON(data.options.publicKey);
      return navigator.credentials.get({ publicKey: requestOptions }).then(function (assertion) {
        if (!assertion) {
          showError(errorEl, "Passkey authentication was cancelled.");
          return false;
        }

        return App.api.post("/api/passkeys/authenticate/verify", assertion.toJSON()).then(function (verifyData) {
          if (verifyData.success) {
            App.state.set("passkeyFriendlyName", verifyData.friendly_name || null);
            App.state.set("passkeyAuthUsed", true);
            return true;
          }

          showError(errorEl, "Authentication failed. Please try again.");
          return false;
        });
      });
    });
  }

  function handleRegisterPasskey(e) {
    e.preventDefault();
    clearError(errorEl);

    var button = form.querySelector("button[type='submit']");
    toggleButton(button, true);

    var friendlyName = friendlyNameInput.value.trim() ||
      App.state.get("userEmail") || App.state.get("userPhone") || "My Passkey";

    App.api.post("/api/passkeys/register", { friendly_name: friendlyName })
      .then(function (data) {
        if (data.error || !data.options) {
          showError(errorEl, data.error || "Failed to start passkey registration.");
          toggleButton(button, false);
          return;
        }

        var creationOptions =
          PublicKeyCredential.parseCreationOptionsFromJSON(data.options.publicKey);
        return navigator.credentials.create({ publicKey: creationOptions })
          .then(function (credential) {
            if (!credential) {
              showError(errorEl, "Passkey registration was cancelled.");
              toggleButton(button, false);
              return;
            }

            return App.api.post("/api/passkeys/register/verify", credential.toJSON())
              .then(function (verifyData) {
                if (verifyData.success) {
                  App.state.set("passkeyRegistered", true);
                  window.location.href = "dashboard.html";
                } else {
                  showError(errorEl, "Passkey registration failed. Please try again.");
                }
                toggleButton(button, false);
              });
          });
      })
      .catch(function (err) {
        if (err.name === "NotAllowedError") {
          showError(errorEl, "Passkey registration was cancelled.");
        } else {
          showError(errorEl, "Failed to register passkey.");
        }
        toggleButton(button, false);
      });
  }

  function handlePasskeySignIn(e) {
    e.preventDefault();
    toggleButton(signinBtn, true);
    runPasskeyAuth()
      .then(function (success) {
        if (success) {
          window.location.href = "dashboard.html";
        }
        toggleButton(signinBtn, false);
      })
      .catch(function (err) {
        if (err.name === "NotAllowedError") {
          showError(errorEl, "Passkey authentication was cancelled.");
        } else {
          showError(errorEl, "Failed to authenticate with passkey.");
        }
        toggleButton(signinBtn, false);
      });
  }

  function handleCreateNew(e) {
    e.preventDefault();
    existingDiv.style.display = "none";
    newDiv.style.display = "";
  }

  function handleSkipPasskey(e) {
    e.preventDefault();
    if (!App.state.get("passkeyRegistered")) {
      App.state.set("passkeyFailed", true);
    }
    window.location.href = "dashboard.html";
  }

  form.onsubmit = handleRegisterPasskey;
  signinBtn.onclick = handlePasskeySignIn;
  createNewLink.onclick = handleCreateNew;
  skipLink.onclick = handleSkipPasskey;

  setupView();
})();
