import { findUserById } from "./demo-data.js";
import type { DemoRequest, DemoUser } from "./types.js";

export function getCurrentUser(req: DemoRequest): DemoUser {
  const requestedUserId = req.headers["x-demo-user-id"] ?? "alice";
  const user = findUserById(requestedUserId);

  if (!user) {
    throw new Error("missing deterministic demo user");
  }

  return user;
}

