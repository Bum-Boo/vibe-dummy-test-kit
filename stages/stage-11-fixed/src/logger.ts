import type { DemoRequest } from "./types.js";

export function logRequestSafely(req: DemoRequest): Record<string, string | boolean | undefined> {
  return {
    path: req.params.path,
    user: req.headers["x-demo-user-id"],
    hasAuthorizationHeader: Boolean(req.headers.authorization)
  };
}

