import {
  createProject,
  findProjectById,
  findProjectBySlug,
  findUserById,
  listProjectsByOwner,
  listUsers,
  updateProjectAiDescription,
  updateProjectImage
} from "./demo-data.js";
import { generatePortfolioHtmlFromAi } from "./mock-ai.js";
import { getCurrentUser } from "./session.js";
import { storeUploadPublicly } from "./uploads.js";
import type { DemoRequest, DemoResponse } from "./types.js";

export function loginAsDemoUser(req: DemoRequest, res: DemoResponse): void {
  const user = findUserById(String(req.body.userId ?? "alice"));

  if (!user) {
    res.status(404).json({ error: "demo user not found" });
    return;
  }

  res.json({ userId: user.id, displayName: user.displayName, role: user.role });
}

export function listMyProjects(req: DemoRequest, res: DemoResponse): void {
  const user = getCurrentUser(req);
  res.json({ projects: listProjectsByOwner(user.id) });
}

export function createProjectRoute(req: DemoRequest, res: DemoResponse): void {
  const user = getCurrentUser(req);
  const project = createProject(user.id, String(req.body.title ?? "Untitled Portfolio"));
  res.json({ project });
}

export function getProjectDetail(req: DemoRequest, res: DemoResponse): void {
  const id = req.params.id;

  // Stage 10 intentionally vulnerable: project detail query uses only id and misses ownerId/orgId check.
  const project = findProjectById(id);

  if (!project) {
    res.status(404).json({ error: "project not found" });
    return;
  }

  res.json({ project });
}

export async function uploadProjectImage(req: DemoRequest, res: DemoResponse): Promise<void> {
  const projectId = String(req.body.projectId ?? "");
  const file = req.body.file;

  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
    res.status(400).json({ error: "missing file" });
    return;
  }

  const imageUrl = await storeUploadPublicly(file as never);
  const project = updateProjectImage(projectId, imageUrl);

  res.json({ project, imageUrl });
}

export function generateAiDescription(req: DemoRequest, res: DemoResponse): void {
  const projectId = String(req.body.projectId ?? "");
  const prompt = String(req.body.prompt ?? "");
  const aiGeneratedHtml = generatePortfolioHtmlFromAi(prompt);
  const project = updateProjectAiDescription(projectId, aiGeneratedHtml);

  res.json({ project, aiGeneratedHtml });
}

export function renderPublicPortfolio(req: DemoRequest, res: DemoResponse): void {
  const project = findProjectBySlug(req.params.slug);

  if (!project) {
    res.status(404).json({ error: "portfolio not found" });
    return;
  }

  // Stage 10 intentionally vulnerable: AI-generated HTML is rendered as trusted HTML.
  const html = `<main><h1>${project.title}</h1>${project.aiDescriptionHtml}</main>`;
  res.json({ html });
}

export function adminDashboard(req: DemoRequest, res: DemoResponse): void {
  // Stage 10 intentionally vulnerable: API trusts a client-provided admin role flag.
  if (req.body.isAdmin === true) {
    res.json({
      users: listUsers(),
      totalProjectsVisibleToAdmin: 2
    });
    return;
  }

  res.status(403).json({ error: "admin only" });
}

export function getUserDetail(req: DemoRequest, res: DemoResponse): void {
  const user = findUserById(req.params.id);

  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  // Stage 10 intentionally vulnerable: excessive user data is returned to the API caller.
  res.json({ user });
}

