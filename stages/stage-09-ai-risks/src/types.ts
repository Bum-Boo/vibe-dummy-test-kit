export type MockAiRequest = {
  feature: "profile" | "sql" | "html" | "support" | "document-summary" | "command";
  prompt: string;
};

export type MockAiResponse = {
  text: string;
};

export type DemoSqlResult = {
  sql: string;
  rows: Array<Record<string, string | number | boolean>>;
  executed: boolean;
  note: string;
};

export type CommandPlan = {
  command: string;
  executed: false;
  note: string;
};

