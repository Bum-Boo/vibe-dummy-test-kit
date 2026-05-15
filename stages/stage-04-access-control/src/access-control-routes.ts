import { deleteProjectById, findOrderById, findProjectById, findProjectsByOwnerId } from "./demo-data.js";
import { getCurrentSession } from "./session.js";
import type { DemoRequest, DemoResponse } from "./types.js";

export function getProjectById(req: DemoRequest, res: DemoResponse): void {
  const id = req.params.id;

  // Stage 04 intentionally vulnerable: object-level authorization is missing.
  // The query uses only the route parameter ID and does not constrain by ownerId, userId, or orgId.
  const project = findProjectById(id);

  if (!project) {
    res.status(404).json({ error: "project not found" });
    return;
  }

  res.json({ project });
}

export function getOrderById(req: DemoRequest, res: DemoResponse): void {
  const id = req.params.id;

  // Stage 04 intentionally vulnerable: login alone is treated as enough.
  // The order lookup uses only id, so Alice can request Bob's order ID.
  const order = findOrderById(id);

  if (!order) {
    res.status(404).json({ error: "order not found" });
    return;
  }

  res.json({ order });
}

export function deleteProject(req: DemoRequest, res: DemoResponse): void {
  const id = req.params.id;

  // Stage 04 intentionally vulnerable: destructive action uses only params.id.
  // There is no ownership check such as ownerId: session.user.id.
  const deletedProject = deleteProjectById(id);

  if (!deletedProject) {
    res.status(404).json({ error: "project not found" });
    return;
  }

  res.json({ deletedProject });
}

export function getMyProjects(req: DemoRequest, res: DemoResponse): void {
  const session = getCurrentSession(req);

  // Safe contrast: this query includes the trusted server-side user ID.
  const projects = findProjectsByOwnerId(session.user.id);

  res.json({ projects });
}

