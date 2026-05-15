export type DemoUser = {
  id: "alice" | "bob";
  email: string;
  displayName: string;
  portfolioTitle: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "enterprise";
  credit: number;
  isAdmin: boolean;
  emailVerified: boolean;
  passwordHash: string;
  refreshToken: string;
  internalMemo: string;
  billingCustomerId: string;
};

export type PublicUserProfile = {
  id: DemoUser["id"];
  email: string;
  displayName: string;
  portfolioTitle: string;
  plan: DemoUser["plan"];
};

export type DemoRequest = {
  params: Record<string, string>;
  headers: Record<string, string | undefined>;
  body: Record<string, unknown>;
};

export type DemoResponse = {
  status: (code: number) => DemoResponse;
  json: (body: unknown) => void;
};

export type DemoResult = {
  statusCode: number;
  body: unknown;
};

