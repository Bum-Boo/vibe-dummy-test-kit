import { boundedAiPrompt } from "./limits.js";

export function generatePortfolioTextFromAi(prompt: string): string {
  const boundedPrompt = boundedAiPrompt(prompt);
  return `AI portfolio draft: ${boundedPrompt}`;
}

export function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

