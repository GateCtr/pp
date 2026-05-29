import { NextResponse } from "next/server";
import { getCollectorSession } from "@/lib/auth";

export async function GET() {
  const session = await getCollectorSession();

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  return NextResponse.json(session);
}
