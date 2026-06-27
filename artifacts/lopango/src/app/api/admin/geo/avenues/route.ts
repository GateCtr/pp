import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { avenues } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/admin/geo/avenues — create a new avenue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, quartierId } = body;

    if (!nom?.trim() || !quartierId) {
      return NextResponse.json(
        { error: "Nom et ID du quartier requis" },
        { status: 400 }
      );
    }

    const [avenue] = await db
      .insert(avenues)
      .values({
        nom: nom.trim(),
        quartierId,
        actif: true,
      })
      .returning();

    return NextResponse.json(avenue, { status: 201 });
  } catch (error) {
    console.error("[api/admin/geo/avenues] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/admin/geo/avenues — update an avenue
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nom, actif } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const updates: Partial<typeof avenues.$inferInsert> = {};
    if (nom !== undefined) updates.nom = nom.trim();
    if (actif !== undefined) updates.actif = actif;

    const [avenue] = await db
      .update(avenues)
      .set(updates)
      .where(eq(avenues.id, id))
      .returning();

    return NextResponse.json(avenue);
  } catch (error) {
    console.error("[api/admin/geo/avenues] PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/admin/geo/avenues?id=<uuid> — soft delete
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await db.update(avenues).set({ actif: false }).where(eq(avenues.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/geo/avenues] DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
