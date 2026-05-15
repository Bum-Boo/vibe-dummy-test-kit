export type DemoRequest = {
  path: string;
  headers: Record<string, string | undefined>;
  cookies: Record<string, string | undefined>;
};

export type DemoResponse = {
  status: (code: number) => DemoResponse;
  json: (body: unknown) => void;
};

