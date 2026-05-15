import type { DemoUser, Project } from "./types.js";

// FAKE TRAINING VALUES ONLY: credential-like fields are deterministic local fixtures.
const seedUsers: DemoUser[] = [
  {
    id: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "user",
    isAdmin: false,
    plan: "free",
    billingCustomerId: "cus_fake_alice_chain_training_only",
    passwordHash: "fake_password_hash_chain_alice_training_only",
    refreshToken: "fake_refresh_token_chain_alice_training_only"
  },
  {
    id: "bob",
    email: "bob@example.test",
    displayName: "Bob",
    role: "user",
    isAdmin: false,
    plan: "pro",
    billingCustomerId: "cus_fake_bob_chain_training_only",
    passwordHash: "fake_password_hash_chain_bob_training_only",
    refreshToken: "fake_refresh_token_chain_bob_training_only"
  },
  {
    id: "admin",
    email: "admin@example.test",
    displayName: "Admin",
    role: "admin",
    isAdmin: true,
    plan: "enterprise",
    billingCustomerId: "cus_fake_admin_chain_training_only",
    passwordHash: "fake_password_hash_chain_admin_training_only",
    refreshToken: "fake_refresh_token_chain_admin_training_only"
  }
];

const seedProjects: Project[] = [
  {
    id: "project-alice",
    ownerId: "alice",
    title: "Alice AI Portfolio",
    imageUrl: null,
    aiDescriptionHtml: "<p>Alice builds local-only portfolio demos.</p>",
    publicSlug: "alice-ai-portfolio"
  },
  {
    id: "project-bob",
    ownerId: "bob",
    title: "Bob Private Portfolio",
    imageUrl: null,
    aiDescriptionHtml: "<p>Bob's private draft should not be visible to Alice.</p>",
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

export function listUsers(): DemoUser[] {
  return users.map((user) => ({ ...user }));
}

export function listProjectsByOwner(ownerId: DemoUser["id"]): Project[] {
  return projects.filter((project) => project.ownerId === ownerId).map((project) => ({ ...project }));
}

export function findProjectById(id: string): Project | null {
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
    imageUrl: null,
    aiDescriptionHtml: "",
    publicSlug: `${ownerId}-${title.toLowerCase().replaceAll(" ", "-")}`
  };

  projects.push(project);
  return project;
}

export function updateProjectImage(id: string, imageUrl: string): Project | null {
  const project = findProjectById(id);

  if (!project) {
    return null;
  }

  project.imageUrl = imageUrl;
  return project;
}

export function updateProjectAiDescription(id: string, aiDescriptionHtml: string): Project | null {
  const project = findProjectById(id);

  if (!project) {
    return null;
  }

  project.aiDescriptionHtml = aiDescriptionHtml;
  return project;
}
