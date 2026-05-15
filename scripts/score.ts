import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  compareReports,
  generatedJsonPath,
  loadExpected,
  loadStage,
  readGeneratedReport,
  repoRoot,
  stageIds
} from "./shared.js";

async function main(): Promise<void> {
  const root = repoRoot();
  const rows = [];

  for (const id of stageIds(root)) {
    const stage = loadStage(root, id);

    if (!existsSync(generatedJsonPath(root, id))) {
      rows.push({ stage: id, status: "not_scanned", expectedCount: 0, foundCount: 0 });
      continue;
    }

    const expected = loadExpected(root, id);
    const report = await readGeneratedReport(root, id);
    const result = compareReports(stage, expected, report);
    rows.push({
      stage: id,
      status: result.passed ? "passed" : "failed",
      expectedCount: result.expectedCount,
      foundCount: result.foundCount
    });
  }

  const outputDir = path.join(root, "reports", "comparisons");
  const passed = rows.filter((row) => row.status === "passed").length;
  const scorecard = {
    schemaVersion: "0.1",
    generatedAt: "1970-01-01T00:00:00.000Z",
    passed,
    totalStages: rows.length,
    rows
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "scorecard.json"), `${JSON.stringify(scorecard, null, 2)}\n`);
  await writeFile(path.join(outputDir, "scorecard.md"), renderScorecard(scorecard));

  console.log(`Score: ${passed}/${rows.length} stages passed.`);
}

function renderScorecard(scorecard: {
  generatedAt: string;
  passed: number;
  totalStages: number;
  rows: Array<{ stage: string; status: string; expectedCount: number; foundCount: number }>;
}): string {
  const rows = scorecard.rows
    .map((row) => `| ${row.stage} | ${row.status} | ${row.expectedCount} | ${row.foundCount} |`)
    .join("\n");

  return `# BTS_sec Scorecard

- Generated at: ${scorecard.generatedAt}
- Passed stages: ${scorecard.passed}
- Total stages: ${scorecard.totalStages}

| Stage | Status | Expected | Found |
| --- | --- | ---: | ---: |
${rows}
`;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

