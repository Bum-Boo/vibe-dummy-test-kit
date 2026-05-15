STAGE ?= stage-00-clean
SAFETY_MESSAGE = SAFETY: Local-only lab. Do not scan external targets or deploy vulnerable stages.

.PHONY: help setup dashboard up down reset reset-uploads logs ps scan scan-all compare score score-json typecheck

help:
	@echo "BTS_sec Staircase Lab commands:"
	@echo "$(SAFETY_MESSAGE)"
	@echo "  make setup              Install pnpm workspace dependencies"
	@echo "  make dashboard          Start the local learner dashboard"
	@echo "  make up                 Start local Docker Compose infra"
	@echo "  make down               Stop local Docker Compose infra"
	@echo "  make reset              Clear local uploads, reset Docker volumes, and restart"
	@echo "  make reset-uploads      Clear local Stage 07 upload directories"
	@echo "  make logs               Tail Docker Compose service logs"
	@echo "  make ps                 Show Docker Compose service status"
	@echo "  make scan STAGE=<id>    Run BTS_sec for a stage, e.g. STAGE=04"
	@echo "  make scan-all           Run BTS_sec for all known local stages"
	@echo "  make compare STAGE=<id> Compare generated report with expected findings"
	@echo "  make score              Summarize comparison status"
	@echo "  make score-json         Print comparison scorecard as JSON"
	@echo "  make typecheck          Run TypeScript checks"

setup:
	@echo "$(SAFETY_MESSAGE)"
	pnpm install

dashboard:
	@echo "$(SAFETY_MESSAGE)"
	pnpm dashboard

up:
	@echo "$(SAFETY_MESSAGE)"
	docker compose up -d

down:
	docker compose down

reset:
	@echo "$(SAFETY_MESSAGE)"
	pnpm exec tsx scripts/reset-uploads.ts
	docker compose down -v
	docker compose up -d

reset-uploads:
	pnpm exec tsx scripts/reset-uploads.ts

logs:
	docker compose logs -f

ps:
	docker compose ps

scan:
	@echo "$(SAFETY_MESSAGE)"
	pnpm run-scan -- --stage $(STAGE)

scan-all:
	@echo "$(SAFETY_MESSAGE)"
	pnpm run-all-scans

compare:
	pnpm compare -- --stage $(STAGE)

score:
	pnpm score

score-json:
	pnpm score-json

typecheck:
	pnpm typecheck
