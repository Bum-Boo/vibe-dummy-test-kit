import { createDemoFile, createDemoFormData } from "./demo-form-data.js";
import { uploadAvatarSafely } from "./safe-upload-route.js";
import { uploadAvatarVulnerable } from "./vulnerable-upload-route.js";

const harmlessSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"40\"><text x=\"8\" y=\"24\">training svg</text></svg>";
const harmlessPngText = "This is a harmless placeholder for a local PNG-like upload demo.";

async function main(): Promise<void> {
  process.chdir("stages/stage-07-file-upload");

  const vulnerableResult = await uploadAvatarVulnerable(
    createDemoFormData(createDemoFile("student-avatar.svg", "image/svg+xml", harmlessSvg))
  );
  const safeResult = await uploadAvatarSafely(
    createDemoFormData(createDemoFile("student-avatar.png", "image/png", harmlessPngText))
  );

  console.log(
    JSON.stringify(
      {
        vulnerableResult,
        safeResult
      },
      null,
      2
    )
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
