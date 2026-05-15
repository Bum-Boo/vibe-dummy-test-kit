import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config, publicConfig } from "./config.js";
import {
  adminSummary,
  canReadProject,
  createProject,
  findProject,
  findPublicProject,
  generateProfileText,
  listProjectsForUser,
  listUsers,
  markUploadPlaceholder,
  validateUploadStub,
  type PortfolioProject
} from "./demoData.js";
import { currentUserFromRequest, requireDemoUser } from "./session.js";
import { stages } from "./stages.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3100", "http://localhost:8080"]
  })
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "bts-sec-target-api",
    mode: "local-only",
    config: publicConfig()
  });
});

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "bts-sec-target-api",
    mode: "local-only"
  });
});

app.get("/api/stages", (_request, response) => {
  response.json({ stages });
});

app.get("/api/stages/:id", (request, response) => {
  const stage = stages.find((item) => item.id === request.params.id);

  if (!stage) {
    response.status(404).json({ error: "stage_not_found" });
    return;
  }

  response.json({ stage });
});

app.get("/api/demo-users", (_request, response) => {
  response.json({ users: listUsers() });
});

app.get("/api/session", (request, response) => {
  const user = currentUserFromRequest(request);

  response.json({ user: user ?? null });
});

app.get("/api/projects", (request, response) => {
  const user = requireDemoUser(request, response);

  if (!user) {
    return;
  }

  response.json({
    currentUser: user,
    projects: listProjectsForUser(user)
  });
});

app.post("/api/projects", (request, response) => {
  const user = requireDemoUser(request, response);

  if (!user) {
    return;
  }

  const title = readString(request.body?.title, "Untitled Portfolio");
  const summary = readString(request.body?.summary, "A local demo portfolio project.");
  const theme = readTheme(request.body?.theme);
  const isPublic = Boolean(request.body?.isPublic);

  const project = createProject({
    owner: user,
    title,
    summary,
    theme,
    isPublic
  });

  response.status(201).json({ project });
});

app.get("/api/projects/:id", (request, response) => {
  const user = requireDemoUser(request, response);

  if (!user) {
    return;
  }

  const project = findProject(request.params.id);

  if (!project) {
    response.status(404).json({ error: "project_not_found" });
    return;
  }

  // Security check: project detail is returned only to the owner or an admin.
  if (!canReadProject(user, project)) {
    response.status(403).json({ error: "project_forbidden" });
    return;
  }

  response.json({ currentUser: user, project });
});

app.post("/api/projects/:id/upload-placeholder", (request, response) => {
  const user = requireDemoUser(request, response);

  if (!user) {
    return;
  }

  const project = findProject(request.params.id);

  if (!project) {
    response.status(404).json({ error: "project_not_found" });
    return;
  }

  // Security check: upload placeholders still require project ownership.
  if (!canReadProject(user, project)) {
    response.status(403).json({ error: "project_forbidden" });
    return;
  }

  const uploadCandidate = {
    filename: readString(request.body?.filename, ""),
    mimeType: readString(request.body?.mimeType, ""),
    sizeBytes: Number(request.body?.sizeBytes)
  };
  const validationErrors = validateUploadStub(uploadCandidate);

  if (validationErrors.length > 0) {
    response.status(400).json({ error: "upload_validation_failed", validationErrors });
    return;
  }

  // Security check: Stage 00 validates metadata but still does not store arbitrary files.
  // Future file-upload stages can replace this stub with local-only upload demos.
  response.json({ project: markUploadPlaceholder(project), message: "Local upload placeholder recorded." });
});

app.post("/api/projects/:id/generate-profile", (request, response) => {
  const user = requireDemoUser(request, response);

  if (!user) {
    return;
  }

  const project = findProject(request.params.id);

  if (!project) {
    response.status(404).json({ error: "project_not_found" });
    return;
  }

  // Security check: local AI text generation still requires project ownership.
  if (!canReadProject(user, project)) {
    response.status(403).json({ error: "project_forbidden" });
    return;
  }

  // Security check: this deterministic placeholder never calls a real AI API.
  response.json({ project: generateProfileText(project, user), message: "Local mock profile text generated." });
});

app.get("/api/portfolio/:slug", (request, response) => {
  const project = findPublicProject(request.params.slug);

  if (!project) {
    response.status(404).json({ error: "public_portfolio_not_found" });
    return;
  }

  response.json({ project });
});

app.get("/api/admin", (request, response) => {
  const user = requireDemoUser(request, response);

  if (!user) {
    return;
  }

  // Security check: admin data is only returned to the deterministic Admin demo user.
  if (user.role !== "admin") {
    response.status(403).json({ error: "admin_required" });
    return;
  }

  response.json({ currentUser: user, summary: adminSummary() });
});

app.listen(config.port, () => {
  console.log(`BTS_sec target API listening on http://localhost:${config.port}`);
});

function readString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function readTheme(value: unknown): PortfolioProject["theme"] {
  return value === "bold" || value === "editorial" || value === "minimal" ? value : "minimal";
}
