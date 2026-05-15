import type { CommandPlan } from "./types.js";

export function planShellCommandFromAi(aiOutput: string): CommandPlan {
  // Stage 09 intentionally vulnerable shape: AI output is connected to a command execution path.
  // This lab never executes the command; it only returns a dry-run plan for static analysis.
  const command = aiOutput;

  return {
    command,
    executed: false,
    note: "Training stub only. No shell command is executed."
  };
}

export function safeActionFromAllowlist(action: "list-demo-files" | "show-upload-count"): CommandPlan {
  const commands = {
    "list-demo-files": "list-local-demo-files --dry-run",
    "show-upload-count": "show-local-upload-count --dry-run"
  };

  return {
    command: commands[action],
    executed: false,
    note: "Safe contrast: action is selected from a fixed allowlist."
  };
}

