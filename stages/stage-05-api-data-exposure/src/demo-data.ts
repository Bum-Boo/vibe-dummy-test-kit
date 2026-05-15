import type { DemoUser, PublicUserProfile } from "./types.js";

// FAKE TRAINING VALUES ONLY: hashes, tokens, memos, and billing IDs are local fixtures.
const seedUsers: DemoUser[] = [
  {
    id: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    portfolioTitle: "Alice AI Portfolio",
    role: "user",
    plan: "free",
    credit: 100,
    isAdmin: false,
    emailVerified: true,
    passwordHash: "fake_password_hash_for_training_only_alice",
    refreshToken: "fake_refresh_token_for_training_only_alice",
    internalMemo: "Alice is a deterministic local demo user.",
    billingCustomerId: "cus_fake_alice_training_only"
  },
  {
    id: "bob",
    email: "bob@example.test",
    displayName: "Bob",
    portfolioTitle: "Bob Private Portfolio",
    role: "user",
    plan: "pro",
    credit: 500,
    isAdmin: false,
    emailVerified: false,
    passwordHash: "fake_password_hash_for_training_only_bob",
    refreshToken: "fake_refresh_token_for_training_only_bob",
    internalMemo: "Bob's memo should never be returned to normal clients.",
    billingCustomerId: "cus_fake_bob_training_only"
  }
];

let users = seedUsers.map((user) => ({ ...user }));

export function resetDemoData(): void {
  users = seedUsers.map((user) => ({ ...user }));
}

export function findUserById(id: string): DemoUser | null {
  return users.find((user) => user.id === id) ?? null;
}

export function listAllUsers(): DemoUser[] {
  return users.map((user) => ({ ...user }));
}

export function updateUserDirectly(id: DemoUser["id"], changes: Partial<DemoUser>): DemoUser | null {
  const user = findUserById(id);

  if (!user) {
    return null;
  }

  Object.assign(user, changes);
  return user;
}

export function updateUserWithAllowlist(
  id: DemoUser["id"],
  changes: Pick<PublicUserProfile, "displayName" | "portfolioTitle">
): PublicUserProfile | null {
  const user = findUserById(id);

  if (!user) {
    return null;
  }

  user.displayName = changes.displayName;
  user.portfolioTitle = changes.portfolioTitle;
  return toPublicUser(user);
}

export function toPublicUser(user: DemoUser): PublicUserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    portfolioTitle: user.portfolioTitle,
    plan: user.plan
  };
}
