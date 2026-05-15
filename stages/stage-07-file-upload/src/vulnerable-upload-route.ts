import { mkdir, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import type { DemoFormData, DemoUploadResult } from "./types.js";

const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg"];

export async function uploadAvatarVulnerable(formData: DemoFormData): Promise<DemoUploadResult> {
  const file = formData.get("file");

  if (!file) {
    return { statusCode: 400, body: { error: "missing file" } };
  }

  const filename = file.name;
  const extension = extname(filename).toLowerCase();

  // Stage 07 intentionally vulnerable: extension-only validation, with SVG allowed.
  if (!allowedExtensions.includes(extension)) {
    return { statusCode: 400, body: { error: "unsupported extension" } };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir("./public/uploads", { recursive: true });

  // Stage 07 intentionally vulnerable: original filename is used under a public web directory.
  // There is no MIME type validation, no file size limit, and no SVG sanitization.
  await writeFile(`./public/uploads/${filename}`, buffer);

  const publicUrl = `/uploads/${filename}`;

  return {
    statusCode: 200,
    body: {
      publicUrl,
      note: "Local demo upload only."
    }
  };
}

