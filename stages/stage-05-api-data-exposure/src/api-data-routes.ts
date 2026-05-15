import { findUserById, listAllUsers, toPublicUser, updateUserDirectly, updateUserWithAllowlist } from "./demo-data.js";
import { getCurrentSession } from "./session.js";
import type { DemoRequest, DemoResponse } from "./types.js";

export function getUserById(req: DemoRequest, res: DemoResponse): void {
  const user = findUserById(req.params.id);

  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  // Stage 05 intentionally vulnerable: excessive data exposure returns the full internal user object.
  // Sensitive fields such as passwordHash, refreshToken, internalMemo, and billingCustomerId leave the API.
  res.json({ user });
}

export function updateMe(req: DemoRequest, res: DemoResponse): void {
  const session = getCurrentSession(req);

  // Stage 05 intentionally vulnerable: direct request body update creates mass assignment.
  // A client can modify privileged fields like role, plan, credit, isAdmin, and emailVerified.
  const updatedUser = updateUserDirectly(session.user.id, req.body);

  res.json({ user: updatedUser });
}

export function adminExport(req: DemoRequest, res: DemoResponse): void {
  // Stage 05 intentionally vulnerable: admin export returns unfiltered internal records.
  const users = listAllUsers();

  res.json({ users });
}

export function updateMeSafely(req: DemoRequest, res: DemoResponse): void {
  const session = getCurrentSession(req);

  // Safe contrast: only allow explicitly editable profile fields from client input.
  const allowedChanges = {
    displayName: String(req.body.displayName ?? ""),
    portfolioTitle: String(req.body.portfolioTitle ?? "")
  };

  const updatedUser = updateUserWithAllowlist(session.user.id, allowedChanges);

  res.json({ user: updatedUser });
}

export function getUserByIdSafely(req: DemoRequest, res: DemoResponse): void {
  const user = findUserById(req.params.id);

  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  res.json({ user: toPublicUser(user) });
}

