import type { DemoRequest, DemoResponse } from "./types.js";

type Next = () => void;

export function pageOnlyAuthMiddleware(req: DemoRequest, res: DemoResponse, next: Next): void {
  // Stage 03 intentionally vulnerable: this protects UI pages but forgets API routes.
  if (req.path.startsWith("/dashboard") || req.path.startsWith("/admin")) {
    const demoSession = req.headers["x-demo-session"];

    if (!demoSession) {
      res.status(401).json({ error: "missing demo session" });
      return;
    }
  }

  // Intentionally missing: /api routes are not checked here.
  next();
}

