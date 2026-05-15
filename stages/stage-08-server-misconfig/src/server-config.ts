import type { DemoRequest, DemoResponse } from "./types.js";

export const sensitiveApiRoutes = ["/api/admin/export", "/api/debug/session"];

export const corsForSensitiveApiRoutes = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"]
};

const fakeDebugState = {
  environment: "local-training",
  debugToken: "fake_debug_token_for_training_only",
  featureFlags: ["verbose-errors", "sql-timing"]
};

export function debugSessionEndpoint(req: DemoRequest, res: DemoResponse): void {
  // Stage 08 intentionally vulnerable: debug endpoint is exposed to local callers.
  res.json({
    route: "/api/debug/session",
    requestPath: req.path,
    debug: fakeDebugState,
    headers: req.headers
  });
}

