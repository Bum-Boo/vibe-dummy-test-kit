import { resetDemoData } from "./demo-data.js";
import { handleRequest } from "./server.js";

resetDemoData();
const exposedUserDetail = handleRequest("GET", "/api/users/alice");

resetDemoData();
const massAssignmentUpdate = handleRequest(
  "PATCH",
  "/api/users/me",
  {
    displayName: "Alice Updated",
    role: "admin",
    plan: "enterprise",
    credit: 999999,
    isAdmin: true,
    emailVerified: true
  },
  "alice"
);

resetDemoData();
const safeUpdate = handleRequest(
  "PATCH",
  "/api/users/me/safe",
  {
    displayName: "Alice Safe Update",
    portfolioTitle: "Safe Portfolio Title",
    role: "admin",
    isAdmin: true
  },
  "alice"
);

console.log(
  JSON.stringify(
    {
      exposedUserDetail,
      massAssignmentUpdate,
      safeUpdate
    },
    null,
    2
  )
);
