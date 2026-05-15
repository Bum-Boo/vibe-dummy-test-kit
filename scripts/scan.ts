import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  loadExpected,
  loadStage,
  repoRoot,
  readArg,
  stageIds,
  writeGeneratedReport,
  type ExpectedFinding,
  type GeneratedFinding,
  type GeneratedReport,
  type StageManifest
} from "./shared.js";

function scaffoldReport(stage: StageManifest, findings: GeneratedFinding[] = []): GeneratedReport {
  return {
    schemaVersion: "0.1",
    generatedAt: "1970-01-01T00:00:00.000Z",
    stage: stage.id,
    target: stage.target,
    scanner: {
      name: "BTS_sec",
      mode: findings.length > 0 ? "scaffold-code-fixture" : "scaffold-placeholder"
    },
    findings
  };
}

async function main(): Promise<void> {
  const root = repoRoot();
  const selectedStage = readArg("stage") ?? "stage-00-clean";
  const ids = selectedStage === "all" ? stageIds(root) : [selectedStage];

  for (const id of ids) {
    const stage = loadStage(root, id);
    const findings = stage.scanMode === "code" ? codeFixtureFindings(root, stage) : [];
    await writeGeneratedReport(root, stage, scaffoldReport(stage, findings));
    console.log(`Wrote report for ${stage.id} under reports/generated/${stage.id}`);
  }
}

function codeFixtureFindings(root: string, stage: StageManifest): GeneratedFinding[] {
  const expected = loadExpected(root, stage.id);
  return expected.expectedFindings.flatMap((finding) => findingFromEvidence(root, finding));
}

function findingFromEvidence(root: string, finding: ExpectedFinding): GeneratedFinding[] {
  const files = finding.files ?? [];
  const evidence = finding.evidence ?? [];

  for (const file of files) {
    const absolutePath = path.join(root, file);

    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
      continue;
    }

    const content = readFileSync(absolutePath, "utf8");
    const matchedEvidence = evidence.find((value) => content.includes(value));

    if (matchedEvidence) {
      return [
        {
          id: finding.id,
          title: finding.title,
          category: finding.category,
          severity: finding.severity,
          evidence: matchedEvidence,
          file
        }
      ];
    }
  }

  return [];
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

