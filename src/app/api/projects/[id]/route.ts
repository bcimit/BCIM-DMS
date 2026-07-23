import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, code, location } = body as { name?: string; code?: string; location?: string | null };

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (code !== undefined && code.trim() !== project.code) {
    const existing = await prisma.project.findUnique({ where: { code: code.trim() } });
    if (existing) {
      return NextResponse.json({ error: `A project with code "${code}" already exists` }, { status: 409 });
    }
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(code !== undefined ? { code: code.trim() } : {}),
      ...(location !== undefined ? { location: location?.trim() || null } : {}),
    },
  });

  return NextResponse.json({ data: updated });
}
