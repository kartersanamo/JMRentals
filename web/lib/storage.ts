import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function getUploadRoot(): string {
  return process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "data", "uploads");
}

export function resolveStoredFilePath(relativePath: string): string {
  const root = path.resolve(getUploadRoot());
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("INVALID_FILE_PATH");
  }
  return resolved;
}

export function validateUploadFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!file || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File must be 10 MB or smaller." };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Allowed types: PDF, Word, JPEG, PNG, or WebP.",
    };
  }
  return { ok: true };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "document";
}

export async function saveUploadedFile(file: File): Promise<{
  relativePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}> {
  const validation = validateUploadFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const fileName = sanitizeFileName(file.name);
  const extension = path.extname(fileName) || "";
  const relativePath = path.join(
    new Date().getFullYear().toString(),
    `${randomUUID()}${extension}`
  );
  const absolutePath = resolveStoredFilePath(relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    relativePath,
    fileName,
    mimeType: file.type,
    fileSize: file.size,
  };
}
