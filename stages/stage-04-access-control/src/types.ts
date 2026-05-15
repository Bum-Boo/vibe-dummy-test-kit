export type DemoUser = {
  id: "alice" | "bob";
  email: string;
};

export type DemoProject = {
  id: string;
  ownerId: DemoUser["id"];
  title: string;
  visibility: "private" | "public";
};

export type DemoOrder = {
  id: string;
  userId: DemoUser["id"];
  plan: "starter" | "pro";
  amountCents: number;
};

export type DemoRequest = {
  params: Record<string, string>;
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

