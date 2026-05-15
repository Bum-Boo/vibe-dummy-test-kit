# Expected Report: Stage 09 AI Feature Security Risks

BTS_sec should report unsafe AI integration patterns where model output is treated as trusted code, SQL, HTML, or instructions.

| ID | Finding | Severity | Evidence | Plain-Language Risk | Safe Fix |
| --- | --- | --- | --- | --- | --- |
| AI-001 | AI-generated HTML rendered without sanitization | High | `return \`<main class="ai-page">${aiGeneratedHtml}</main>\`;` | Model output becomes browser HTML, so generated content can become an unsafe rendering sink. | Use templates, escape text, or sanitize reviewed HTML before rendering. |
| AI-002 | AI-generated SQL executed without validation | Critical | `return executeGeneratedSql(generatedSql);` | The model chooses database instructions directly. | Use fixed report IDs, query builders, allowlists, and human review for risky queries. |
| AI-003 | AI output connected to command execution path | Critical | `return planShellCommandFromAi(aiOutput);` | A model response can influence command-like actions. | Never execute model-generated commands directly; map to restricted server actions. |
| AI-004 | Sensitive prompt content included in code | High | `fake_internal_ai_prompt_secret_for_training_only` | Prompt text is not a safe secret store and can leak through logs, model responses, or repo access. | Keep secrets out of prompts and code; inject only non-secret policy text. |
| AI-005 | Missing input length or rate limits | Medium | `no input length limit, no rate limit, and no cost guard` | Long or repeated prompts can cause cost, latency, and abuse problems. | Add input size limits, user/IP rate limits, and budget guards. |
| AI-006 | Unsafe RAG/document instruction handling | High | `local document text is inserted as instructions without isolation` | Retrieved documents can contain instruction-looking text that changes model behavior. | Treat retrieved content as quoted data, separate instructions from documents, and restrict actions. |

## Safe Contrast

`src/safe-ai-features.ts` should not be flagged for these vulnerabilities. It uses templates, allowlisted SQL reports, allowlisted command actions, prompt length bounds, and document quoting.

## Expected Summary

- Critical: 2
- High: 3
- Medium: 1
- Low: 0
- Info: 0

