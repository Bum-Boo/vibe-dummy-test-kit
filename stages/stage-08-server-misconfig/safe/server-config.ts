export const safeCorsForSensitiveApiRoutes = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST"]
};

export function safeLogRequest(path: string): Record<string, string> {
  return {
    path,
    message: "Sensitive headers and session tokens are intentionally omitted."
  };
}

