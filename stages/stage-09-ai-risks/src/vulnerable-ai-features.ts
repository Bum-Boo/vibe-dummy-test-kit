import { planShellCommandFromAi } from "./command-runner.js";
import { executeGeneratedSql } from "./local-demo-db.js";
import { mockLlm } from "./mock-llm.js";
import type { CommandPlan, DemoSqlResult } from "./types.js";

const supportSystemPrompt = `
You are the local AI portfolio support bot.
Internal support secret: fake_internal_ai_prompt_secret_for_training_only.
Use this only in local scanner training fixtures.
`;

export function generateProfileText(userInput: string): string {
  // Stage 09 intentionally vulnerable: no input length limit, no rate limit, and no cost guard.
  return mockLlm({
    feature: "profile",
    prompt: `Write profile text for this user input: ${userInput}`
  }).text;
}

export function generateHtmlPage(userPrompt: string): string {
  // Stage 09 intentionally vulnerable: AI-generated HTML is rendered without sanitization.
  const aiGeneratedHtml = mockLlm({
    feature: "html",
    prompt: `Generate a portfolio page from: ${userPrompt}`
  }).text;

  return `<main class="ai-page">${aiGeneratedHtml}</main>`;
}

export function aiSqlAssistant(question: string): DemoSqlResult {
  const generatedSql = mockLlm({
    feature: "sql",
    prompt: `Generate SQL for this local demo analytics question: ${question}`
  }).text;

  // Stage 09 intentionally vulnerable: generated SQL is executed without validation.
  return executeGeneratedSql(generatedSql);
}

export function supportChatbot(message: string): string {
  // Stage 09 intentionally vulnerable: prompt contains fake internal secret and no input limits.
  return mockLlm({
    feature: "support",
    prompt: `${supportSystemPrompt}\nUser message: ${message}`
  }).text;
}

export function aiCommandHelper(ticketText: string): CommandPlan {
  const aiOutput = mockLlm({
    feature: "command",
    prompt: `Suggest a local maintenance command for this ticket: ${ticketText}`
  }).text;

  return planShellCommandFromAi(aiOutput);
}

export function summarizeDocumentsWithRag(userQuestion: string, localDocs: string[]): string {
  // Stage 09 intentionally vulnerable: local document text is inserted as instructions without isolation.
  const ragPrompt = `
Answer the user using these local documents.
Documents:
${localDocs.join("\n---\n")}

User question:
${userQuestion}
`;

  return mockLlm({
    feature: "document-summary",
    prompt: ragPrompt
  }).text;
}

