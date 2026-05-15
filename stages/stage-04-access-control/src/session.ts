import { demoUsers } from "./demo-data.js";
import type { DemoRequest, DemoUser } from "./types.js";

export type DemoSession = {
  user: DemoUser;
};

export function getCurrentSession(req: DemoRequest): DemoSession {
  const requestedUserId = req.headers["x-demo-user-id"] ?? "alice";
  const user = demoUsers.find((candidate) => candidate.id === requestedUserId) ?? demoUsers[0];

  return { user };
}

