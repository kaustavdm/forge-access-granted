(function () {
  var form = document.getElementById("passkey-register");
  var newDiv = document.getElementById("passkey-register-new");
  var existingDiv = document.getElementById("passkey-register-existing");
  var errorEl = document.getElementById("passkey-register-error");
  var friendlyNameInput = document.getElementById("passkey-friendly-name-input");
  var signinBtn = document.getElementById("passkey-signin-btn");
  var createNewLink = document.getElementById("passkey-create-new");
  var skipLink = document.getElementById("skip-passkey");

  function clearError(el) {
    el.textContent = "";
  }

  function showError(el, msg) {
    el.textContent = msg;
  }

  function toggleButton(btn, disabled) {
    btn.disabled = disabled;
  }

  function setupView() {
    if (App.state.passkeyRegistered) {
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
            App.state.passkeyFriendlyName = verifyData.friendly_name || null;
            App.state.passkeyAuthUsed = true;
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
      App.state.userEmail || App.state.userPhone || "My Passkey";

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
                  App.state.passkeyRegistered = true;
                  App.state.save("passkeyRegistered");
                  window.location.href = "/dashboard.html";
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
          window.location.href = "/dashboard.html";
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
    if (!App.state.passkeyRegistered) {
      App.state.passkeyFailed = true;
      App.state.save("passkeyFailed");
    }
    window.location.href = "/dashboard.html";
  }

  form.onsubmit = handleRegisterPasskey;
  signinBtn.onclick = handlePasskeySignIn;
  createNewLink.onclick = handleCreateNew;
  skipLink.onclick = handleSkipPasskey;

  App.state.load();
  setupView();
})();
