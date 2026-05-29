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

    // Only validated parcelles can have their plate regenerated
    if (parcelle.statutValidation !== "valide") {
      return NextResponse.json(
        { error: "Seules les parcelles validées peuvent avoir une plaque régénérée" },
        { status: 400 }
      );
    }

    // Generate new plate (duplicata)
    const { plaqueUrl, qrCodeUrl } = await generatePlate({
      id: parcelle.id,
      commune: parcelle.commune,
      quartier: parcelle.quartier,
      avenue: parcelle.avenue,
      numero: parcelle.numero,
    });

    // Update in DB
    await db
      .update(parcelles)
      .set({
        plaqueImageUrl: plaqueUrl,
        qrCodeUrl: qrCodeUrl,
        misAJour: new Date(),
        modifiePar: "admin (duplicata plaque)",
      })
      .where(eq(parcelles.id, id));

    return NextResponse.json({
      success: true,
      plaqueUrl,
      qrCodeUrl,
    });
  } catch (error) {
    console.error("Regenerate plate error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
