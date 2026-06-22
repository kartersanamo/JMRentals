import { canAccessDocument } from "@/lib/documents/access";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveStoredFilePath } from "@/lib/storage";
import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const document = await db.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const allowed = await canAccessDocument(
    session.user.id,
    session.user.role,
    document
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const absolutePath = resolveStoredFilePath(document.filePath);
    const fileBuffer = await readFile(absolutePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${document.fileName.replace(/"/g, "")}"`,
        "Content-Length": String(document.fileSize || fileBuffer.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable." }, { status: 404 });
  }
}
