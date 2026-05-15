import { adminExport, getUserById, getUserByIdSafely, updateMe, updateMeSafely } from "./api-data-routes.js";
import type { DemoRequest, DemoResponse, DemoResult } from "./types.js";

type Method = "GET" | "PATCH";
type Handler = (req: DemoRequest, res: DemoResponse) => void;

type Route = {
  method: Method;
  path: string;
  handler: Handler;
};

export const routes: Route[] = [
  { method: "PATCH", path: "/api/users/me", handler: updateMe },
  { method: "GET", path: "/api/admin/export", handler: adminExport },
  { method: "GET", path: "/api/users/:id/safe", handler: getUserByIdSafely },
  { method: "GET", path: "/api/users/:id", handler: getUserById },
  { method: "PATCH", path: "/api/users/me/safe", handler: updateMeSafely }
];

export function handleRequest(
  method: Method,
  path: string,
  body: Record<string, unknown> = {},
  userId = "alice"
): DemoResult {
  const match = matchRoute(method, path);

  if (!match) {
    return { statusCode: 404, body: { error: "route not found" } };
  }

  const result: DemoResult = { statusCode: 200, body: null };
  const res = createResponse(result);

  match.route.handler(
    {
      params: match.params,
      headers: { "x-demo-user-id": userId },
      body
    },
    res
  );

  return result;
}

function matchRoute(method: Method, path: string): { route: Route; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }

    if (route.path === path) {
      return { route, params: {} };
    }

    if (route.path === "/api/users/:id/safe" && path.startsWith("/api/users/") && path.endsWith("/safe")) {
      return { route, params: { id: path.replace("/api/users/", "").replace("/safe", "") } };
    }

    if (route.path === "/api/users/:id" && path.startsWith("/api/users/")) {
      return { route, params: { id: path.replace("/api/users/", "") } };
    }
  }

  return null;
}

function createResponse(result: DemoResult): DemoResponse {
  const response = {
    status(code: number): DemoResponse {
      result.statusCode = code;
      return response;
    },
    json(body: unknown): void {
      result.body = structuredClone(body);
    }
  };

  return response;
}
