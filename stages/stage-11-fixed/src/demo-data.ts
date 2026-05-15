import type { DemoUser, Project, PublicUser } from "./types.js";

// FAKE TRAINING VALUES ONLY: internal fields stay server-side in this fixed stage.
const seedUsers: DemoUser[] = [
  {
    id: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "user",
    plan: "free",
    billingCustomerId: "cus_fake_alice_fixed_training_only",
    passwordHash: "fake_password_hash_fixed_alice_training_only",
    refreshToken: "fake_refresh_token_fixed_alice_training_only"
  },
  {
    id: "bob",
    email: "bob@example.test",
    displayName: "Bob",
    role: "user",
    plan: "pro",
    billingCustomerId: "cus_fake_bob_fixed_training_only",
    passwordHash: "fake_password_hash_fixed_bob_training_only",
    refreshToken: "fake_refresh_token_fixed_bob_training_only"
  },
  {
    id: "admin",
    email: "admin@example.test",
    displayName: "Admin",
    role: "admin",
    plan: "enterprise",
    billingCustomerId: "cus_fake_admin_fixed_training_only",
    passwordHash: "fake_password_hash_fixed_admin_training_only",
    refreshToken: "fake_refresh_token_fixed_admin_training_only"
  }
];

const seedProjects: Project[] = [
  {
    id: "project-alice",
    ownerId: "alice",
    title: "Alice AI Portfolio",
    imageObjectKey: null,
    aiDescriptionText: "Alice builds local-only portfolio demos.",
    publicSlug: "alice-ai-portfolio"
  },
  {
    id: "project-bob",
    ownerId: "bob",
    title: "Bob Private Portfolio",
    imageObjectKey: null,
    aiDescriptionText: "Bob is drafting a private local portfolio.",
    publicSlug: "bob-private-portfolio"
  }
];

let users = seedUsers.map((user) => ({ ...user }));
let projects = seedProjects.map((project) => ({ ...project }));

export function resetDemoData(): void {
  users = seedUsers.map((user) => ({ ...user }));
  projects = seedProjects.map((project) => ({ ...project }));
}

export function findUserById(id: string): DemoUser | null {
  return users.find((user) => user.id === id) ?? null;
}

export function toPublicUser(user: DemoUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    plan: user.plan,
    billingStatus: "local-demo-active"
  };
}

export function listPublicUsers(): PublicUser[] {
  return users.map(toPublicUser);
}

export function listProjectsByOwner(ownerId: DemoUser["id"]): Project[] {
  return projects.filter((project) => project.ownerId === ownerId).map((project) => ({ ...project }));
}

export function findProjectByIdForUser(id: string, ownerId: DemoUser["id"]): Project | null {
  return projects.find((project) => project.id === id && project.ownerId === ownerId) ?? null;
}

export function findProjectByIdForAdmin(id: string): Project | null {
  return projects.find((project) => project.id === id) ?? null;
}

export function findProjectBySlug(slug: string): Project | null {
  return projects.find((project) => project.publicSlug === slug) ?? null;
}

export function createProject(ownerId: DemoUser["id"], title: string): Project {
  const id = `project-${ownerId}-${projects.length + 1}`;
  const project: Project = {
    id,
    ownerId,
    title,
    imageObjectKey: null,
    aiDescriptionText: "",
    publicSlug: `${ownerId}-${title.toLowerCase().replaceAll(" ", "-")}`
  };

  projects.push(project);
  return { ...project };
}

export function updateProjectImageForUser(id: string, ownerId: DemoUser["id"], imageObjectKey: string): Project | null {
  const project = findProjectByIdForUser(id, ownerId);

  if (!project) {
    return null;
  }

  project.imageObjectKey = imageObjectKey;
  return { ...project };
}

export function updateProjectAiTextForUser(id: string, ownerId: DemoUser["id"], aiDescriptionText: string): Project | null {
  const project = findProjectByIdForUser(id, ownerId);

  if (!project) {
    return null;
  }

  project.aiDescriptionText = aiDescriptionText;
  return { ...project };
}
