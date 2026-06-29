import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// GET /api/parcelles/check-numero?avenueId=<uuid>&numero=<str>
// Returns { exists: boolean, parcelle?: { id, proprietaireNom } }
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const avenueId = searchParams.get("avenueId");
    const numero = searchParams.get("numero");

    if (!avenueId || !numero) {
      return NextResponse.json(
        { error: "avenueId et numero requis" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({
        id: parcelles.id,
        proprietaireNom: parcelles.proprietaireNom,
        statutValidation: parcelles.statutValidation,
      })
      .from(parcelles)
      .where(
        and(eq(parcelles.avenueId, avenueId), eq(parcelles.numero, numero))
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({
        exists: true,
        parcelle: existing,
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("[api/parcelles/check-numero] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
