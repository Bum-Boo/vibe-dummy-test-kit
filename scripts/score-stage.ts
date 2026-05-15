import { compareStageReport, renderComparisonText } from "./compare-report.js";
import { readArg } from "./shared.js";

async function main(): Promise<void> {
  const stage = readArg("stage") ?? process.env.STAGE ?? "00";
  const comparison = await compareStageReport(stage);
  console.log(renderComparisonText(comparison));

  if (comparison.overall !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

