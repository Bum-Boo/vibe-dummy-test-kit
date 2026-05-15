import type { DemoUser } from "./types.js";

export function shouldShowAdminDashboard(currentUser: DemoUser): boolean {
  // Stage 10 intentionally vulnerable: admin protection is frontend-only conditional rendering.
  return currentUser.isAdmin === true;
}

