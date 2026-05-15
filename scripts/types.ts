export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Difficulty = "clean" | "beginner" | "intermediate" | "advanced" | "chained" | "fixed";

export type ExpectedReportRules = {
  must_include: string[];
  must_not_include: string[];
};

export type IntendedVulnerability = {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  file: string;
  line?: number;
  route?: string;
  evidence: string[];
  expected_report: ExpectedReportRules;
  fix_summary: string;
};

export type SafeContrast = {
  id: string;
  title: string;
  file: string;
  line?: number;
  route?: string;
  why_safe: string;
};

export type DemoStep = {
  title: string;
  actor?: string;
  command?: string;
  route?: string;
  expected_result: string;
};

export type StageManifest = {
  schema_version: "1.0";
  stage: string;
  name: string;
  difficulty: Difficulty;
  description: string;
  intended_vulnerabilities: IntendedVulnerability[];
  safe_contrasts: SafeContrast[];
  demo_steps: DemoStep[];
  beginner_summary_ko: string;
  tags?: string[];
  local_only?: boolean;
  deterministic_notes?: string[];
};

export type SeveritySummary = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
};

export type ExpectedFinding = {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  file: string;
  line?: number;
  route?: string;
  evidence: string[];
  must_include: string[];
  must_not_include: string[];
};

export type AllowedFalsePositive = {
  id: string;
  severity: Severity;
  reason: string;
  expires_after_stage?: string;
};

export type SeverityTolerance = {
  default: "exact" | "allow_more_severe" | "allow_less_severe";
  per_finding?: Record<string, "exact" | "allow_more_severe" | "allow_less_severe">;
};

export type ReportQualityChecks = {
  executive_summary_required: boolean;
  plain_language_required: boolean;
  korean_lesson_required: boolean;
  must_include: string[];
  must_not_include: string[];
};

export type ExpectedFindingsFile = {
  schema_version: "1.0";
  stage: string;
  expected_summary: SeveritySummary;
  findings: ExpectedFinding[];
  allowed_false_positives: AllowedFalsePositive[];
  severity_tolerance: SeverityTolerance;
  report_quality_checks: ReportQualityChecks;
};

