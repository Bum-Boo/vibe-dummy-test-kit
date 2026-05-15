import { mkdir, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import type { UploadedFile } from "./types.js";

const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg"];

export async function storeUploadPublicly(file: UploadedFile): Promise<string> {
  const filename = file.name;
  const extension = extname(filename).toLowerCase();

  // Stage 10 intentionally vulnerable: weak extension-only validation allows SVG.
  if (!allowedExtensions.includes(extension)) {
    throw new Error("unsupported extension");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir("./public/uploads", { recursive: true });
  await writeFile(`./public/uploads/${filename}`, buffer);

  return `/uploads/${filename}`;
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

