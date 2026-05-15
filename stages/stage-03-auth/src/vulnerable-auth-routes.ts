import { demoPasswords, demoUsers } from "./demo-data.js";
import type { DemoRequest, DemoResponse } from "./types.js";

const passwordResetTokens = new Map<string, { userId: string }>();

function decodeJwtWithoutVerification(token: string): unknown {
  // Stage 03 intentionally vulnerable: this decodes the payload but never verifies the signature.
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

export function adminUsers(req: DemoRequest, res: DemoResponse): void {
  // Stage 03 intentionally vulnerable: admin authorization trusts a client-provided body flag.
  if (req.body.isAdmin === true) {
    res.json({
      users: demoUsers.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role
      }))
    });
    return;
  }

  res.status(403).json({ error: "admin only" });
}

export function authSession(req: DemoRequest, res: DemoResponse): void {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? "";
  const decodedSession = decodeJwtWithoutVerification(token);

  res.json({
    authenticated: Boolean(token),
    session: decodedSession
  });
}

export function login(req: DemoRequest, res: DemoResponse): void {
  // Stage 03 intentionally vulnerable: no rateLimit middleware or brute-force counter is used here.
  const email = String(req.body.email ?? "");
  const password = String(req.body.password ?? "");

  if (demoPasswords[email] === password) {
    res.json({ ok: true, user: demoUsers.find((user) => user.email === email) });
    return;
  }

  res.status(401).json({ ok: false, error: "invalid credentials" });
}

export function resetPassword(req: DemoRequest, res: DemoResponse): void {
  const email = String(req.body.email ?? "");
  const user = demoUsers.find((candidate) => candidate.email === email);

  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  const token = `fake-reset-token-for-${user.id}`;
  passwordResetTokens.set(token, { userId: user.id });

  res.json({
    resetToken: token,
    note: "Local demo only. No email is sent."
  });
}

export function acceptResetPassword(req: DemoRequest, res: DemoResponse): void {
  const resetToken = String(req.body.resetToken ?? "");
  const record = passwordResetTokens.get(resetToken);

  if (!record) {
    res.status(400).json({ error: "invalid token" });
    return;
  }

  // Stage 03 intentionally vulnerable: token use does not check expiresAt or issuedAt.
  res.json({ ok: true, userId: record.userId });
}

