// Stage 01 intentionally vulnerable fixture.
// FAKE TRAINING VALUES ONLY: this mimics a privileged key exposed to frontend code.

export const supabaseConfig = {
  url: "http://localhost:54321",
  anonKey: "fake_anon_key_for_training_only",
  serviceRoleKey: "fake_service_role_key_for_training_only",
  publicEnvName: "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
};

export function explainWhyThisIsBadForTraining() {
  return "A service-role-like key must never be bundled into frontend-accessible code.";
}

