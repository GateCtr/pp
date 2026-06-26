import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST - Archive a parcelle (soft-delete: set statut to 'rejete')
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db
      .update(parcelles)
      .set({
        statutValidation: "rejete",
        misAJour: new Date(),
        modifiePar: "admin (archivé)",
        motifModification: "Archivé par l'administrateur",
      })
      .where(eq(parcelles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Archive parcelle error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// DELETE - Permanently delete a parcelle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.delete(parcelles).where(eq(parcelles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete parcelle error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
