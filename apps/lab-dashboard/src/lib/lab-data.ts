import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const severities = ["critical", "high", "medium", "low", "info"] as const;

export type Severity = (typeof severities)[number];

export type SeveritySummary = Record<Severity, number>;

export type ExpectedFinding = {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  files: string[];
  route?: string;
  evidence: string[];
  fixSummary?: string;
};

export type StageManifest = {
  id: string;
  order: number;
  title: string;
  status: string;
  focus: string;
  scanMode?: string;
  target?: {
    baseUrl?: string;
    routes?: string[];
  };
  services?: string[];
  expectedFindingsFile?: string;
  intendedVulnerabilities?: Array<{
    id?: string;
    title?: string;
    severity?: string;
    category?: string;
    files?: string[];
    route?: string;
  }>;
  negativeExamples?: Array<{
    id?: string;
    title?: string;
    route?: string;
    reason?: string;
  }>;
  safety?: string[];
};

export type StageView = {
  id: string;
  shortId: string;
  number: string;
  title: string;
  status: string;
  focus: string;
  difficulty: string;
  topics: string[];
  expectedRisk: string;
  expectedSummary: SeveritySummary;
  expectedFindings: ExpectedFinding[];
  targetBaseUrl: string;
  routes: string[];
  services: string[];
  scanMode: string;
  safety: string[];
  readmeExcerpt: string;
  hasReport: boolean;
  hasComparison: boolean;
  reportPath?: string;
  comparisonPath?: string;
};

export type ActualFinding = {
  id: string;
  title: string;
  severity?: Severity;
  category?: string;
  file?: string;
  route?: string;
  evidence: string;
  explanation: string;
  recommendation: string;
};

export type ReportView = {
  stage: StageView;
  command: string;
  report?: {
    path: string;
    markdownPath?: string;
    generatedAt?: string;
    scannerName?: string;
    scannerMode?: string;
    findings: ActualFinding[];
    summary: SeveritySummary;
  };
  comparison?: ComparisonView;
};

export type ComparisonView = {
  path: string;
  overall: "PASS" | "FAIL";
  expectedFindings: number;
  detectedFindings: number;
  matchedFindings: number;
  falsePositives: number;
  missedFindings: number;
  severityAccuracy: number;
  checks: Record<string, string>;
  matches: Array<{
    id: string;
    title: string;
    matched: boolean;
    issues: string[];
  }>;
};

export type ScoreboardRow = {
  stage: StageView;
  status: "PASS" | "PARTIAL" | "FAIL";
  recall: number;
  precision: number;
  severityAccuracy: number;
  reportQuality: string;
  expectedFindings: number;
  detectedFindings: number;
  matchedFindings: number;
  falsePositives: number;
  missedFindings: number;
  note: string;
};

type ExpectedFile = {
  expectedSummary?: Partial<SeveritySummary>;
  expected_summary?: Partial<SeveritySummary>;
  expectedFindings?: unknown[];
  findings?: unknown[];
};

type ReportPaths = {
  json?: string;
  markdown?: string;
};

const emptySummary = (): SeveritySummary => ({
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  info: 0
});

export function getRepoRoot(): string {
  let current = process.cwd();

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

export function getStages(): StageView[] {
  const root = getRepoRoot();
  const ids = readStageOrder(root);

  return ids.map((id) => buildStageView(root, id));
}

export function getStage(input: string): StageView | undefined {
  const normalized = input.trim();
  return getStages().find(
    (stage) =>
      stage.id === normalized ||
      stage.shortId === normalized ||
      stage.number === normalized.padStart(2, "0") ||
      stage.number === normalized
  );
}

export function getReportView(stageInput: string): ReportView | undefined {
  const stage = getStage(stageInput);
  if (!stage) {
    return undefined;
  }

  const root = getRepoRoot();
  const paths = reportPaths(root, stage);
  const comparison = getComparison(root, stage);

  if (!paths.json) {
    return {
      stage,
      command: `pnpm scan -- --stage ${stage.id}`,
      comparison
    };
  }

  const raw = readJson(paths.json);
  const record = recordField(raw);
  const findings = extractFindings(raw).map(normalizeActualFinding).filter((finding) => finding.id);

  return {
    stage,
    command: `pnpm scan -- --stage ${stage.id}`,
    report: {
      path: relativePath(root, paths.json),
      markdownPath: paths.markdown ? relativePath(root, paths.markdown) : undefined,
      generatedAt: optionalString(record.generatedAt ?? record.generated_at),
      scannerName: optionalString(recordField(record.scanner).name),
      scannerMode: optionalString(recordField(record.scanner).mode),
      findings,
      summary: summarizeFindings(findings)
    },
    comparison
  };
}

export function getScoreboardRows(): ScoreboardRow[] {
  const root = getRepoRoot();

  return getStages().map((stage) => {
    const comparison = getComparison(root, stage);

    if (!comparison) {
      return {
        stage,
        status: "PARTIAL",
        recall: 0,
        precision: 0,
        severityAccuracy: 0,
        reportQuality: "Not compared",
        expectedFindings: stage.expectedFindings.length,
        detectedFindings: 0,
        matchedFindings: 0,
        falsePositives: 0,
        missedFindings: stage.expectedFindings.length,
        note: `Run pnpm compare -- --stage ${stage.number}`
      };
    }

    const status = comparison.overall === "PASS" ? "PASS" : comparison.matchedFindings > 0 ? "PARTIAL" : "FAIL";
    const recall = percent(comparison.matchedFindings, comparison.expectedFindings, comparison.missedFindings === 0);
    const precision = percent(
      comparison.matchedFindings,
      comparison.detectedFindings,
      comparison.falsePositives === 0 && comparison.detectedFindings === 0
    );
    const checks = Object.values(comparison.checks);
    const reportQuality = checks.every((check) => check === "pass") ? "Pass" : "Needs review";

    return {
      stage,
      status,
      recall,
      precision,
      severityAccuracy: comparison.severityAccuracy,
      reportQuality,
      expectedFindings: comparison.expectedFindings,
      detectedFindings: comparison.detectedFindings,
      matchedFindings: comparison.matchedFindings,
      falsePositives: comparison.falsePositives,
      missedFindings: comparison.missedFindings,
      note: comparison.overall === "PASS" ? "Benchmark expectations met" : "Open comparison details"
    };
  });
}

export function readLessonKo(stageInput: string): { stage: StageView; content: string; path: string } | undefined {
  const stage = getStage(stageInput);
  if (!stage) {
    return undefined;
  }

  const root = getRepoRoot();
  const filePath = path.join(root, "stages", stage.id, "lesson-ko.md");
  const content = readText(filePath) ?? "lesson-ko.md has not been written for this stage yet.";

  return {
    stage,
    content,
    path: relativePath(root, filePath)
  };
}

export function expectedFindingFor(stage: StageView, finding: ActualFinding): ExpectedFinding | undefined {
  return stage.expectedFindings.find((expected) => expected.id === finding.id);
}

export function severityLabel(summary: SeveritySummary): string {
  const parts = severities.filter((severity) => summary[severity] > 0).map((severity) => `${summary[severity]} ${capitalize(severity)}`);
  return parts.length > 0 ? parts.join(" / ") : "No Critical, High, or Medium findings expected";
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function relativePath(root: string, filePath: string): string {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

function buildStageView(root: string, id: string): StageView {
  const manifest = readYaml<StageManifest>(path.join(root, "stages", id, "manifest.yaml"));
  const expected = readExpectedFile(root, manifest);
  const expectedFindings = normalizeExpectedFindings(expected, manifest);
  const expectedSummary = normalizeSummary(expected.expectedSummary ?? expected.expected_summary);
  const paths = reportPaths(root, { id, shortId: shortStageId(id) });
  const comparison = comparisonPath(root, { id, shortId: shortStageId(id) });
  const topics = unique(expectedFindings.map((finding) => finding.category).filter(Boolean));

  return {
    id: manifest.id,
    shortId: shortStageId(manifest.id),
    number: stageNumber(manifest.id),
    title: manifest.title,
    status: manifest.status,
    focus: manifest.focus,
    difficulty: difficultyFor(manifest.order),
    topics: topics.length > 0 ? topics : [defaultTopic(manifest.order)],
    expectedRisk: severityLabel(expectedSummary),
    expectedSummary,
    expectedFindings,
    targetBaseUrl: manifest.target?.baseUrl ?? "local code stage",
    routes: manifest.target?.routes ?? [],
    services: manifest.services ?? [],
    scanMode: manifest.scanMode ?? "code",
    safety: manifest.safety ?? ["Local-only educational stage."],
    readmeExcerpt: firstMarkdownParagraph(readText(path.join(root, "stages", id, "README.md")) ?? manifest.focus),
    hasReport: Boolean(paths.json),
    hasComparison: Boolean(comparison),
    reportPath: paths.json ? relativePath(root, paths.json) : undefined,
    comparisonPath: comparison ? relativePath(root, comparison) : undefined
  };
}

function readStageOrder(root: string): string[] {
  return readFileSync(path.join(root, "stages", ".stage-order"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readExpectedFile(root: string, manifest: StageManifest): ExpectedFile {
  const stageDirectory = path.join(root, "stages", manifest.id);
  const candidates = [
    manifest.expectedFindingsFile ? path.resolve(stageDirectory, manifest.expectedFindingsFile) : "",
    path.join(root, "expected", `${manifest.id}.expected.yaml`),
    path.join(root, "expected", `${manifest.id}.expected-findings.yaml`),
    path.join(root, "expected", `${shortStageId(manifest.id)}.expected.yaml`)
  ].filter(Boolean);

  const filePath = candidates.find((candidate) => existsSync(candidate));
  return filePath ? readYaml<ExpectedFile>(filePath) : {};
}

function reportPaths(root: string, stage: Pick<StageView, "id" | "shortId">): ReportPaths {
  const flatJson = path.join(root, "reports", "generated", `${stage.shortId}.report.json`);
  const flatMarkdown = path.join(root, "reports", "generated", `${stage.shortId}.report.md`);
  const scaffoldJson = path.join(root, "reports", "generated", stage.id, "bts-sec-report.json");
  const scaffoldMarkdown = path.join(root, "reports", "generated", stage.id, "bts-sec-report.md");

  if (existsSync(flatJson)) {
    return {
      json: flatJson,
      markdown: existsSync(flatMarkdown) ? flatMarkdown : undefined
    };
  }

  if (existsSync(scaffoldJson)) {
    return {
      json: scaffoldJson,
      markdown: existsSync(scaffoldMarkdown) ? scaffoldMarkdown : undefined
    };
  }

  return {};
}

function comparisonPath(root: string, stage: Pick<StageView, "id" | "shortId">): string | undefined {
  const flatJson = path.join(root, "reports", "comparisons", `${stage.shortId}.comparison.json`);
  const legacyJson = path.join(root, "reports", "comparisons", stage.id, "comparison.json");
  if (existsSync(flatJson)) {
    return flatJson;
  }
  return existsSync(legacyJson) ? legacyJson : undefined;
}

function getComparison(root: string, stage: StageView): ComparisonView | undefined {
  const filePath = comparisonPath(root, stage);
  if (!filePath) {
    return undefined;
  }

  const raw = readJson(filePath);
  const record = recordField(raw);

  return {
    path: relativePath(root, filePath),
    overall: stringField(record.overall) === "PASS" ? "PASS" : "FAIL",
    expectedFindings: numberField(record.expectedFindings),
    detectedFindings: numberField(record.detectedFindings),
    matchedFindings: numberField(record.matchedFindings),
    falsePositives: numberField(record.falsePositives),
    missedFindings: numberField(record.missedFindings),
    severityAccuracy: numberField(record.severityAccuracy),
    checks: normalizeChecks(record.checks),
    matches: arrayOfRecords(record.matches).map((match) => ({
      id: stringField(match.id),
      title: stringField(match.title),
      matched: match.matched === true,
      issues: stringArray(match.issues)
    }))
  };
}

function normalizeExpectedFindings(expected: ExpectedFile, manifest: StageManifest): ExpectedFinding[] {
  const rawFindings = expected.findings ?? expected.expectedFindings ?? manifest.intendedVulnerabilities ?? [];

  return arrayOfRecords(rawFindings).map((finding) => ({
    id: stringField(finding.id),
    title: stringField(finding.title),
    severity: severityValue(finding.severity) ?? "info",
    category: stringField(finding.category) || categoryFromId(stringField(finding.id)),
    files: stringArray(finding.files ?? finding.file),
    route: optionalString(finding.route),
    evidence: stringArray(finding.evidence),
    fixSummary: optionalString(finding.fix_summary ?? finding.fixSummary)
  }));
}

function extractFindings(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  const record = recordField(raw);
  for (const key of ["findings", "results", "issues", "vulnerabilities"]) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  return [];
}

function normalizeActualFinding(raw: unknown): ActualFinding {
  const record = recordField(raw);
  const location = recordField(record.location);

  return {
    id: stringField(record.id ?? record.ruleId ?? record.rule_id ?? record.checkId ?? record.check_id),
    title: stringField(record.title ?? record.name ?? record.id),
    severity: severityValue(record.severity),
    category: optionalString(record.category ?? record.type ?? record.cwe),
    file: optionalString(record.file ?? record.path ?? location.file ?? location.path),
    route: optionalString(record.route ?? record.endpoint ?? record.url),
    evidence: stringArray(record.evidence).join("\n") || stringField(record.evidence ?? record.snippet ?? record.proof),
    explanation: stringField(record.explanation ?? record.description ?? record.impact ?? record.summary),
    recommendation: stringField(record.recommendation ?? record.remediation ?? record.fix ?? record.fix_summary)
  };
}

function summarizeFindings(findings: ActualFinding[]): SeveritySummary {
  const summary = emptySummary();
  for (const finding of findings) {
    if (finding.severity) {
      summary[finding.severity] += 1;
    }
  }
  return summary;
}

function normalizeSummary(value: unknown): SeveritySummary {
  const record = recordField(value);
  const summary = emptySummary();
  for (const severity of severities) {
    summary[severity] = numberField(record[severity]);
  }
  return summary;
}

function normalizeChecks(value: unknown): Record<string, string> {
  const record = recordField(value);
  return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, stringField(item)]));
}

function readYaml<T>(filePath: string): T {
  return YAML.parse(readFileSync(filePath, "utf8")) as T;
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8")) as unknown;
}

function readText(filePath: string): string | undefined {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : undefined;
}

function firstMarkdownParagraph(markdown: string): string {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("```"));
  return lines[0] ?? "";
}

function shortStageId(stageId: string): string {
  const match = stageId.match(/^(stage-\d{2})-/);
  return match?.[1] ?? stageId;
}

function stageNumber(stageId: string): string {
  return stageId.match(/^stage-(\d{2})-/)?.[1] ?? "00";
}

function difficultyFor(order: number): string {
  if (order === 0) {
    return "Control";
  }
  if (order <= 2) {
    return "Beginner";
  }
  if (order <= 9) {
    return "Intermediate";
  }
  if (order === 10) {
    return "Advanced chain";
  }
  return "Fixed baseline";
}

function defaultTopic(order: number): string {
  if (order === 0) {
    return "clean-baseline";
  }
  if (order === 11) {
    return "fixed-saas";
  }
  return "security-baseline";
}

function categoryFromId(id: string): string {
  const prefix = id.split("-")[0]?.toLowerCase();
  const names: Record<string, string> = {
    secret: "secrets",
    config: "frontend-config",
    auth: "auth",
    bac: "access-control",
    api: "api-data-exposure",
    xss: "xss",
    file: "file-upload",
    infra: "server-misconfig",
    ai: "ai-risk",
    chain: "chained-saas"
  };
  return names[prefix] ?? "security";
}

function percent(part: number, total: number, emptyPass: boolean): number {
  if (total === 0) {
    return emptyPass ? 1 : 0;
  }
  return part / total;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function recordField(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function arrayOfRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.map(recordField).filter((item) => Object.keys(item).length > 0) : [];
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);
}

function optionalString(value: unknown): string | undefined {
  const text = stringField(value).trim();
  return text ? text : undefined;
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(stringField).filter((item) => item.trim().length > 0);
  }

  const single = optionalString(value);
  return single ? [single] : [];
}

function numberField(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function severityValue(value: unknown): Severity | undefined {
  const normalized = stringField(value).toLowerCase();
  return severities.includes(normalized as Severity) ? (normalized as Severity) : undefined;
}
