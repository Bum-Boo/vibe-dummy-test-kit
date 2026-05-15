import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export type StageTarget = {
  baseUrl: string;
  routes: string[];
};

export type StageManifest = {
  id: string;
  order: number;
  title: string;
  status: "scaffold-only" | "planned" | "implemented";
  focus: string;
  target: StageTarget;
  api?: {
    baseUrl: string;
    routes: string[];
  };
  services: string[];
  expectedFindingsFile: string;
  appReferences?: string[];
  scanMode?: "http" | "code";
  codeScanRoots?: string[];
};

export type ExpectedFinding = {
  id: string;
  title: string;
  category: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  files?: string[];
  evidence?: string[];
};

export type ExpectedFindingsFile = {
  stage: string;
  status: string;
  expectedSummary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  expectedFindings: ExpectedFinding[];
  plannedFindings: ExpectedFinding[];
};

export type GeneratedFinding = {
  id: string;
  title: string;
  category?: string;
  severity?: string;
  evidence?: string;
  file?: string;
};

export type GeneratedReport = {
  schemaVersion: string;
  generatedAt: string;
  stage: string;
  target: StageTarget;
  scanner: {
    name: string;
    mode: string;
  };
  findings: GeneratedFinding[];
};

export type ComparisonResult = {
  stage: string;
  passed: boolean;
  expectedCount: number;
  foundCount: number;
  missing: string[];
  unexpected: string[];
};

export function repoRoot(startDirectory = process.cwd()): string {
  let current = path.resolve(startDirectory);

  while (true) {
    const packagePath = path.join(current, "package.json");

    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as { name?: string };

      if (packageJson.name === "bts-sec-staircase-lab") {
        return current;
      }
    }

    const parent = path.dirname(current);

    if (parent === current) {
      throw new Error("Could not find bts-sec-staircase-lab repository root.");
    }

    current = parent;
  }
}

export function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  const value = process.argv[index + 1];
  return index === -1 || !value || value.startsWith("--") ? undefined : value;
}

export function stageIds(root: string): string[] {
  return readFileSync(path.join(root, "stages", ".stage-order"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function resolveStageId(root: string, input: string): string {
  const knownStages = stageIds(root);
  const normalized = input.trim();

  if (!normalized) {
    throw new Error("Missing STAGE value. Use STAGE=04 or STAGE=stage-04-access-control.");
  }

  assertLocalOnlyText(normalized, "STAGE");

  if (extractUrls(normalized).length > 0) {
    throw new Error("STAGE must be a known local stage folder, not a URL. Use STAGE=04 or STAGE=stage-04-access-control.");
  }

  const id = matchStageId(knownStages, normalized);

  if (!id) {
    throw new Error(
      [
        `Unknown stage: ${input}`,
        "Use a known local stage number or ID, for example STAGE=04 or STAGE=stage-04-access-control.",
        `Known stages: ${knownStages.join(", ")}`
      ].join("\n")
    );
  }

  return id;
}

export function assertLocalOnlyArgs(args: string[], source: string): void {
  for (const arg of args) {
    assertLocalOnlyText(arg, source);
  }
}

export function assertLocalOnlyText(value: string, source: string): void {
  for (const urlText of extractUrls(value)) {
    assertLocalUrl(urlText, source);
  }

  rejectPublicIpLiterals(value, source);
}

function matchStageId(knownStages: string[], input: string): string | null {
  if (knownStages.includes(input)) {
    return input;
  }

  const numeric = input.match(/^\d{1,2}$/);

  if (numeric) {
    const padded = numeric[0].padStart(2, "0");
    return knownStages.find((id) => id.startsWith(`stage-${padded}-`)) ?? null;
  }

  const short = input.match(/^stage-(\d{1,2})$/);

  if (short) {
    const padded = short[1].padStart(2, "0");
    return knownStages.find((id) => id.startsWith(`stage-${padded}-`)) ?? null;
  }

  return null;
}

function extractUrls(value: string): string[] {
  return value.match(/https?:\/\/[^\s"'<>]+/gi) ?? [];
}

function assertLocalUrl(value: string, source: string): void {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid URL in ${source}: ${value}`);
  }

  const allowedHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

  if (!allowedHosts.has(url.hostname)) {
    throw new Error(`Refusing to scan external URL from ${source}: ${value}`);
  }
}

function rejectPublicIpLiterals(value: string, source: string): void {
  const matches = value.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) ?? [];

  for (const ip of matches) {
    if (ip !== "127.0.0.1") {
      throw new Error(`Refusing to scan non-local IP from ${source}: ${ip}`);
    }
  }
}

export function readYaml<T>(filePath: string): T {
  return YAML.parse(readFileSync(filePath, "utf8")) as T;
}

export function loadStage(root: string, stageInput: string): StageManifest {
  const stageId = resolveStageId(root, stageInput);
  const filePath = path.join(root, "stages", stageId, "manifest.yaml");

  if (!existsSync(filePath)) {
    throw new Error(`Stage manifest not found: ${filePath}`);
  }

  const manifest = readYaml<StageManifest>(filePath);

  if (manifest.id !== stageId) {
    throw new Error(`Stage manifest ID mismatch: expected ${stageId}, found ${manifest.id}`);
  }

  ensureLocalTarget(manifest);
  return manifest;
}

export function loadExpected(root: string, stageId: string): ExpectedFindingsFile {
  const stage = loadStage(root, stageId);
  const stageDirectory = path.join(root, "stages", stageId);
  const filePath = stage.expectedFindingsFile
    ? path.resolve(stageDirectory, stage.expectedFindingsFile)
    : path.join(root, "expected", `${stageId}.expected-findings.yaml`);

  if (!existsSync(filePath)) {
    throw new Error(`Expected findings file not found: ${filePath}`);
  }

  return readYaml<ExpectedFindingsFile>(filePath);
}

export function ensureLocalTarget(stage: StageManifest): void {
  const url = new URL(stage.target.baseUrl);
  const allowedHosts = new Set(["localhost", "127.0.0.1", "::1"]);

  if (!allowedHosts.has(url.hostname)) {
    throw new Error(`Stage ${stage.id} target must be localhost only. Received ${stage.target.baseUrl}`);
  }
}

export function generatedDir(root: string, stageId: string): string {
  return path.join(root, "reports", "generated", stageId);
}

export function comparisonDir(root: string, stageId: string): string {
  return path.join(root, "reports", "comparisons", stageId);
}

export function generatedJsonPath(root: string, stageId: string): string {
  return path.join(generatedDir(root, stageId), "bts-sec-report.json");
}

export async function readGeneratedReport(root: string, stageId: string): Promise<GeneratedReport> {
  const filePath = generatedJsonPath(root, stageId);

  if (!existsSync(filePath)) {
    throw new Error(`Generated report not found. Run: make scan STAGE=${stageId}`);
  }

  return JSON.parse(await readFile(filePath, "utf8")) as GeneratedReport;
}

export async function writeGeneratedReport(
  root: string,
  stage: StageManifest,
  report: GeneratedReport
): Promise<void> {
  const directory = generatedDir(root, stage.id);
  await mkdir(directory, { recursive: true });
  await writeFile(generatedJsonPath(root, stage.id), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(directory, "bts-sec-report.md"), renderReport(stage, report));
}

export async function writeComparison(
  root: string,
  stage: StageManifest,
  result: ComparisonResult
): Promise<void> {
  const directory = comparisonDir(root, stage.id);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "comparison.json"), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(directory, "comparison.md"), renderComparison(stage, result));
}

export function compareReports(
  stage: StageManifest,
  expected: ExpectedFindingsFile,
  report: GeneratedReport
): ComparisonResult {
  const expectedIds = new Set(expected.expectedFindings.map((finding) => finding.id));
  const foundIds = new Set(report.findings.map((finding) => finding.id));
  const missing = [...expectedIds].filter((id) => !foundIds.has(id));
  const unexpected = [...foundIds].filter((id) => !expectedIds.has(id));

  return {
    stage: stage.id,
    passed: missing.length === 0 && unexpected.length === 0,
    expectedCount: expectedIds.size,
    foundCount: foundIds.size,
    missing,
    unexpected
  };
}

function renderReport(stage: StageManifest, report: GeneratedReport): string {
  const findings =
    report.findings.length === 0
      ? "- No findings in this scaffold report."
      : report.findings.map((finding) => `- ${finding.id}: ${finding.title}`).join("\n");

  return `# BTS_sec Report: ${stage.id}

- Stage: ${stage.title}
- Target: ${report.target.baseUrl}
- Scanner mode: ${report.scanner.mode}
- Generated at: ${report.generatedAt}

## Findings

${findings}
`;
}

function renderComparison(stage: StageManifest, result: ComparisonResult): string {
  const missing = result.missing.length === 0 ? "- None" : result.missing.map((id) => `- ${id}`).join("\n");
  const unexpected =
    result.unexpected.length === 0 ? "- None" : result.unexpected.map((id) => `- ${id}`).join("\n");

  return `# Comparison: ${stage.id}

- Stage: ${stage.title}
- Passed: ${result.passed ? "yes" : "no"}
- Expected findings: ${result.expectedCount}
- Found findings: ${result.foundCount}

## Missing

${missing}

## Unexpected

${unexpected}
`;
}
