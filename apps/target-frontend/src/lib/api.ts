export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
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

export type AdminSummary = {
  users: number;
  projects: number;
  publicProjects: number;
  plans: Array<{
    userId: string;
    plan: DemoUser["plan"];
    billingStatus: DemoUser["billingStatus"];
  }>;
};

export const publicApiBase = process.env.NEXT_PUBLIC_TARGET_API_BASE_URL ?? "http://localhost:4000/api";

const serverApiBase =
  process.env.TARGET_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_TARGET_API_BASE_URL ?? "http://localhost:4000/api";

export async function fetchDemoUsers(): Promise<DemoUser[]> {
  const data = await apiFetch<{ users: DemoUser[] }>("/demo-users");
  return data.users;
}

export async function fetchProjects(userId: string): Promise<{
  currentUser: DemoUser;
  projects: PortfolioProject[];
}> {
  return apiFetch(`/projects?userId=${encodeURIComponent(userId)}`);
}

export async function fetchProject(userId: string, projectId: string): Promise<{
  currentUser: DemoUser;
  project: PortfolioProject;
}> {
  return apiFetch(`/projects/${encodeURIComponent(projectId)}?userId=${encodeURIComponent(userId)}`);
}

export async function fetchPublicPortfolio(slug: string): Promise<{ project: PortfolioProject }> {
  return apiFetch(`/portfolio/${encodeURIComponent(slug)}`);
}

export async function fetchAdminSummary(userId: string): Promise<{
  currentUser: DemoUser;
  summary: AdminSummary;
}> {
  return apiFetch(`/admin?userId=${encodeURIComponent(userId)}`);
}

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${serverApiBase}${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

