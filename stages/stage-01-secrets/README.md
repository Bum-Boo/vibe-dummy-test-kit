# Stage 01: Exposed Secrets

This stage intentionally exposes fake training secrets in common places where beginner projects accidentally leak credentials.

All values in this directory are fake and local-only. They are deliberately easy to find manually and are meant to validate BTS_sec secret-detection behavior.

## Intentional Findings

- `SECRET-001`: service-role-like key in frontend-accessible code.
- `SECRET-002`: secret-like value in this README.
- `SECRET-003`: secret-like value in a CI workflow.
- `SECRET-004`: secret-like value in built static JavaScript.
- `SECRET-005`: database URL in config.

## Manual Locations

- `.env.local`: `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=fake_service_role_key_for_training_only`
- `README.md`: `STRIPE_SECRET_KEY=fake_stripe_secret_for_training_only`
- `src/lib/supabase.ts`: `fake_service_role_key_for_training_only`
- `docker-compose.yml`: `DATABASE_URL=postgres://fake_user:fake_password@localhost:5432/fake_db`
- `.github/workflows/deploy.yml`: `OPENAI_API_KEY=fake_openai_key_for_training_only`
- `dist/static/main.js`: `fake_service_role_key_for_training_only`

## Safety

Do not replace these values with real secrets. Do not connect this stage to real Supabase, Stripe, OpenAI, Postgres, or cloud services.

