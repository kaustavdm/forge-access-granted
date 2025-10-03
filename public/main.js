/**
 * Onboarding Flow Application
 *
 * This module manages a multi-step user onboarding process:
 * 1. Email verification (send & validate OTP)
 * 2. Phone verification (lookup, send & validate OTP)
 * 3. Success dashboard
 */
const OnboardingFlow = (() => {
  /* ===== CONFIGURATION ===== */

  // Central registry of all DOM element selectors
  const selectors = {
    // Form containers
    emailForm: "#email-form",
    emailOtpForm: "#email-otp-form",
    phoneForm: "#phone-form",
    phoneOtpForm: "#phone-otp-form",
    phoneVerifiedDashboard: "#phone-verified-dashboard",
    dashboard: "#dashboard",

    // Input fields
    emailInput: "#email",
    emailOtpInput: "#email-otp",
    phoneInput: "#phone",
    phoneOtpInput: "#phone-otp",

    // Buttons
    verifyEmailBtn: "#verify-email-btn",

    // Error display elements
    emailError: "#email-error",
    emailOtpError: "#email-otp-error",
    phoneError: "#phone-error",
    phoneOtpError: "#phone-otp-error",
  };

  /* ===== APPLICATION STATE ===== */

  // Holds user data collected during the onboarding flow
  const state = {
    userEmail: "", // Email address (saved after successful verification)
    userPhone: "", // Phone number (saved after successful verification)
  };

  /* ===== UTILITY FUNCTIONS ===== */

  // Common helper functions used throughout the application
  const utils = {
    // Shorthand for document.querySelector
    $(selector) {
      return document.querySelector(selector);
    },

    // Clear any error message from an error display element
    clearError(errorElement) {
      errorElement.textContent = "";
    },

    // Display an error message to the user
    showError(errorElement, message) {
      errorElement.textContent = message;
    },

    // Enable/disable form submit buttons to prevent double submissions
    toggleButton(button, disabled) {
      button.disabled = disabled;
    },
  };

  /* ===== API COMMUNICATION LAYER ===== */

  // Handles all communication with the application backend
  const api = {
    // Generic POST request wrapper for all API calls
    async post(endpoint, data) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    // Generic GET request wrapper for all API calls
    async get(endpoint) {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },

    // Health check API
    healthCheck: () => api.get("/health"),

    // Email verification APIs
    verifyEmail: (email) => api.post("/api/verify/email", { email }),
    validateEmailOtp: (email, code) =>
      api.post("/api/verify/email/validate", { email, code }),

    // Phone verification APIs
    verifyPhone: (phone) => api.post("/api/verify/phone", { phone }),
    validatePhoneOtp: (phone, code) =>
      api.post("/api/verify/phone/validate", { phone, code }),

    // Phone lookup APIs (Twilio Lookup v2)
    lookupPhone: (phone, countryCode) => {
      const url = `/api/lookup/${encodeURIComponent(phone)}`;
      return countryCode 
        ? api.get(`${url}?countryCode=${encodeURIComponent(countryCode)}`)
        : api.get(url);
    },
    lookupPhoneLineType: (phone) => 
      api.get(`/api/lookup/${encodeURIComponent(phone)}/line-type`),
    lookupPhoneSmsPumping: (phone) => 
      api.get(`/api/lookup/${encodeURIComponent(phone)}/sms-pumping`),
    lookupPhoneMultiple: (phone) => 
      api.get(`/api/lookup/${encodeURIComponent(phone)}/multiple`),
  };

  /* ===== STEP MANAGEMENT ===== */

  // Controls which step of the onboarding flow is currently visible
  const stepManager = {
    allSteps: [],

    // Initialize step manager by collecting all step elements
    init() {
      this.allSteps = [
        utils.$(selectors.phoneForm),
        utils.$(selectors.phoneOtpForm),
        utils.$(selectors.phoneVerifiedDashboard),
        utils.$(selectors.emailForm),
        utils.$(selectors.emailOtpForm),
        utils.$(selectors.dashboard),
      ];
    },

    // Show a specific step and hide all others
    show(step) {
      this.allSteps.forEach((el) => (el.style.display = "none"));
      step.style.display = "";
    },
  };

  /* ===== FORM EVENT HANDLERS ===== */

  // Each handler manages one step of the onboarding flow
  const handlers = {
    /**
     * STEP 1: Phone Number Submission
     * Validates phone number and sends SMS verification code
     */
    async handlePhoneSubmit(e) {
      e.preventDefault();

      // Get form elements
      const phoneInput = utils.$(selectors.phoneInput);
      const phoneError = utils.$(selectors.phoneError);
      const button = e.target.querySelector("button");

      // Clear any previous error messages
      utils.clearError(phoneError);
      const phone = phoneInput.value.trim();

      // Disable button to prevent double submission
      utils.toggleButton(button, true);

      try {
        // First, verify phone number is valid using Twilio Lookup
        const lookupData = await api.lookupPhone(phone);
        if (!lookupData.valid) {
          return utils.showError(phoneError, "Invalid phone number.");
        }

        // Phone is valid, send SMS verification code
        const data = await api.verifyPhone(phone);

        if (data.success) {
          // Save phone and proceed to SMS OTP verification step
          state.userPhone = phone;
          stepManager.show(utils.$(selectors.phoneOtpForm));
        } else {
          utils.showError(phoneError, data.error || "Failed to send OTP.");
        }
      } catch (err) {
        utils.showError(phoneError, "Network error.");
      } finally {
        // Re-enable button regardless of outcome
        utils.toggleButton(button, false);
      }
    },

    /**
     * STEP 2: Phone OTP Validation
     * Validates the 6-digit SMS code sent to user's phone
     */
    async handlePhoneOtpSubmit(e) {
      e.preventDefault();

      // Get form elements
      const otpInput = utils.$(selectors.phoneOtpInput);
      const otpError = utils.$(selectors.phoneOtpError);
      const button = e.target.querySelector("button");

      // Clear any previous error messages
      utils.clearError(otpError);
      const code = otpInput.value.trim();

      // Disable button to prevent double submission
      utils.toggleButton(button, true);

      try {
        // Validate SMS OTP with Twilio
        const data = await api.validatePhoneOtp(state.userPhone, code);

        if (data.valid) {
          // Phone verified successfully, show intermediate dashboard
          stepManager.show(utils.$(selectors.phoneVerifiedDashboard));
        } else {
          utils.showError(otpError, data.error || "Invalid code.");
        }
      } catch (err) {
        utils.showError(otpError, "Network error.");
      } finally {
        // Re-enable button regardless of outcome
        utils.toggleButton(button, false);
      }
    },

    /**
     * STEP 3: Verify Email Button Handler
     * Handles click on "Verify your email" button in intermediate dashboard
     */
    handleVerifyEmailClick() {
      // Show the email form when the user clicks "Verify your email"
      stepManager.show(utils.$(selectors.emailForm));
    },

    /**
     * STEP 4: Email Submission
     * Validates email input and sends verification code via Twilio
     */
    async handleEmailSubmit(e) {
      e.preventDefault();

      // Get form elements
      const emailInput = utils.$(selectors.emailInput);
      const emailError = utils.$(selectors.emailError);
      const button = e.target.querySelector("button");

      // Clear any previous error messages
      utils.clearError(emailError);
      const email = emailInput.value.trim();

      // Disable button to prevent double submission
      utils.toggleButton(button, true);

      try {
        // Send verification email via Twilio
        const data = await api.verifyEmail(email);

        if (data.success) {
          // Save email and proceed to OTP verification step
          state.userEmail = email;
          stepManager.show(utils.$(selectors.emailOtpForm));
        } else {
          utils.showError(emailError, data.error || "Failed to send OTP.");
        }
      } catch (err) {
        utils.showError(emailError, "Network error.");
      } finally {
        // Re-enable button regardless of outcome
        utils.toggleButton(button, false);
      }
    },

    /**
     * STEP 5: Email OTP Validation
     * Validates the 6-digit code sent to user's email
     */
    async handleEmailOtpSubmit(e) {
      e.preventDefault();

      // Get form elements
      const otpInput = utils.$(selectors.emailOtpInput);
      const otpError = utils.$(selectors.emailOtpError);
      const button = e.target.querySelector("button");

      // Clear any previous error messages
      utils.clearError(otpError);
      const code = otpInput.value.trim();

      // Disable button to prevent double submission
      utils.toggleButton(button, true);

      try {
        // Validate OTP with Twilio
        const data = await api.validateEmailOtp(state.userEmail, code);

        if (data.valid) {
          // Email verified successfully, onboarding complete!
          stepManager.show(utils.$(selectors.dashboard));
        } else {
          utils.showError(otpError, data.error || "Invalid code.");
        }
      } catch (err) {
        utils.showError(otpError, "Network error.");
      } finally {
        // Re-enable button regardless of outcome
        utils.toggleButton(button, false);
      }
    },
  };

  /* ===== APPLICATION INITIALIZATION ===== */

  /**
   * Initialize the onboarding flow application
   * This function sets up the entire application in the correct order:
   * 1. Initialize step management system
   * 2. Bind event handlers to forms
   */
  function init() {
    // Step 1: Initialize the step management system
    // This collects all form elements and prepares them for show/hide operations
    stepManager.init();

    // Step 2: Bind event handlers to each form and button
    // This connects user interactions to the appropriate handler functions
    utils.$(selectors.phoneForm).onsubmit = handlers.handlePhoneSubmit;
    utils.$(selectors.phoneOtpForm).onsubmit = handlers.handlePhoneOtpSubmit;
    utils.$(selectors.verifyEmailBtn).onclick = handlers.handleVerifyEmailClick;
    utils.$(selectors.emailForm).onsubmit = handlers.handleEmailSubmit;
    utils.$(selectors.emailOtpForm).onsubmit = handlers.handleEmailOtpSubmit;

    // Application is now ready for user interaction
    console.log("Onboarding flow initialized successfully");
  }

  /* ===== PUBLIC API ===== */

  // Export only the initialization function to keep internal implementation private
  return {
    init,
  };
})();

/* ===== APPLICATION BOOTSTRAP ===== */

// Initialize the application when the DOM is fully loaded
// This ensures all HTML elements are available before we try to access them
document.addEventListener("DOMContentLoaded", OnboardingFlow.init);
