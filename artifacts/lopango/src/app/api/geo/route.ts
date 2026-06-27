import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lieuxGeo, avenues } from "@/db/schema";
import { eq, and, isNull, ilike } from "drizzle-orm";

// GET /api/geo?type=ville|territoire|commune|...&parentId=<uuid>
// GET /api/geo/avenues?quartierId=<uuid>
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as typeof lieuxGeo.$inferSelect["type"] | null;
    const parentId = searchParams.get("parentId");
    const forAvenues = searchParams.get("avenues");
    const quartierId = searchParams.get("quartierId");

    // Return avenues for a quartier
    if (forAvenues === "1" && quartierId) {
      const rows = await db
        .select()
        .from(avenues)
        .where(and(eq(avenues.quartierId, quartierId), eq(avenues.actif, true)))
        .orderBy(avenues.nom);
      return NextResponse.json(rows);
    }

    // Search across all lieux by name
    const search = searchParams.get("search");
    if (search && search.trim().length >= 2) {
      const rows = await db
        .select()
        .from(lieuxGeo)
        .where(and(eq(lieuxGeo.actif, true), ilike(lieuxGeo.nom, `%${search.trim()}%`)))
        .orderBy(lieuxGeo.nom)
        .limit(30);
      return NextResponse.json(rows);
    }

    // Return top-level lieux (villes + territoires) when no filter
    if (!type && !parentId) {
      const rows = await db
        .select()
        .from(lieuxGeo)
        .where(and(isNull(lieuxGeo.parentId), eq(lieuxGeo.actif, true)))
        .orderBy(lieuxGeo.nom);
      return NextResponse.json(rows);
    }

    const conditions = [eq(lieuxGeo.actif, true)];
    if (type) conditions.push(eq(lieuxGeo.type, type));
    if (parentId) conditions.push(eq(lieuxGeo.parentId, parentId));

    const rows = await db
      .select()
      .from(lieuxGeo)
      .where(and(...conditions))
      .orderBy(lieuxGeo.nom);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[api/geo] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
