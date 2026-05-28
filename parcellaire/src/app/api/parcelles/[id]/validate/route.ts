import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePlate } from "@/lib/plate-generator";

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

    // Update status
    const updateData: Record<string, unknown> = {
      statutValidation: statut,
      dateValidation: new Date(),
    };

    // If validated, generate plate
    if (statut === "valide") {
      const { plaqueUrl, qrCodeUrl } = await generatePlate({
        id: parcelle.id,
        commune: parcelle.commune,
        quartier: parcelle.quartier,
        avenue: parcelle.avenue,
        numero: parcelle.numero,
      });
      updateData.plaqueImageUrl = plaqueUrl;
      updateData.qrCodeUrl = qrCodeUrl;
    }

    await db.update(parcelles).set(updateData).where(eq(parcelles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Validate parcelle error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
