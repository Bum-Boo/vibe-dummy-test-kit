CREATE SCHEMA IF NOT EXISTS lab;

CREATE TABLE IF NOT EXISTS lab.stage_catalog (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  focus TEXT NOT NULL,
  implementation_status TEXT NOT NULL
);

INSERT INTO lab.stage_catalog (id, title, focus, implementation_status)
VALUES
  ('stage-00-clean', 'Clean baseline', 'Clean control stage for scanner and harness validation', 'scaffold-only'),
  ('stage-01-secrets', 'Secrets', 'Fake local secret handling mistakes', 'planned'),
  ('stage-02-frontend-config', 'Frontend config', 'Browser-visible configuration mistakes', 'planned'),
  ('stage-03-auth', 'Auth', 'Simple authentication mistakes', 'planned'),
  ('stage-04-access-control', 'Access control', 'Object-level authorization mistakes', 'planned'),
  ('stage-05-api-data-exposure', 'API data exposure', 'Overly broad API responses', 'planned'),
  ('stage-06-user-content-xss', 'User content XSS', 'Unsafe user content rendering', 'planned'),
  ('stage-07-file-upload', 'File upload', 'Upload and local object storage mistakes', 'planned'),
  ('stage-08-server-misconfig', 'Server misconfig', 'Local reverse proxy and header mistakes', 'planned'),
  ('stage-09-ai-risks', 'AI risks', 'Mock-LLM prompt and data handling mistakes', 'planned'),
  ('stage-10-chained-saas', 'Chained SaaS', 'Combined realistic local SaaS scenario', 'planned'),
  ('stage-11-fixed', 'Fixed examples', 'Fixed examples that preserve functionality', 'planned')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  focus = EXCLUDED.focus,
  implementation_status = EXCLUDED.implementation_status;
