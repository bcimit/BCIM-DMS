import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/permissions";
import { UserRole } from "@/generated/prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { role } = body as { role?: string };

  if (!role || !Object.values(UserRole).includes(role as UserRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: role as UserRole },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ data: user });
}
