import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { statut } = await request.json();

    if (!["valide", "rejete"].includes(statut)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    // Get the parcelle
    const [parcelle] = await db
      .select()
      .from(parcelles)
      .where(eq(parcelles.id, id))
      .limit(1);

    if (!parcelle) {
      return NextResponse.json(
        { error: "Parcelle non trouvée" },
        { status: 404 }
      );
    }

    // Update status only — no plate generation
    // Plate generation is done separately by the admin after assigning a template variant
    await db
      .update(parcelles)
      .set({
        statutValidation: statut,
        dateValidation: new Date(),
        misAJour: new Date(),
        modifiePar: "admin",
      })
      .where(eq(parcelles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Validate parcelle error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
