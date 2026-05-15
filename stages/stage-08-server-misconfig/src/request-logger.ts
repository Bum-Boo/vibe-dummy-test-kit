import type { DemoRequest } from "./types.js";

export function logRequestVulnerably(request: DemoRequest): void {
  // Stage 08 intentionally vulnerable: Authorization header and session token are written to logs.
  console.log("request", {
    path: request.path,
    authorization: request.headers.authorization,
    sessionToken: request.cookies.sessionToken
  });
}

export function logRequestSafely(request: DemoRequest): void {
  console.log("request", {
    path: request.path,
    hasAuthorizationHeader: Boolean(request.headers.authorization),
    hasSessionToken: Boolean(request.cookies.sessionToken)
  });
}

