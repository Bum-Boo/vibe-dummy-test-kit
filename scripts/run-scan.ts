import { existsSync, realpathSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { assertLocalOnlyArgs, loadStage, readArg, repoRoot, resolveStageId, type GeneratedReport } from "./shared.js";

export type ResolvedStage = {
  id: string;
  shortId: string;
  directory: string;
};

export type ScanOutputPaths = {
  json: string;
  markdown: string;
  log: string;
};

export type ScanResult = {
  stage: ResolvedStage;
  outputs: ScanOutputPaths;
};

type CommandResult = {
  exitCode: number | null;
  stdout: string;
  stderr: string;
};

const defaultBinary = "BTS_sec";

export async function runScanForStage(stageInput: string): Promise<ScanResult> {
  const root = repoRoot();
  const stage = resolveStage(root, stageInput);
  const outputs = outputPaths(root, stage);
  const binary = process.env.BTS_SEC_BIN?.trim() || defaultBinary;
  const args = buildBtsSecArgs(stage, outputs);

  ensureBinaryAvailable(binary);
  await mkdir(path.dirname(outputs.json), { recursive: true });

  const command = [binary, ...args].join(" ");

  console.log(`Scanning ${stage.id}`);
  console.log(`Stage path: ${path.relative(root, stage.directory)}`);
  console.log(`Reports: ${path.relative(root, outputs.json)}, ${path.relative(root, outputs.markdown)}`);

  const result = await runCommand(binary, args, root);
  await writeScanLog(outputs.log, command, result);

  if (result.exitCode !== 0) {
    throw new Error(
      [
        `BTS_sec scan failed for ${stage.id}.`,
        `Exit code: ${result.exitCode ?? "unknown"}`,
        `Log: ${path.relative(root, outputs.log)}`
      ].join("\n")
    );
  }

  await ensureReportFiles(stage, outputs, result);
  console.log(`Saved JSON: ${path.relative(root, outputs.json)}`);
  console.log(`Saved Markdown: ${path.relative(root, outputs.markdown)}`);
  console.log(`Saved log: ${path.relative(root, outputs.log)}`);

  return { stage, outputs };
}

export function resolveStage(root: string, input: string): ResolvedStage {
  const id = resolveStageId(root, input);
  const stage = loadStage(root, id);
  const stagesRoot = path.join(root, "stages");
  const directory = path.join(stagesRoot, id);
  const relative = path.relative(stagesRoot, directory);

  if (relative.startsWith("..") || path.isAbsolute(relative) || !existsSync(directory)) {
    throw new Error(`Refusing to scan invalid stage path: ${directory}`);
  }

  const realStagesRoot = realpathSync(stagesRoot);
  const realDirectory = realpathSync(directory);
  const realRelative = path.relative(realStagesRoot, realDirectory);

  if (realRelative.startsWith("..") || path.isAbsolute(realRelative)) {
    throw new Error(`Refusing to scan stage path outside local stages directory: ${directory}`);
  }

  return {
    id: stage.id,
    shortId: shortStageId(stage.id),
    directory
  };
}

export function outputPaths(root: string, stage: ResolvedStage): ScanOutputPaths {
  const outputRoot = path.join(root, "reports", "generated");

  return {
    json: path.join(outputRoot, `${stage.shortId}.report.json`),
    markdown: path.join(outputRoot, `${stage.shortId}.report.md`),
    log: path.join(outputRoot, `${stage.shortId}.scan.log`)
  };
}

export function ensureBinaryAvailable(binary: string): void {
  const isPathLike = binary.includes("/") || binary.includes("\\") || path.isAbsolute(binary);

  if (isPathLike) {
    if (existsSync(binary)) {
      return;
    }

    throw missingBinaryError(binary);
  }

  const lookup = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(lookup, [binary], { stdio: "ignore" });

  if (result.status !== 0) {
    throw missingBinaryError(binary);
  }
}

function shortStageId(stageId: string): string {
  const match = stageId.match(/^(stage-\d{2})-/);
  return match?.[1] ?? stageId;
}

function buildBtsSecArgs(stage: ResolvedStage, outputs: ScanOutputPaths): string[] {
  const template = process.env.BTS_SEC_ARGS?.trim();
  let args: string[];

  if (template) {
    args = splitArgs(template).map((arg) =>
      arg
        .replaceAll("{stage}", stage.id)
        .replaceAll("{stage_short}", stage.shortId)
        .replaceAll("{stage_path}", stage.directory)
        .replaceAll("{json}", outputs.json)
        .replaceAll("{markdown}", outputs.markdown)
        .replaceAll("{log}", outputs.log)
    );
  } else {
    args = ["scan", stage.directory, "--json-out", outputs.json, "--markdown-out", outputs.markdown];
  }

  assertLocalOnlyArgs(args, "BTS_SEC_ARGS");
  return args;
}

function splitArgs(value: string): string[] {
  const matches = value.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return matches.map((part) => part.replace(/^["']|["']$/g, ""));
}

function runCommand(binary: string, args: string[], cwd: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, {
      cwd,
      shell: false,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });
  });
}

async function writeScanLog(filePath: string, command: string, result: CommandResult): Promise<void> {
  const log = [
    `Command: ${command}`,
    `Exit code: ${result.exitCode ?? "unknown"}`,
    "",
    "## stdout",
    result.stdout.trim() || "(empty)",
    "",
    "## stderr",
    result.stderr.trim() || "(empty)",
    ""
  ].join("\n");

  await writeFile(filePath, log);
}

async function ensureReportFiles(stage: ResolvedStage, outputs: ScanOutputPaths, result: CommandResult): Promise<void> {
  if (!existsSync(outputs.json)) {
    const parsed = parseJsonFromOutput(result.stdout);
    const report = parsed ?? fallbackJsonReport(stage, result.stdout);
    await writeFile(outputs.json, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (!existsSync(outputs.markdown)) {
    await writeFile(outputs.markdown, await fallbackMarkdownReport(stage, outputs.json, result.stdout));
  }
}

function parseJsonFromOutput(output: string): unknown | null {
  const trimmed = output.trim();

  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function fallbackJsonReport(stage: ResolvedStage, stdout: string): GeneratedReport & { raw_stdout?: string } {
  return {
    schemaVersion: "0.1",
    generatedAt: new Date(0).toISOString(),
    stage: stage.id,
    target: {
      baseUrl: "local-stage-path",
      routes: [stage.directory]
    },
    scanner: {
      name: "BTS_sec",
      mode: "external-runner"
    },
    findings: [],
    raw_stdout: stdout.trim() || undefined
  };
}

async function fallbackMarkdownReport(stage: ResolvedStage, jsonPath: string, stdout: string): Promise<string> {
  const json = existsSync(jsonPath) ? await readFile(jsonPath, "utf8") : "";
  const parsed = parseJsonFromOutput(json) as { findings?: unknown[] } | null;
  const findingCount = Array.isArray(parsed?.findings) ? parsed.findings.length : "unknown";

  return `# BTS_sec Report: ${stage.id}

- Stage: ${stage.id}
- Findings: ${findingCount}
- Source: generated by scripts/run-scan.ts fallback writer

## Notes

BTS_sec did not write a Markdown report file directly. This fallback report preserves deterministic output paths.

## Raw stdout

\`\`\`txt
${stdout.trim() || "(empty)"}
\`\`\`
`;
}

function missingBinaryError(binary: string): Error {
  return new Error(
    [
      `BTS_sec binary was not found: ${binary}`,
      "Install BTS_sec locally or set BTS_SEC_BIN to the executable path.",
      "Example:",
      "  BTS_SEC_BIN=/path/to/BTS_sec make scan STAGE=04",
      "",
      "If your BTS_sec CLI uses different flags, set BTS_SEC_ARGS with placeholders:",
      '  BTS_SEC_ARGS="scan {stage_path} --json-out {json} --markdown-out {markdown}"',
      "",
      "Available placeholders: {stage}, {stage_short}, {stage_path}, {json}, {markdown}, {log}"
    ].join("\n")
  );
}

async function main(): Promise<void> {
  const stage = readArg("stage") ?? process.env.STAGE ?? "00";
  await runScanForStage(stage);
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
