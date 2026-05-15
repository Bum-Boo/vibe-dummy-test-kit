// Stage 02 intentionally vulnerable fixture.
// FAKE TRAINING VALUES ONLY: these values look privileged but are placed in frontend-accessible config.

export const config = {
  adminApiKey: process.env.NEXT_PUBLIC_ADMIN_API_KEY,
  internalApiUrl: process.env.NEXT_PUBLIC_INTERNAL_API_URL,
  debugToken: process.env.REACT_APP_DEBUG_TOKEN,
  viteBackendAdminToken: import.meta.env?.VITE_BACKEND_ADMIN_TOKEN
};

export const publicRuntimeConfig = {
  featureFlags: {
    aiProfileDrafts: true,
    publicPortfolioPreview: true
  },
  privilegedValuesThatShouldBeServerSide: {
    adminApiKey: "fake_public_admin_api_key_for_config_training_only",
    internalApiUrl: "http://localhost:4000/internal/admin",
    debugToken: "fake_react_debug_token_for_training_only"
  }
};
