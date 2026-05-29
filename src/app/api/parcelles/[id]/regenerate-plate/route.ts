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

    // Si la plaque existe déjà dans le bucket (URL non base64), on la retourne directement
    // C'est un duplicata : pas besoin de re-stocker, l'originale est dans le bucket
    if (parcelle.plaqueImageUrl && !parcelle.plaqueImageUrl.startsWith("data:")) {
      // L'original est dans le bucket — on retourne les URLs existantes
      return NextResponse.json({
        success: true,
        isDuplicate: true,
        plaqueUrl: parcelle.plaqueImageUrl,
        qrCodeUrl: parcelle.qrCodeUrl,
        message: "Duplicata — la plaque originale du bucket est retournée",
      });
    }

    // Si la plaque est en base64 (mode dev) ou n'existe pas, on regénère en mémoire
    // On ne persiste PAS dans le bucket car c'est identique à l'originale
    const { plaqueUrl, qrCodeUrl } = await generatePlate({
      id: parcelle.id,
      commune: parcelle.commune,
      quartier: parcelle.quartier,
      avenue: parcelle.avenue,
      numero: parcelle.numero,
    });

    // On met à jour uniquement si la plaque n'existait pas encore
    if (!parcelle.plaqueImageUrl) {
      await db
        .update(parcelles)
        .set({
          plaqueImageUrl: plaqueUrl,
          qrCodeUrl: qrCodeUrl,
          misAJour: new Date(),
          modifiePar: "admin (duplicata plaque)",
        })
        .where(eq(parcelles.id, id));
    } else {
      // Juste mettre à jour la date pour traçabilité
      await db
        .update(parcelles)
        .set({
          misAJour: new Date(),
          modifiePar: "admin (duplicata demandé)",
        })
        .where(eq(parcelles.id, id));
    }

    return NextResponse.json({
      success: true,
      isDuplicate: false,
      plaqueUrl: parcelle.plaqueImageUrl || plaqueUrl,
      qrCodeUrl: parcelle.qrCodeUrl || qrCodeUrl,
    });
  } catch (error) {
    console.error("Regenerate plate error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
