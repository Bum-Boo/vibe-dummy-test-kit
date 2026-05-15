import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { DemoFormData, DemoUploadResult } from "./types.js";

const maxUploadBytes = 1_000_000;
const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const privateStorageRoot = "./storage/private/uploads";

export async function uploadAvatarSafely(formData: DemoFormData): Promise<DemoUploadResult> {
  const file = formData.get("file");

  if (!file) {
    return { statusCode: 400, body: { error: "missing file" } };
  }

  if (file.size > maxUploadBytes) {
    return { statusCode: 413, body: { error: "file too large" } };
  }

  if (!allowedMimeTypes.has(file.type)) {
    return { statusCode: 400, body: { error: "unsupported MIME type" } };
  }

  const extension = extname(file.name).toLowerCase();

  if (!allowedExtensions.has(extension)) {
    return { statusCode: 400, body: { error: "unsupported extension" } };
  }

  const serverFilename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = join(privateStorageRoot, serverFilename);

  await mkdir(privateStorageRoot, { recursive: true });
  await writeFile(storagePath, buffer);

  return {
    statusCode: 200,
    body: {
      objectKey: serverFilename,
      storage: "local-private-storage",
      publicUrl: null
    }
  };
}

