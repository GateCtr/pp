import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lieuxGeo } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/admin/geo/lieux — create a new lieu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, type, parentId, code } = body;

    if (!nom?.trim() || !type) {
      return NextResponse.json({ error: "Nom et type requis" }, { status: 400 });
    }

    const [lieu] = await db
      .insert(lieuxGeo)
      .values({
        nom: nom.trim(),
        type,
        parentId: parentId || null,
        code: code?.trim() || null,
        actif: true,
      })
      .returning();

    return NextResponse.json(lieu, { status: 201 });
  } catch (error) {
    console.error("[api/admin/geo/lieux] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/admin/geo/lieux — update a lieu
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nom, actif } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const updates: Partial<typeof lieuxGeo.$inferInsert> = {};
    if (nom !== undefined) updates.nom = nom.trim();
    if (actif !== undefined) updates.actif = actif;

    const [lieu] = await db
      .update(lieuxGeo)
      .set(updates)
      .where(eq(lieuxGeo.id, id))
      .returning();

    return NextResponse.json(lieu);
  } catch (error) {
    console.error("[api/admin/geo/lieux] PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/admin/geo/lieux?id=<uuid> — soft delete
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await db
      .update(lieuxGeo)
      .set({ actif: false })
      .where(eq(lieuxGeo.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/geo/lieux] DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
