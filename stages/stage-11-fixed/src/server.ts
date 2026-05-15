import {
  adminDashboard,
  createProjectRoute,
  generateAiDescription,
  getProjectDetail,
  getUserDetail,
  listMyProjects,
  loginAsDemoUser,
  renderPublicPortfolio,
  uploadProjectImage
} from "./routes.js";
import type { DemoRequest, DemoResponse, DemoResult } from "./types.js";

type Method = "GET" | "POST";
type Handler = (req: DemoRequest, res: DemoResponse) => void | Promise<void>;

type Route = {
  method: Method;
  path: string;
  handler: Handler;
};

export const routes: Route[] = [
  { method: "POST", path: "/api/login", handler: loginAsDemoUser },
  { method: "GET", path: "/api/projects", handler: listMyProjects },
  { method: "POST", path: "/api/projects", handler: createProjectRoute },
  { method: "GET", path: "/api/projects/:id", handler: getProjectDetail },
  { method: "POST", path: "/api/projects/:id/upload", handler: uploadProjectImage },
  { method: "POST", path: "/api/projects/:id/ai-description", handler: generateAiDescription },
  { method: "GET", path: "/portfolio/:slug", handler: renderPublicPortfolio },
  { method: "GET", path: "/api/admin/dashboard", handler: adminDashboard },
  { method: "GET", path: "/api/users/:id", handler: getUserDetail }
];

export async function handleRequest(
  method: Method,
  path: string,
  body: Record<string, unknown> = {},
  userId = "alice"
): Promise<DemoResult> {
  const match = matchRoute(method, path);

  if (!match) {
    return { statusCode: 404, body: { error: "route not found" } };
  }

  const result: DemoResult = { statusCode: 200, body: null };
  const res = createResponse(result);

  await match.route.handler(
    {
      params: match.params,
      body,
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

    if (route.path === "/api/projects/:id" && path.startsWith("/api/projects/") && !path.includes("/upload") && !path.includes("/ai-description")) {
      return { route, params: { id: path.replace("/api/projects/", "") } };
    }

    if (route.path === "/api/projects/:id/upload" && path.startsWith("/api/projects/") && path.endsWith("/upload")) {
      return { route, params: { id: path.replace("/api/projects/", "").replace("/upload", "") } };
    }

    if (route.path === "/api/projects/:id/ai-description" && path.startsWith("/api/projects/") && path.endsWith("/ai-description")) {
      return { route, params: { id: path.replace("/api/projects/", "").replace("/ai-description", "") } };
    }

    if (route.path === "/portfolio/:slug" && path.startsWith("/portfolio/")) {
      return { route, params: { slug: path.replace("/portfolio/", "") } };
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

