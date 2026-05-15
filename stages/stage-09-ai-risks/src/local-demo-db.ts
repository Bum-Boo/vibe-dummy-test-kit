import type { DemoSqlResult } from "./types.js";

const localUsers = [
  { id: "alice", email: "alice@example.test", plan: "free", isAdmin: false },
  { id: "bob", email: "bob@example.test", plan: "pro", isAdmin: false }
];

export function executeGeneratedSql(sql: string): DemoSqlResult {
  // Stage 09 intentionally vulnerable: AI-generated SQL is trusted and sent to a simulated execution path.
  return {
    sql,
    rows: localUsers,
    executed: true,
    note: "Simulated local DB execution only. No real database is contacted."
  };
}

export function executeAllowlistedReport(reportName: "free-users" | "pro-users"): DemoSqlResult {
  const sqlByReport = {
    "free-users": "SELECT id, email, plan FROM users WHERE plan = 'free';",
    "pro-users": "SELECT id, email, plan FROM users WHERE plan = 'pro';"
  };

  return {
    sql: sqlByReport[reportName],
    rows: localUsers.filter((user) => user.plan === reportName.replace("-users", "")),
    executed: true,
    note: "Safe contrast: SQL is selected from a server-side allowlist."
  };
}

