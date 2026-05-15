// Stage 10 intentionally vulnerable: privileged-looking value is browser-accessible.
// FAKE TRAINING VALUE ONLY. Do not replace this with a real service key.
export const NEXT_PUBLIC_PORTFOLIO_SERVICE_ROLE_KEY = "fake_public_service_role_key_for_chain_training_only";

export const browserConfig = {
  appName: "AI Portfolio Builder",
  publicApiBaseUrl: "http://localhost:8080/api",
  serviceRoleKey: NEXT_PUBLIC_PORTFOLIO_SERVICE_ROLE_KEY
};
