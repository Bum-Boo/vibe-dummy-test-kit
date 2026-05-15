import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { generatedJsonPath, loadStage, repoRoot, stageIds, type StageManifest } from "./shared.js";
import { outputPaths, resolveStage, type ResolvedStage } from "./run-scan.js";

type Severity = "critical" | "high" | "medium" | "low" | "info";
type CheckStatus = "pass" | "fail" | "not_configured";

type NormalizedExpectedFinding = {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  files: string[];
  route?: string;
  evidence: string[];
  mustInclude: string[];
  mustNotInclude: string[];
  fixSummary?: string;
};

type NormalizedExpected = {
  stage: string;
  expectedSummary: Record<Severity, number>;
  findings: NormalizedExpectedFinding[];
  allowedFalsePositiveIds: Set<string>;
  severityTolerance: {
    default: SeverityTolerance;
    perFinding: Record<string, SeverityTolerance>;
  };
  reportQualityChecks: {
    executiveSummaryRequired: boolean;
    plainLanguageRequired: boolean;
    koreanLessonRequired: boolean;
    mustInclude: string[];
    mustNotInclude: string[];
  };
};

type SeverityTolerance = "exact" | "allow_more_severe" | "allow_less_severe";

type NormalizedFinding = {
  id: string;
  title: string;
  severity?: Severity;
  category?: string;
  file?: string;
  route?: string;
  evidence: string;
  recommendation: string;
  explanation: string;
  raw: unknown;
};

type ReportSource = {
  jsonPath: string;
  markdownPath?: string;
  logPath?: string;
  kind: "flat" | "scaffold";
};

export type FindingMatch = {
  id: string;
  title: string;
  matched: boolean;
  severityMatch: boolean;
  categoryMatch: boolean;
  fileMatch: boolean;
  routeMatch: boolean | "not_applicable";
  evidenceMatch: boolean;
  requiredPhrasesPass: boolean;
  forbiddenPhrasesPass: boolean;
  recommendationPass: boolean | "not_configured";
  actual?: {
    severity?: Severity;
    category?: string;
    file?: string;
    route?: string;
  };
  issues: string[];
};

export type BenchmarkComparison = {
  schemaVersion: "0.1";
  stage: string;
  stageShort: string;
  reportPath: string;
  markdownReportPath?: string;
  expectedFindings: number;
  detectedFindings: number;
  matchedFindings: number;
  falsePositives: number;
  missedFindings: number;
  severityAccuracy: number;
  checks: {
    evidenceQuality: CheckStatus;
    recommendationQuality: CheckStatus;
    plainLanguageExplanation: CheckStatus;
    requiredReportPhrases: CheckStatus;
    forbiddenWrongExplanations: CheckStatus;
  };
  overall: "PASS" | "FAIL";
  matches: FindingMatch[];
  missed: string[];
  unexpected: Array<{ id: string; title: string; severity?: Severity; category?: string; file?: string }>;
  allowedFalsePositives: string[];
};

export async function compareStageReport(stageInput: string): Promise<BenchmarkComparison> {
  const root = repoRoot();
  const resolvedStage = resolveStage(root, stageInput);
  const stage = loadStage(root, resolvedStage.id);
  const expected = loadExpectedForComparison(root, stage);
  const reportSource = resolveReportSource(root, resolvedStage);
  const { findings, reportText } = await readActualReport(reportSource);
  const comparison = compareExpectedToActual(resolvedStage, expected, findings, reportText, reportSource);
  await writeComparisonFiles(root, comparison);
  return comparison;
}

export function renderComparisonText(comparison: BenchmarkComparison): string {
  const severityAccuracy = `${Math.round(comparison.severityAccuracy * 100)}%`;
  const overall = comparison.overall;

  return `BTS-Sec Benchmark Result: ${displayStage(comparison.stageShort)}

Expected findings: ${comparison.expectedFindings}
Detected findings: ${comparison.detectedFindings}
Matched findings: ${comparison.matchedFindings}
False positives: ${comparison.falsePositives}
Missed findings: ${comparison.missedFindings}

Severity accuracy: ${severityAccuracy}
Evidence quality: ${labelCheck(comparison.checks.evidenceQuality)}
Recommendation quality: ${labelCheck(comparison.checks.recommendationQuality)}
Plain-language explanation: ${labelCheck(comparison.checks.plainLanguageExplanation)}

Overall: ${overall}
`;
}

export function renderComparisonMarkdown(comparison: BenchmarkComparison): string {
  const rows = comparison.matches
    .map((match) => {
      const status = match.matched && match.issues.length === 0 ? "pass" : "fail";
      const issues = match.issues.length === 0 ? "None" : match.issues.join("; ");
      return `| ${match.id} | ${status} | ${match.actual?.severity ?? "-"} | ${issues} |`;
    })
    .join("\n");
  const unexpected =
    comparison.unexpected.length === 0
      ? "- None"
      : comparison.unexpected.map((finding) => `- ${finding.id}: ${finding.title}`).join("\n");
  const missed = comparison.missed.length === 0 ? "- None" : comparison.missed.map((id) => `- ${id}`).join("\n");

  return `# BTS-Sec Benchmark Result: ${displayStage(comparison.stageShort)}

- Expected findings: ${comparison.expectedFindings}
- Detected findings: ${comparison.detectedFindings}
- Matched findings: ${comparison.matchedFindings}
- False positives: ${comparison.falsePositives}
- Missed findings: ${comparison.missedFindings}
- Severity accuracy: ${Math.round(comparison.severityAccuracy * 100)}%
- Evidence quality: ${labelCheck(comparison.checks.evidenceQuality)}
- Recommendation quality: ${labelCheck(comparison.checks.recommendationQuality)}
- Plain-language explanation: ${labelCheck(comparison.checks.plainLanguageExplanation)}
- Overall: ${comparison.overall}

## Finding Checks

| ID | Status | Actual Severity | Issues |
| --- | --- | --- | --- |
${rows || "| - | pass | - | No expected findings |"}

## Missed Findings

${missed}

## False Positives

${unexpected}

## Report Source

- JSON: ${comparison.reportPath}
${comparison.markdownReportPath ? `- Markdown: ${comparison.markdownReportPath}\n` : ""}
`;
}

function compareExpectedToActual(
  stage: ResolvedStage,
  expected: NormalizedExpected,
  actualFindings: NormalizedFinding[],
  reportText: string,
  reportSource: ReportSource
): BenchmarkComparison {
  const actualById = new Map(actualFindings.map((finding) => [finding.id, finding]));
  const matches = expected.findings.map((finding) =>
    compareFinding(finding, actualById.get(finding.id), expected.severityTolerance, reportText)
  );
  const expectedIds = new Set(expected.findings.map((finding) => finding.id));
  const allowedFalsePositives = actualFindings
    .filter((finding) => !expectedIds.has(finding.id) && expected.allowedFalsePositiveIds.has(finding.id))
    .map((finding) => finding.id);
  const unexpected = actualFindings
    .filter((finding) => !expectedIds.has(finding.id) && !expected.allowedFalsePositiveIds.has(finding.id))
    .map((finding) => ({
      id: finding.id,
      title: finding.title,
      severity: finding.severity,
      category: finding.category,
      file: finding.file
    }));
  const missed = matches.filter((match) => !match.matched).map((match) => match.id);
  const matched = matches.filter((match) => match.matched);
  const severityMatches = matched.filter((match) => match.severityMatch).length;
  const severityAccuracy = matched.length === 0 ? 1 : severityMatches / matched.length;
  const checks = reportChecks(expected, matches, reportText);
  const allFindingChecksPass = matches.every((match) => match.matched && match.issues.length === 0);
  const allQualityChecksPass = Object.values(checks).every((status) => status !== "fail");
  const overall = missed.length === 0 && unexpected.length === 0 && allFindingChecksPass && allQualityChecksPass ? "PASS" : "FAIL";

  return {
    schemaVersion: "0.1",
    stage: stage.id,
    stageShort: stage.shortId,
    reportPath: reportSource.jsonPath,
    markdownReportPath: reportSource.markdownPath,
    expectedFindings: expected.findings.length,
    detectedFindings: actualFindings.length,
    matchedFindings: matched.length,
    falsePositives: unexpected.length,
    missedFindings: missed.length,
    severityAccuracy,
    checks,
    overall,
    matches,
    missed,
    unexpected,
    allowedFalsePositives
  };
}

function compareFinding(
  expected: NormalizedExpectedFinding,
  actual: NormalizedFinding | undefined,
  severityTolerance: NormalizedExpected["severityTolerance"],
  reportText: string
): FindingMatch {
  const issues: string[] = [];

  if (!actual) {
    return {
      id: expected.id,
      title: expected.title,
      matched: false,
      severityMatch: false,
      categoryMatch: false,
      fileMatch: false,
      routeMatch: expected.route ? false : "not_applicable",
      evidenceMatch: false,
      requiredPhrasesPass: false,
      forbiddenPhrasesPass: false,
      recommendationPass: expected.fixSummary ? false : "not_configured",
      issues: ["Expected finding was not detected."]
    };
  }

  const severityMatch = severityMatches(expected.severity, actual.severity, severityTolerance.perFinding[expected.id] ?? severityTolerance.default);
  const categoryMatch = !expected.category || normalizeText(actual.category) === normalizeText(expected.category);
  const fileMatch = expected.files.length === 0 || expected.files.some((file) => fileMatches(file, actual.file));
  const routeMatch = !expected.route || !actual.route ? "not_applicable" : normalizeText(expected.route) === normalizeText(actual.route);
  const evidenceMatch = evidenceMatches(expected.evidence, actual.evidence);
  const requiredPhrasesPass = containsAll(reportText, expected.mustInclude);
  const forbiddenPhrasesPass = containsNone(reportText, expected.mustNotInclude);
  const recommendationPass = expected.fixSummary ? hasUsefulRecommendation(actual, reportText) : "not_configured";

  if (!severityMatch) {
    issues.push(`Severity mismatch: expected ${expected.severity}, got ${actual.severity ?? "missing"}.`);
  }
  if (!categoryMatch) {
    issues.push(`Category mismatch: expected ${expected.category}, got ${actual.category ?? "missing"}.`);
  }
  if (!fileMatch) {
    issues.push(`File mismatch: expected one of ${expected.files.join(", ")}, got ${actual.file ?? "missing"}.`);
  }
  if (routeMatch === false) {
    issues.push(`Route mismatch: expected ${expected.route}, got ${actual.route ?? "missing"}.`);
  }
  if (!evidenceMatch) {
    issues.push("Evidence did not include expected signal.");
  }
  if (!requiredPhrasesPass) {
    issues.push("Required report phrase missing.");
  }
  if (!forbiddenPhrasesPass) {
    issues.push("Forbidden explanation appeared in report.");
  }
  if (recommendationPass === false) {
    issues.push("Recommendation or fix guidance was missing.");
  }

  return {
    id: expected.id,
    title: expected.title,
    matched: true,
    severityMatch,
    categoryMatch,
    fileMatch,
    routeMatch,
    evidenceMatch,
    requiredPhrasesPass,
    forbiddenPhrasesPass,
    recommendationPass,
    actual: {
      severity: actual.severity,
      category: actual.category,
      file: actual.file,
      route: actual.route
    },
    issues
  };
}

function reportChecks(
  expected: NormalizedExpected,
  matches: FindingMatch[],
  reportText: string
): BenchmarkComparison["checks"] {
  const evidenceQuality = matches.every((match) => match.evidenceMatch) ? "pass" : "fail";
  const recommendationConfigured = matches.some((match) => match.recommendationPass !== "not_configured");
  const recommendationQuality = !recommendationConfigured
    ? "pass"
    : matches.every((match) => match.recommendationPass !== false)
      ? "pass"
      : "fail";
  const requiredReportPhrases = containsAll(reportText, expected.reportQualityChecks.mustInclude) ? "pass" : "fail";
  const forbiddenWrongExplanations = containsNone(reportText, expected.reportQualityChecks.mustNotInclude) ? "pass" : "fail";
  const plainLanguageExplanation = expected.reportQualityChecks.plainLanguageRequired
    ? hasPlainLanguage(reportText)
      ? "pass"
      : "fail"
    : "pass";

  return {
    evidenceQuality,
    recommendationQuality,
    plainLanguageExplanation,
    requiredReportPhrases,
    forbiddenWrongExplanations
  };
}

function loadExpectedForComparison(root: string, stage: StageManifest): NormalizedExpected {
  const stageDirectory = path.join(root, "stages", stage.id);
  const expectedPath = stage.expectedFindingsFile
    ? path.resolve(stageDirectory, stage.expectedFindingsFile)
    : path.join(root, "expected", `${stage.id}.expected.yaml`);

  if (!existsSync(expectedPath)) {
    throw new Error(`Expected findings file not found: ${expectedPath}`);
  }

  const raw = YAML.parse(readFileSync(expectedPath, "utf8")) as Record<string, unknown>;
  const standardFindings = arrayOfRecords(raw.findings);
  const legacyFindings = arrayOfRecords(raw.expectedFindings);
  const findings = (standardFindings.length > 0 ? standardFindings : legacyFindings).map(normalizeExpectedFinding);
  const allowedFalsePositiveIds = new Set(
    arrayOfRecords(raw.allowed_false_positives ?? raw.allowedFalsePositives).map((item) => stringField(item.id))
  );
  const quality = recordField(raw.report_quality_checks ?? raw.reportQualityChecks);
  const tolerance = recordField(raw.severity_tolerance ?? raw.severityTolerance);

  return {
    stage: stringField(raw.stage),
    expectedSummary: normalizeSummary(raw.expected_summary ?? raw.expectedSummary),
    findings,
    allowedFalsePositiveIds,
    severityTolerance: {
      default: toleranceValue(tolerance.default) ?? "exact",
      perFinding: normalizePerFindingTolerance(tolerance.per_finding ?? tolerance.perFinding)
    },
    reportQualityChecks: {
      executiveSummaryRequired: booleanField(quality.executive_summary_required ?? quality.executiveSummaryRequired),
      plainLanguageRequired: booleanField(quality.plain_language_required ?? quality.plainLanguageRequired),
      koreanLessonRequired: booleanField(quality.korean_lesson_required ?? quality.koreanLessonRequired),
      mustInclude: stringArray(quality.must_include ?? quality.mustInclude),
      mustNotInclude: stringArray(quality.must_not_include ?? quality.mustNotInclude)
    }
  };
}

function normalizeExpectedFinding(item: Record<string, unknown>): NormalizedExpectedFinding {
  const report = recordField(item.expected_report ?? item.expectedReport);
  return {
    id: stringField(item.id),
    title: stringField(item.title),
    severity: severityValue(item.severity) ?? "info",
    category: stringField(item.category),
    files: normalizeFiles(item),
    route: optionalString(item.route),
    evidence: stringArray(item.evidence),
    mustInclude: stringArray(item.must_include ?? item.mustInclude ?? report.must_include ?? report.mustInclude),
    mustNotInclude: stringArray(item.must_not_include ?? item.mustNotInclude ?? report.must_not_include ?? report.mustNotInclude),
    fixSummary: optionalString(item.fix_summary ?? item.fixSummary)
  };
}

function normalizeFiles(item: Record<string, unknown>): string[] {
  const files = stringArray(item.files);
  const file = optionalString(item.file);
  return file ? [file, ...files] : files;
}

function resolveReportSource(root: string, stage: ResolvedStage): ReportSource {
  const flat = outputPaths(root, stage);
  const scaffoldJson = generatedJsonPath(root, stage.id);
  const scaffoldMarkdown = path.join(path.dirname(scaffoldJson), "bts-sec-report.md");

  if (existsSync(flat.json)) {
    return {
      jsonPath: flat.json,
      markdownPath: existsSync(flat.markdown) ? flat.markdown : undefined,
      logPath: existsSync(flat.log) ? flat.log : undefined,
      kind: "flat"
    };
  }

  if (existsSync(scaffoldJson)) {
    return {
      jsonPath: scaffoldJson,
      markdownPath: existsSync(scaffoldMarkdown) ? scaffoldMarkdown : undefined,
      kind: "scaffold"
    };
  }

  throw new Error(
    [
      `Generated report not found for ${stage.id}.`,
      `Run: make scan STAGE=${stage.shortId.replace("stage-", "")}`,
      "If BTS_sec is not installed yet, run the deterministic scaffold generator instead:",
      `  pnpm scan -- --stage ${stage.id}`
    ].join("\n")
  );
}

async function readActualReport(source: ReportSource): Promise<{ findings: NormalizedFinding[]; reportText: string }> {
  const jsonText = await readFile(source.jsonPath, "utf8");
  const markdownText = source.markdownPath && existsSync(source.markdownPath) ? await readFile(source.markdownPath, "utf8") : "";
  const raw = JSON.parse(jsonText) as unknown;
  const findings = extractFindings(raw).map(normalizeActualFinding).filter((finding) => finding.id);
  const reportText = `${jsonText}\n${markdownText}`;
  return { findings, reportText };
}

function extractFindings(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  const record = recordField(raw);
  for (const key of ["findings", "results", "issues", "vulnerabilities"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function normalizeActualFinding(raw: unknown): NormalizedFinding {
  const record = recordField(raw);
  const location = recordField(record.location);
  const id = stringField(record.id ?? record.ruleId ?? record.rule_id ?? record.checkId ?? record.check_id);
  const evidence = stringArray(record.evidence).join("\n") || stringField(record.evidence ?? record.snippet ?? record.proof);
  const recommendation = stringField(record.recommendation ?? record.remediation ?? record.fix ?? record.fix_summary);
  const explanation = stringField(record.explanation ?? record.description ?? record.impact ?? record.summary ?? record.title);

  return {
    id,
    title: stringField(record.title ?? record.name ?? id),
    severity: severityValue(record.severity),
    category: optionalString(record.category ?? record.type ?? record.cwe),
    file: optionalString(record.file ?? record.path ?? location.file ?? location.path),
    route: optionalString(record.route ?? record.endpoint ?? record.url),
    evidence,
    recommendation,
    explanation,
    raw
  };
}

async function writeComparisonFiles(root: string, comparison: BenchmarkComparison): Promise<void> {
  const directory = path.join(root, "reports", "comparisons");
  await mkdir(directory, { recursive: true });
  const jsonPath = path.join(directory, `${comparison.stageShort}.comparison.json`);
  const markdownPath = path.join(directory, `${comparison.stageShort}.comparison.md`);
  await writeFile(jsonPath, `${JSON.stringify(comparison, null, 2)}\n`);
  await writeFile(markdownPath, renderComparisonMarkdown(comparison));
}

function severityMatches(expected: Severity, actual: Severity | undefined, tolerance: SeverityTolerance): boolean {
  if (!actual) {
    return false;
  }

  const expectedRank = severityRank(expected);
  const actualRank = severityRank(actual);

  if (tolerance === "allow_more_severe") {
    return actualRank >= expectedRank;
  }

  if (tolerance === "allow_less_severe") {
    return actualRank <= expectedRank;
  }

  return actual === expected;
}

function severityRank(severity: Severity): number {
  return { info: 0, low: 1, medium: 2, high: 3, critical: 4 }[severity];
}

function fileMatches(expected: string, actual: string | undefined): boolean {
  if (!actual) {
    return false;
  }

  const left = normalizePath(expected);
  const right = normalizePath(actual);
  return left === right || left.endsWith(right) || right.endsWith(left);
}

function evidenceMatches(expectedEvidence: string[], actualEvidence: string): boolean {
  if (expectedEvidence.length === 0) {
    return actualEvidence.trim().length > 0;
  }

  const normalizedActual = normalizeText(actualEvidence);
  return expectedEvidence.some((expected) => normalizedActual.includes(normalizeText(expected)));
}

function containsAll(text: string, phrases: string[]): boolean {
  const normalized = normalizeText(text);
  return phrases.every((phrase) => normalized.includes(normalizeText(phrase)));
}

function containsNone(text: string, phrases: string[]): boolean {
  const normalized = normalizeText(text);
  return phrases.every((phrase) => !normalized.includes(normalizeText(phrase)));
}

function hasUsefulRecommendation(finding: NormalizedFinding, reportText: string): boolean {
  return finding.recommendation.trim().length > 0 || /\b(fix|recommend|remediate|mitigate|should|use|add|remove|restrict|sanitize)\b/i.test(reportText);
}

function hasPlainLanguage(text: string): boolean {
  return /\b(risk|impact|because|user|attacker|can|may|plain|means|why)\b/i.test(text);
}

function normalizePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.\//, "").toLowerCase();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

function labelCheck(status: CheckStatus): string {
  return status === "pass" ? "Pass" : status === "fail" ? "Fail" : "Not configured";
}

function displayStage(shortStage: string): string {
  const match = shortStage.match(/^stage-(\d{2})$/);
  return match ? `Stage ${match[1]}` : shortStage;
}

function normalizeSummary(value: unknown): Record<Severity, number> {
  const record = recordField(value);
  return {
    critical: numberField(record.critical),
    high: numberField(record.high),
    medium: numberField(record.medium),
    low: numberField(record.low),
    info: numberField(record.info)
  };
}

function normalizePerFindingTolerance(value: unknown): Record<string, SeverityTolerance> {
  const record = recordField(value);
  const normalized: Record<string, SeverityTolerance> = {};

  for (const [key, item] of Object.entries(record)) {
    const tolerance = toleranceValue(item);
    if (tolerance) {
      normalized[key] = tolerance;
    }
  }

  return normalized;
}

function severityValue(value: unknown): Severity | undefined {
  const normalized = normalizeText(value);
  return ["critical", "high", "medium", "low", "info"].includes(normalized) ? (normalized as Severity) : undefined;
}

function toleranceValue(value: unknown): SeverityTolerance | undefined {
  const normalized = normalizeText(value);
  return ["exact", "allow_more_severe", "allow_less_severe"].includes(normalized)
    ? (normalized as SeverityTolerance)
    : undefined;
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
  return text.length > 0 ? text : undefined;
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

function booleanField(value: unknown): boolean {
  return value === true;
}

async function main(): Promise<void> {
  const stage = process.argv.includes("--stage") ? process.argv[process.argv.indexOf("--stage") + 1] : undefined;
  const selectedStage = stage && !stage.startsWith("--") ? stage : "00";
  const comparison = await compareStageReport(selectedStage);
  console.log(renderComparisonText(comparison));

  if (comparison.overall !== "PASS") {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
