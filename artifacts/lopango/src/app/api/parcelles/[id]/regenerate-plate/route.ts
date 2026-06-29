import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles, plateTemplates, lieuxGeo, avenues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePlateWithTemplate } from "@/lib/plate-generator";
import type { VariantDesign } from "@/db/schema";

const GEO_TYPE_LABELS: Record<string, string> = {
  ville: "VILLE DE",
  territoire: "TERRITOIRE DE",
  secteur: "SECTEUR DE",
  chefferie: "CHEFFERIE DE",
  cite: "CITÉ DE",
  commune: "COMMUNE DE",
  quartier: "QUARTIER DE",
  village: "VILLAGE DE",
};

async function getDistrictLabel(avenueId: string, fallbackDistrict?: string | null): Promise<string | null> {
  try {
    const [avenue] = await db.select().from(avenues).where(eq(avenues.id, avenueId)).limit(1);
    if (!avenue?.quartierId) return fallbackDistrict || null;

    let currentId: string = avenue.quartierId;
    for (let depth = 0; depth < 6; depth++) {
      const [node] = await db.select().from(lieuxGeo).where(eq(lieuxGeo.id, currentId)).limit(1);
      if (!node) break;
      if (node.type === "ville" || node.type === "territoire") {
        const prefix = GEO_TYPE_LABELS[node.type] || node.type.toUpperCase() + " DE";
        return `${prefix} ${node.nom.toUpperCase()}`;
      }
      if (!node.parentId) break;
      currentId = node.parentId;
    }
    return fallbackDistrict || null;
  } catch {
    return fallbackDistrict || null;
  }
}

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
      return NextResponse.json(
        { error: "Seules les parcelles validées peuvent avoir une plaque régénérée" },
        { status: 400 }
      );
    }

    if (parcelle.plaqueImageUrl && !parcelle.plaqueImageUrl.startsWith("data:")) {
      await db
        .update(parcelles)
        .set({ misAJour: new Date(), modifiePar: "admin (duplicata demandé)" })
        .where(eq(parcelles.id, id));
      return NextResponse.json({
        success: true,
        isDuplicate: true,
        plaqueUrl: parcelle.plaqueImageUrl,
        qrCodeUrl: parcelle.qrCodeUrl,
      });
    }

    let templateConfig = undefined;
    if (parcelle.templateId && parcelle.variantIndex !== null) {
      const [template] = await db
        .select()
        .from(plateTemplates)
        .where(eq(plateTemplates.id, parcelle.templateId))
        .limit(1);
      if (template) {
        const variants = (typeof template.variants === "string"
          ? JSON.parse(template.variants)
          : template.variants) as VariantDesign[];
        if (variants[parcelle.variantIndex]) {
          templateConfig = {
            variant: variants[parcelle.variantIndex],
            flagUrl: template.flagUrl,
            sealUrl: template.sealUrl,
          };
        }
      }
    }

    const districtLabel = parcelle.avenueId
      ? await getDistrictLabel(parcelle.avenueId, parcelle.district)
      : parcelle.district
      ? parcelle.district.toUpperCase()
      : null;

    const { plaqueUrl, qrCodeUrl } = await generatePlateWithTemplate(
      {
        id: parcelle.id,
        commune: parcelle.commune,
        quartier: parcelle.quartier,
        avenue: parcelle.avenue,
        numero: parcelle.numero,
        district: parcelle.district,
        districtLabel,
        secteur: parcelle.secteur,
      },
      templateConfig
    );

    await db
      .update(parcelles)
      .set({
        plaqueImageUrl: plaqueUrl,
        qrCodeUrl,
        misAJour: new Date(),
        modifiePar: "admin (duplicata plaque)",
      })
      .where(eq(parcelles.id, id));

    return NextResponse.json({ success: true, isDuplicate: false, plaqueUrl, qrCodeUrl });
  } catch (error) {
    console.error("Regenerate plate error:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
