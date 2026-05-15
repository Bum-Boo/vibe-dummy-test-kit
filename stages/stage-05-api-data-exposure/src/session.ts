import { findUserById } from "./demo-data.js";
import type { DemoRequest, DemoUser } from "./types.js";

export type DemoSession = {
  user: Pick<DemoUser, "id" | "email">;
};

export function getCurrentSession(req: DemoRequest): DemoSession {
  const requestedUserId = req.headers["x-demo-user-id"] ?? "alice";
  const user = findUserById(requestedUserId) ?? findUserById("alice");

  if (!user) {
    throw new Error("missing deterministic demo user");
  }

  return {
    user: {
      id: user.id,
      email: user.email
    }
  };
}

