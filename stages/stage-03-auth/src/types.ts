export type DemoUser = {
  id: string;
  email: string;
  role: "user" | "admin";
};

export type DemoRequest = {
  path: string;
  headers: Record<string, string | undefined>;
  body: Record<string, unknown>;
};

export type DemoResponse = {
  status: (code: number) => DemoResponse;
  json: (body: unknown) => void;
};

