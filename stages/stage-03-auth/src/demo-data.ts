import type { DemoUser } from "./types.js";

export const demoUsers: DemoUser[] = [
  { id: "alice", email: "alice@example.test", role: "user" },
  { id: "bob", email: "bob@example.test", role: "user" },
  { id: "admin", email: "admin@example.test", role: "admin" }
];

export const demoPasswords: Record<string, string> = {
  "alice@example.test": "local-demo-alice-password",
  "bob@example.test": "local-demo-bob-password",
  "admin@example.test": "local-demo-admin-password"
};

export const fakeDecodedAdminToken = "fake-jwt-like-admin-token-for-training-only";
