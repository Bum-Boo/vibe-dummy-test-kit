import {
  createProject,
  findProjectByIdForAdmin,
  findProjectByIdForUser,
  findProjectBySlug,
  findUserById,
  listProjectsByOwner,
  listPublicUsers,
  toPublicUser,
  updateProjectAiTextForUser,
  updateProjectImageForUser
} from "./demo-data.js";
import { canUseAi } from "./limits.js";
import { escapeHtml, generatePortfolioTextFromAi } from "./mock-ai.js";
import { getCurrentUser, requireAdmin } from "./session.js";
import { storeUploadPrivately } from "./uploads.js";
import type { DemoRequest, DemoResponse, UploadedFile } from "./types.js";

export function loginAsDemoUser(req: DemoRequest, res: DemoResponse): void {
  const user = findUserById(String(req.body.userId ?? "alice"));

  if (!user) {
    res.status(404).json({ error: "demo user not found" });
    return;
  }

  res.json({ user: toPublicUser(user) });
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
  const user = getCurrentUser(req);
  const project =
    user.role === "admin" ? findProjectByIdForAdmin(req.params.id) : findProjectByIdForUser(req.params.id, user.id);

  if (!project) {
    res.status(404).json({ error: "project not found" });
    return;
  }

  res.json({ project });
}

export async function uploadProjectImage(req: DemoRequest, res: DemoResponse): Promise<void> {
  const user = getCurrentUser(req);
  const project = findProjectByIdForUser(req.params.id, user.id);

  if (!project) {
    res.status(404).json({ error: "project not found" });
    return;
  }

  const file = req.body.file;

  if (!isUploadedFile(file)) {
    res.status(400).json({ error: "missing file" });
    return;
  }

  const storedObject = await storeUploadPrivately(file);
  const updatedProject = updateProjectImageForUser(project.id, user.id, storedObject.objectKey);

  res.json({ project: updatedProject, upload: storedObject });
}

export function generateAiDescription(req: DemoRequest, res: DemoResponse): void {
  const user = getCurrentUser(req);
  const project = findProjectByIdForUser(req.params.id, user.id);

  if (!project) {
    res.status(404).json({ error: "project not found" });
    return;
  }

  if (!canUseAi(user.id)) {
    res.status(429).json({ error: "AI rate limit reached" });
    return;
  }

  const aiDescriptionText = generatePortfolioTextFromAi(String(req.body.prompt ?? ""));
  const updatedProject = updateProjectAiTextForUser(project.id, user.id, aiDescriptionText);

  res.json({ project: updatedProject, aiDescriptionText });
}

export function renderPublicPortfolio(req: DemoRequest, res: DemoResponse): void {
  const project = findProjectBySlug(req.params.slug);

  if (!project) {
    res.status(404).json({ error: "portfolio not found" });
    return;
  }

  const html = `<main><h1>${escapeHtml(project.title)}</h1><p>${escapeHtml(project.aiDescriptionText)}</p></main>`;
  res.json({ html });
}

export function adminDashboard(req: DemoRequest, res: DemoResponse): void {
  const admin = requireAdmin(req);

  if (!admin) {
    res.status(403).json({ error: "admin only" });
    return;
  }

  res.json({
    currentAdmin: toPublicUser(admin),
    users: listPublicUsers(),
    billingSummary: {
      visibleFields: ["id", "email", "plan", "billingStatus"],
      rawBillingCustomerIdsReturned: false
    }
  });
}

export function getUserDetail(req: DemoRequest, res: DemoResponse): void {
  const currentUser = getCurrentUser(req);
  const requestedUser = findUserById(req.params.id);

  if (!requestedUser || (currentUser.role !== "admin" && currentUser.id !== requestedUser.id)) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  res.json({ user: toPublicUser(requestedUser) });
}

function isUploadedFile(value: unknown): value is UploadedFile {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "type" in value &&
    "size" in value &&
    "arrayBuffer" in value
  );
}

