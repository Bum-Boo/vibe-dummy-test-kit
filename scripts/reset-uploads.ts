import { rm, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./shared.js";

const root = repoRoot();
const uploadDirectories = [
  path.join(root, "stages", "stage-07-file-upload", "public", "uploads"),
  path.join(root, "stages", "stage-07-file-upload", "storage", "private", "uploads"),
  path.join(root, "stages", "stage-10-chained-saas", "public", "uploads"),
  path.join(root, "stages", "stage-11-fixed", "storage", "private", "uploads")
];

async function main(): Promise<void> {
  for (const directory of uploadDirectories) {
    const relativePath = path.relative(root, directory);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error(`Refusing to remove path outside repository: ${directory}`);
    }

    await rm(directory, { recursive: true, force: true });
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, ".gitkeep"), "");
    console.log(`Reset ${relativePath}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
