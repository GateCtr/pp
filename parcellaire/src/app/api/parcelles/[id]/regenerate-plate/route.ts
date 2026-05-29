import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles, plateTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePlateWithTemplate } from "@/lib/plate-generator";
import type { VariantDesign } from "@/db/schema";

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
      return NextResponse.json({ error: "Parcelle non trouvée" }, { status: 404 });
    }

    if (parcelle.statutValidation !== "valide") {
      return NextResponse.json({ error: "Seules les parcelles validées peuvent avoir une plaque régénérée" }, { status: 400 });
    }

    // Si la plaque existe dans le bucket (non base64), retourner l'existante
    if (parcelle.plaqueImageUrl && !parcelle.plaqueImageUrl.startsWith("data:")) {
      await db.update(parcelles).set({ misAJour: new Date(), modifiePar: "admin (duplicata demandé)" }).where(eq(parcelles.id, id));
      return NextResponse.json({ success: true, isDuplicate: true, plaqueUrl: parcelle.plaqueImageUrl, qrCodeUrl: parcelle.qrCodeUrl });
    }

    // Récupérer le template assigné si il existe (pour inclure le seal dans le QR)
    let templateConfig = undefined;
    if (parcelle.templateId && parcelle.variantIndex !== null) {
      const [template] = await db.select().from(plateTemplates).where(eq(plateTemplates.id, parcelle.templateId)).limit(1);
      if (template) {
        const variants = (typeof template.variants === "string" ? JSON.parse(template.variants) : template.variants) as VariantDesign[];
        if (variants[parcelle.variantIndex]) {
          templateConfig = {
            variant: variants[parcelle.variantIndex],
            flagUrl: template.flagUrl,
            sealUrl: template.sealUrl,
          };
        }
      }
    }

    // Régénérer avec le template (inclut le seal dans le QR)
    const { plaqueUrl, qrCodeUrl } = await generatePlateWithTemplate(
      { id: parcelle.id, commune: parcelle.commune, quartier: parcelle.quartier, avenue: parcelle.avenue, numero: parcelle.numero },
      templateConfig
    );

    await db.update(parcelles).set({
      plaqueImageUrl: plaqueUrl,
      qrCodeUrl: qrCodeUrl,
      misAJour: new Date(),
      modifiePar: "admin (duplicata plaque)",
    }).where(eq(parcelles.id, id));

    return NextResponse.json({ success: true, isDuplicate: false, plaqueUrl, qrCodeUrl });
  } catch (error) {
    console.error("Regenerate plate error:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
