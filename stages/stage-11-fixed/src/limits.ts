const maxAiPromptChars = 500;
const maxAiRequestsPerUser = 5;
const aiRequestCounts = new Map<string, number>();

export function boundedAiPrompt(input: string): string {
  return input.slice(0, maxAiPromptChars);
}

export function canUseAi(userId: string): boolean {
  const count = aiRequestCounts.get(userId) ?? 0;

  if (count >= maxAiRequestsPerUser) {
    return false;
  }

  aiRequestCounts.set(userId, count + 1);
  return true;
}

export function resetRateLimits(): void {
  aiRequestCounts.clear();
}

