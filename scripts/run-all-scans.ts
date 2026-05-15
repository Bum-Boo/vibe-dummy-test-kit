import { repoRoot, stageIds } from "./shared.js";
import { runScanForStage } from "./run-scan.js";

async function main(): Promise<void> {
  const root = repoRoot();
  const ids = stageIds(root);
  console.log(`Running BTS_sec for ${ids.length} local stages.`);

  for (const id of ids) {
    await runScanForStage(id);
  }

  console.log("All BTS_sec scans completed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
