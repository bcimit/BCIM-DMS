import { NextResponse } from "next/server";
import { getProjectSummaries } from "@/lib/get-project-summaries";

export async function GET() {
  const data = await getProjectSummaries();
  return NextResponse.json({ data });
}
