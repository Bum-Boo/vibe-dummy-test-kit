import {
  compareReports,
  loadExpected,
  loadStage,
  readArg,
  readGeneratedReport,
  repoRoot,
  stageIds,
  writeComparison
} from "./shared.js";

async function main(): Promise<void> {
  const root = repoRoot();
  const selectedStage = readArg("stage") ?? "stage-00-clean";
  const ids = selectedStage === "all" ? stageIds(root) : [selectedStage];
  const results = [];

  for (const id of ids) {
    const stage = loadStage(root, id);
    const expected = loadExpected(root, id);
    const report = await readGeneratedReport(root, id);
    const result = compareReports(stage, expected, report);
    await writeComparison(root, stage, result);
    results.push(result);
    console.log(`${stage.id}: ${result.passed ? "passed" : "failed"}`);
  }

  if (results.some((result) => !result.passed)) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

