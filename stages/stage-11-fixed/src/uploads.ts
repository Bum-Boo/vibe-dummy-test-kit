import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { issueControlledObjectReference } from "./server-only-config.js";
import type { UploadedFile } from "./types.js";

const maxUploadBytes = 1_000_000;
const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const privateStorageRoot = "./storage/private/uploads";

export async function storeUploadPrivately(file: UploadedFile): Promise<{ objectKey: string; access: "server-mediated" }> {
  if (file.size > maxUploadBytes) {
    throw new Error("file too large");
  }

  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("unsupported MIME type");
  }

  const extension = extname(file.name).toLowerCase();

  if (!allowedExtensions.has(extension)) {
    throw new Error("unsupported extension");
  }

  const serverFilename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = join(privateStorageRoot, serverFilename);

  await mkdir(privateStorageRoot, { recursive: true });
  await writeFile(storagePath, buffer);

  return issueControlledObjectReference(serverFilename);
}

export function createDemoUpload(name: string, type: string, content: string): UploadedFile {
  const buffer = Buffer.from(content, "utf8");

  return {
    name,
    type,
    size: buffer.byteLength,
    async arrayBuffer(): Promise<ArrayBuffer> {
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
  };
}

