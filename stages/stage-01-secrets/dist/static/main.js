// Stage 01 intentionally vulnerable build artifact fixture.
// FAKE TRAINING VALUES ONLY: this file simulates a static bundle containing a leaked key.
window.__STAGE_01_PUBLIC_CONFIG__ = {
  supabaseServiceRoleKey: "fake_service_role_key_for_training_only",
  openAiApiKey: "fake_openai_key_for_training_only"
};

