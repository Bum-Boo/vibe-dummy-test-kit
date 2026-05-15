import type { DemoFormData, UploadedFile } from "./types.js";

export function createDemoFile(name: string, type: string, content: string): UploadedFile {
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

export function createDemoFormData(file: UploadedFile): DemoFormData {
  return {
    get(name: string): UploadedFile | null {
      return name === "file" ? file : null;
    }
  };
}

