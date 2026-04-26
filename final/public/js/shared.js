(function () {
  var STORAGE_KEY_MAP = {
    userPhone:           "forge_user_phone",
    userEmail:           "forge_user_email",
    phoneVerified:       "forge_phone_verified",
    phoneSkipped:        "forge_phone_skipped",
    emailVerified:       "forge_email_verified",
    emailSkipped:        "forge_email_skipped",
    passkeyRegistered:   "forge_passkey_registered",
    passkeyFailed:       "forge_passkey_failed",
    passkeySkipped:      "forge_passkey_skipped",
    passkeyAuthUsed:     "forge_passkey_auth_used",
    passkeyFriendlyName: "forge_passkey_friendly_name",
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
    passkeySkipped:     false,
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

  var STRING_KEYS = { userPhone: true, userEmail: true, passkeyFriendlyName: true };
  var cache = {};

  function loadAll() {
    Object.keys(STORAGE_KEY_MAP).forEach(function (key) {
      var val = localStorage.getItem(STORAGE_KEY_MAP[key]);
      cache[key] = val === null ? DEFAULTS[key] : (STRING_KEYS[key] ? val : val === "true");
    });
  }

  var state = {
    get: function (key) {
      return cache.hasOwnProperty(key) ? cache[key] : DEFAULTS[key];
    },
    set: function (key, val) {
      cache[key] = val;
      var storageKey = STORAGE_KEY_MAP[key];
      if (!storageKey) return;
      if (val === null || val === undefined || val === "") {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, String(val));
      }
    },
    unset: function (key) {
      cache[key] = DEFAULTS[key];
      var storageKey = STORAGE_KEY_MAP[key];
      if (storageKey) localStorage.removeItem(storageKey);
    },
    clear: function () {
      Object.keys(STORAGE_KEY_MAP).forEach(function (key) {
        localStorage.removeItem(STORAGE_KEY_MAP[key]);
      });
      Object.keys(DEFAULTS).forEach(function (key) {
        cache[key] = DEFAULTS[key];
      });
    },
  };

  loadAll();

  function clearError(el) { el.textContent = ""; }
  function showError(el, msg) { el.textContent = msg; }
  function toggleButton(btn, disabled) { btn.disabled = disabled; }

  window.App = {
    api: {
      post: postJSON,
      get:  getJSON,
    },
    ui: {
      clearError: clearError,
      showError:  showError,
      toggleButton: toggleButton,
    },
    state: state,
  };
})();
