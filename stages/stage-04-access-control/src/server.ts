import { deleteProject, getMyProjects, getOrderById, getProjectById } from "./access-control-routes.js";
import type { DemoRequest, DemoResponse, DemoResult } from "./types.js";

type Method = "GET" | "DELETE";
type Handler = (req: DemoRequest, res: DemoResponse) => void;

type Route = {
  method: Method;
  path: string;
  handler: Handler;
};

export const routes: Route[] = [
  { method: "GET", path: "/api/projects/:id", handler: getProjectById },
  { method: "GET", path: "/api/orders/:id", handler: getOrderById },
  { method: "DELETE", path: "/api/projects/:id", handler: deleteProject },
  { method: "GET", path: "/api/my/projects", handler: getMyProjects }
];

export function handleRequest(method: Method, path: string, userId = "alice"): DemoResult {
  const match = matchRoute(method, path);

  if (!match) {
    return { statusCode: 404, body: { error: "route not found" } };
  }

  const result: DemoResult = { statusCode: 200, body: null };
  const res = createResponse(result);

  match.route.handler(
    {
      params: match.params,
      headers: { "x-demo-user-id": userId }
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

    if (route.path === "/api/projects/:id" && path.startsWith("/api/projects/")) {
      return { route, params: { id: path.replace("/api/projects/", "") } };
    }

    if (route.path === "/api/orders/:id" && path.startsWith("/api/orders/")) {
      return { route, params: { id: path.replace("/api/orders/", "") } };
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
      result.body = body;
    }
  };

  return response;
}

