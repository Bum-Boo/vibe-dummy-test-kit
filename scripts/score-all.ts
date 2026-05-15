import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { compareStageReport, type BenchmarkComparison } from "./compare-report.js";
import { repoRoot, stageIds } from "./shared.js";

type ScoreRow =
  | {
      stage: string;
      status: "passed" | "failed";
      expectedFindings: number;
      detectedFindings: number;
      matchedFindings: number;
      falsePositives: number;
      missedFindings: number;
      severityAccuracy: number;
    }
  | {
      stage: string;
      status: "not_scanned";
      expectedFindings: 0;
      detectedFindings: 0;
      matchedFindings: 0;
      falsePositives: 0;
      missedFindings: 0;
      severityAccuracy: 0;
    };

type Scorecard = {
  schemaVersion: "0.1";
  generatedAt: string;
  passed: number;
  failed: number;
  notScanned: number;
  totalStages: number;
  rows: ScoreRow[];
};

async function main(): Promise<void> {
  const root = repoRoot();
  const asJson = process.argv.includes("--json");
  const rows: ScoreRow[] = [];

  for (const id of stageIds(root)) {
    try {
      const comparison = await compareStageReport(id);
      rows.push(rowFromComparison(comparison));
    } catch (error) {
      if (isMissingReportError(error)) {
        rows.push(notScannedRow(id));
        continue;
      }

      throw error;
    }
  }

  const scorecard = buildScorecard(rows);
  await writeScorecard(root, scorecard);

  if (asJson) {
    console.log(JSON.stringify(scorecard, null, 2));
  } else {
    console.log(`Score: ${scorecard.passed}/${scorecard.totalStages} stages passed.`);
    if (scorecard.failed > 0 || scorecard.notScanned > 0) {
      console.log(`Failed: ${scorecard.failed}; Not scanned: ${scorecard.notScanned}`);
    }
  }

  if (scorecard.failed > 0) {
    process.exitCode = 1;
  }
}

function rowFromComparison(comparison: BenchmarkComparison): ScoreRow {
  return {
    stage: comparison.stage,
    status: comparison.overall === "PASS" ? "passed" : "failed",
    expectedFindings: comparison.expectedFindings,
    detectedFindings: comparison.detectedFindings,
    matchedFindings: comparison.matchedFindings,
    falsePositives: comparison.falsePositives,
    missedFindings: comparison.missedFindings,
    severityAccuracy: comparison.severityAccuracy
  };
}

function notScannedRow(stage: string): ScoreRow {
  return {
    stage,
    status: "not_scanned",
    expectedFindings: 0,
    detectedFindings: 0,
    matchedFindings: 0,
    falsePositives: 0,
    missedFindings: 0,
    severityAccuracy: 0
  };
}

function buildScorecard(rows: ScoreRow[]): Scorecard {
  return {
    schemaVersion: "0.1",
    generatedAt: new Date(0).toISOString(),
    passed: rows.filter((row) => row.status === "passed").length,
    failed: rows.filter((row) => row.status === "failed").length,
    notScanned: rows.filter((row) => row.status === "not_scanned").length,
    totalStages: rows.length,
    rows
  };
}

async function writeScorecard(root: string, scorecard: Scorecard): Promise<void> {
  const directory = path.join(root, "reports", "comparisons");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "scorecard.json"), `${JSON.stringify(scorecard, null, 2)}\n`);
  await writeFile(path.join(directory, "scorecard.md"), renderScorecard(scorecard));
}

function renderScorecard(scorecard: Scorecard): string {
  const rows = scorecard.rows
    .map(
      (row) =>
        `| ${row.stage} | ${row.status} | ${row.expectedFindings} | ${row.detectedFindings} | ${row.matchedFindings} | ${row.falsePositives} | ${row.missedFindings} | ${Math.round(row.severityAccuracy * 100)}% |`
    )
    .join("\n");

  return `# BTS-Sec Benchmark Scorecard

- Generated at: ${scorecard.generatedAt}
- Passed stages: ${scorecard.passed}
- Failed stages: ${scorecard.failed}
- Not scanned: ${scorecard.notScanned}
- Total stages: ${scorecard.totalStages}

| Stage | Status | Expected | Detected | Matched | False positives | Missed | Severity accuracy |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}
`;
}

function isMissingReportError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("Generated report not found");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

