import {
  acceptResetPassword,
  adminUsers,
  authSession,
  login,
  resetPassword
} from "./vulnerable-auth-routes.js";

export const routes = [
  { method: "POST", path: "/api/admin/users", handler: adminUsers },
  { method: "GET", path: "/api/auth/session", handler: authSession },
  { method: "POST", path: "/api/auth/login", handler: login },
  { method: "POST", path: "/api/auth/reset-password", handler: resetPassword },
  { method: "POST", path: "/api/auth/reset-password/accept", handler: acceptResetPassword }
];

