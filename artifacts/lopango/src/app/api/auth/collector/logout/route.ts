import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET - Logout (keep for backward compat but protect from prefetch)
export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("collector-session");
  return NextResponse.redirect(
    new URL("/collecteur/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );
}
