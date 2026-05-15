export type DemoUser = {
  id: "alice" | "bob" | "admin";
  email: string;
  displayName: string;
  role: "user" | "admin";
  isAdmin: boolean;
  plan: "free" | "pro" | "enterprise";
  billingCustomerId: string;
  passwordHash: string;
  refreshToken: string;
};

export type Project = {
  id: string;
  ownerId: DemoUser["id"];
  title: string;
  imageUrl: string | null;
  aiDescriptionHtml: string;
  publicSlug: string;
};

export type DemoRequest = {
  params: Record<string, string>;
  body: Record<string, unknown>;
  headers: Record<string, string | undefined>;
};

export type DemoResponse = {
  status: (code: number) => DemoResponse;
  json: (body: unknown) => void;
};

export type DemoResult = {
  statusCode: number;
  body: unknown;
};

export type UploadedFile = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

