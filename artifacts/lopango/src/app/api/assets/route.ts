import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET - List assets by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "flag" | "seal"

    const query = type
      ? db.select().from(assets).where(eq(assets.type, type)).orderBy(desc(assets.creeLe))
      : db.select().from(assets).orderBy(desc(assets.creeLe));

    const results = await query;
    return NextResponse.json(results);
  } catch (error) {
    console.error("Get assets error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// DELETE - Delete an asset by id
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await db.delete(assets).where(eq(assets.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
