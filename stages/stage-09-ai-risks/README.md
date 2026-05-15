# Stage 09: AI Feature Security Risks

This stage demonstrates local-only AI integration mistakes that are common in quickly built apps. It uses deterministic mock LLM responses only. No live AI provider, API key, shell command, or real database is used.

## Mock AI Features

- AI profile generator
- AI SQL assistant
- AI HTML page generator
- AI support chatbot
- AI document summarizer placeholder

## Intentional Findings

- `AI-001`: AI-generated HTML rendered without sanitization.
- `AI-002`: AI-generated SQL sent directly to a simulated execution function.
- `AI-003`: AI output connected to a shell-command-like path, safely stubbed and non-executing.
- `AI-004`: fake internal prompt secret embedded in code.
- `AI-005`: missing input length limit, rate limit, and cost guard.
- `AI-006`: RAG-like local document text treated as prompt instructions.

## Safe Contrast

`src/safe-ai-features.ts` shows safer alternatives:

- template-based profile and HTML output
- SQL selected from a server-side allowlist
- command-like actions selected from an allowlist
- bounded prompt input
- retrieved documents treated as quoted data, not trusted instructions

