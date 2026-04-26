(function () {
  var STORAGE_KEY_MAP = {
    phoneVerified:     "forge_phone_verified",
    phoneSkipped:      "forge_phone_skipped",
    emailVerified:     "forge_email_verified",
    emailSkipped:      "forge_email_skipped",
    passkeyRegistered: "forge_passkey_registered",
    passkeyFailed:     "forge_passkey_failed",
  };

  var DEFAULTS = {
    userEmail:          "",
    userPhone:          "",
    phoneVerified:      false,
    phoneSkipped:       false,
    emailVerified:      false,
    emailSkipped:       false,
    passkeyRegistered:  false,
    passkeyFailed:      false,
    passkeyAuthUsed:    false,
    passkeyFriendlyName: null,
  };

  function postJSON(endpoint, data) {
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(function (res) { return res.json(); });
  }

  function getJSON(endpoint) {
    return fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then(function (res) { return res.json(); });
  }

  function loadState(state) {
    Object.keys(STORAGE_KEY_MAP).forEach(function (stateKey) {
      var val = localStorage.getItem(STORAGE_KEY_MAP[stateKey]);
      if (val !== null) {
        state[stateKey] = val === "true";
      }
    });
  }

  function saveState(state, stateKey) {
    var storageKey = STORAGE_KEY_MAP[stateKey];
    if (!storageKey) {
      console.warn("App.state.save: unknown stateKey \"" + stateKey + "\"");
      return;
    }
    localStorage.setItem(storageKey, String(state[stateKey]));
  }

  function clearState(state) {
    Object.keys(STORAGE_KEY_MAP).forEach(function (stateKey) {
      localStorage.removeItem(STORAGE_KEY_MAP[stateKey]);
    });
    Object.keys(DEFAULTS).forEach(function (key) {
      state[key] = DEFAULTS[key];
    });
  }

  var state = {
    userEmail:          "",
    userPhone:          "",
    phoneVerified:      false,
    phoneSkipped:       false,
    emailVerified:      false,
    emailSkipped:       false,
    passkeyRegistered:  false,
    passkeyFailed:      false,
    passkeyAuthUsed:    false,
    passkeyFriendlyName: null,

    load:  function () { loadState(state); },
    save:  function (stateKey) { saveState(state, stateKey); },
    clear: function () { clearState(state); },
  };

  window.App = {
    api: {
      post: postJSON,
      get:  getJSON,
    },
    state: state,
  };
})();
