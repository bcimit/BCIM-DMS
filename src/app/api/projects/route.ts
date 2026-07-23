import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getProjectSummaries } from "@/lib/get-project-summaries";

export async function GET() {
  const data = await getProjectSummaries();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, code, location } = body as { name?: string; code?: string; location?: string };

  if (!name?.trim() || !code?.trim()) {
    return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
  }

  const existing = await prisma.project.findUnique({ where: { code: code.trim() } });
  if (existing) {
    return NextResponse.json({ error: `A project with code "${code}" already exists` }, { status: 409 });
  }

  const project = await prisma.project.create({
    data: { name: name.trim(), code: code.trim(), location: location?.trim() || null },
  });

  await prisma.folder.create({
    data: { name: "Construction", path: "/Construction", projectId: project.id },
  });

  return NextResponse.json({ data: project }, { status: 201 });
}
