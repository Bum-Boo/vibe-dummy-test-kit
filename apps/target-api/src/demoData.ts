export type DemoRole = "user" | "admin";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
  plan: "free" | "pro" | "admin";
  billingStatus: "demo-free" | "demo-paid" | "internal-demo";
};

export type PortfolioProject = {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  summary: string;
  theme: "minimal" | "bold" | "editorial";
  isPublic: boolean;
  imageKey: string | null;
  aiProfileText: string | null;
  createdAt: string;
};

export type UploadValidationInput = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

export const demoUsers: DemoUser[] = [
  {
    id: "alice",
    name: "Alice Kim",
    email: "alice.demo@example.local",
    role: "user",
    plan: "pro",
    billingStatus: "demo-paid"
  },
  {
    id: "bob",
    name: "Bob Lee",
    email: "bob.demo@example.local",
    role: "user",
    plan: "free",
    billingStatus: "demo-free"
  },
  {
    id: "admin",
    name: "Admin Park",
    email: "admin.demo@example.local",
    role: "admin",
    plan: "admin",
    billingStatus: "internal-demo"
  }
];

const projects: PortfolioProject[] = [
  {
    id: "proj-alice-001",
    ownerId: "alice",
    title: "Alice Product Design Portfolio",
    slug: "alice-product-design",
    summary: "Case studies for SaaS onboarding, design systems, and growth experiments.",
    theme: "minimal",
    isPublic: true,
    imageKey: "local-demo/alice-cover.png",
    aiProfileText: "Alice designs calm SaaS experiences with measurable product outcomes.",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "proj-alice-002",
    ownerId: "alice",
    title: "Alice Private Draft",
    slug: "alice-private-draft",
    summary: "A private draft used to model access-control checks.",
    theme: "editorial",
    isPublic: false,
    imageKey: null,
    aiProfileText: null,
    createdAt: "2026-01-02T00:00:00.000Z"
  },
  {
    id: "proj-bob-001",
    ownerId: "bob",
    title: "Bob Developer Portfolio",
    slug: "bob-developer-portfolio",
    summary: "Full-stack projects, automation tools, and local-first prototypes.",
    theme: "bold",
    isPublic: true,
    imageKey: "local-demo/bob-cover.png",
    aiProfileText: "Bob builds practical full-stack tools with a focus on maintainability.",
    createdAt: "2026-01-03T00:00:00.000Z"
  }
];

let nextProjectNumber = 3;

export function listUsers(): DemoUser[] {
  return demoUsers;
}

export function findUser(userId: string | undefined): DemoUser | undefined {
  return demoUsers.find((user) => user.id === userId);
}

export function listProjectsForUser(user: DemoUser): PortfolioProject[] {
  if (user.role === "admin") {
    return projects;
  }

  return projects.filter((project) => project.ownerId === user.id);
}

export function findProject(projectId: string): PortfolioProject | undefined {
  return projects.find((project) => project.id === projectId);
}

export function findPublicProject(slug: string): PortfolioProject | undefined {
  return projects.find((project) => project.slug === slug && project.isPublic);
}

export function canReadProject(user: DemoUser, project: PortfolioProject): boolean {
  // Security check: private projects are visible only to their owner or an admin.
  return user.role === "admin" || project.ownerId === user.id;
}

export function createProject(input: {
  owner: DemoUser;
  title: string;
  summary: string;
  theme: PortfolioProject["theme"];
  isPublic: boolean;
}): PortfolioProject {
  const id = `proj-${input.owner.id}-${String(nextProjectNumber).padStart(3, "0")}`;
  nextProjectNumber += 1;

  const project: PortfolioProject = {
    id,
    ownerId: input.owner.id,
    title: input.title,
    slug: slugify(`${input.owner.id}-${input.title}`),
    summary: input.summary,
    theme: input.theme,
    isPublic: input.isPublic,
    imageKey: null,
    aiProfileText: null,
    createdAt: "2026-01-10T00:00:00.000Z"
  };

  projects.push(project);
  return project;
}

export function markUploadPlaceholder(project: PortfolioProject): PortfolioProject {
  project.imageKey = `local-demo/${project.id}-placeholder.png`;
  return project;
}

export function validateUploadStub(input: UploadValidationInput): string[] {
  const errors: string[] = [];
  const allowedMimeTypes = new Set(["image/png", "image/jpeg"]);
  const maxBytes = 2 * 1024 * 1024;

  if (!/^[a-zA-Z0-9._-]+$/.test(input.filename) || input.filename.includes("..")) {
    errors.push("filename_must_be_simple");
  }

  if (!allowedMimeTypes.has(input.mimeType)) {
    errors.push("mime_type_not_allowed");
  }

  if (!Number.isInteger(input.sizeBytes) || input.sizeBytes <= 0 || input.sizeBytes > maxBytes) {
    errors.push("size_out_of_range");
  }

  return errors;
}

export function generateProfileText(project: PortfolioProject, owner: DemoUser): PortfolioProject {
  const article = project.theme === "editorial" ? "an" : "a";
  project.aiProfileText = `${owner.name} is building "${project.title}", ${article} ${project.theme} portfolio for local security lab demos.`;
  return project;
}

export function adminSummary() {
  return {
    users: demoUsers.length,
    projects: projects.length,
    publicProjects: projects.filter((project) => project.isPublic).length,
    plans: demoUsers.map((user) => ({
      userId: user.id,
      plan: user.plan,
      billingStatus: user.billingStatus
    }))
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
