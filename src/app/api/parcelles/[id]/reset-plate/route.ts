import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST - Reset/supprimer la plaque d'une parcelle (permet de régénérer)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Reset plate data + template assignment (allows re-generation with different template)
    await db
      .update(parcelles)
      .set({
        plaqueImageUrl: null,
        qrCodeUrl: null,
        templateId: null,
        variantIndex: null,
        misAJour: new Date(),
        modifiePar: "admin (reset plaque)",
      })
      .where(eq(parcelles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset plate error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
