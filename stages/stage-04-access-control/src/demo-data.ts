import type { DemoOrder, DemoProject, DemoUser } from "./types.js";

export const demoUsers: DemoUser[] = [
  { id: "alice", email: "alice@example.test" },
  { id: "bob", email: "bob@example.test" }
];

const seedProjects: DemoProject[] = [
  {
    id: "project-alice",
    ownerId: "alice",
    title: "Alice AI Portfolio",
    visibility: "private"
  },
  {
    id: "project-bob",
    ownerId: "bob",
    title: "Bob Confidential Portfolio",
    visibility: "private"
  }
];

const seedOrders: DemoOrder[] = [
  {
    id: "order-alice",
    userId: "alice",
    plan: "starter",
    amountCents: 1900
  },
  {
    id: "order-bob",
    userId: "bob",
    plan: "pro",
    amountCents: 4900
  }
];

let projects = [...seedProjects];
let orders = [...seedOrders];

export function resetDemoData(): void {
  projects = [...seedProjects];
  orders = [...seedOrders];
}

export function findProjectById(id: string): DemoProject | null {
  return projects.find((project) => project.id === id) ?? null;
}

export function findOrderById(id: string): DemoOrder | null {
  return orders.find((order) => order.id === id) ?? null;
}

export function deleteProjectById(id: string): DemoProject | null {
  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) {
    return null;
  }

  const [deleted] = projects.splice(index, 1);
  return deleted ?? null;
}

export function findProjectsByOwnerId(ownerId: DemoUser["id"]): DemoProject[] {
  return projects.filter((project) => project.ownerId === ownerId);
}

