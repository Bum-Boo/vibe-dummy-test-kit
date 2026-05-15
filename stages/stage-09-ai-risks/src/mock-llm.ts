import type { MockAiRequest, MockAiResponse } from "./types.js";

export function mockLlm(request: MockAiRequest): MockAiResponse {
  switch (request.feature) {
    case "profile":
      return {
        text: "Friendly AI portfolio builder focused on local training demos."
      };
    case "sql":
      return {
        text: "SELECT id, email, plan FROM users WHERE plan = 'free';"
      };
    case "html":
      return {
        text: "<section><h1>AI Portfolio</h1><p>Harmless generated training HTML.</p></section>"
      };
    case "support":
      return {
        text: "Ask the local support team to review the account state."
      };
    case "document-summary":
      return {
        text: "The local documents describe demo plans, billing notes, and training-only policies."
      };
    case "command":
      return {
        text: "list-local-demo-files --dry-run"
      };
  }
}

