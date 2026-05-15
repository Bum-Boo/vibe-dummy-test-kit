import type { Request, Response } from "express";
import { findUser, type DemoUser } from "./demoData.js";

export function currentUserFromRequest(request: Request): DemoUser | undefined {
  const queryUser = typeof request.query.userId === "string" ? request.query.userId : undefined;
  const headerUser = typeof request.headers["x-demo-user-id"] === "string" ? request.headers["x-demo-user-id"] : undefined;

  // Security check: this is an explicit local session simulation.
  // Future vulnerable stages may weaken this, but the baseline requires a known demo user.
  return findUser(queryUser ?? headerUser);
}

export function requireDemoUser(request: Request, response: Response): DemoUser | undefined {
  const user = currentUserFromRequest(request);

  if (!user) {
    response.status(401).json({
      error: "demo_user_required",
      message: "Pass ?userId=alice, ?userId=bob, or ?userId=admin for the local session simulation."
    });
    return undefined;
  }

  return user;
}

