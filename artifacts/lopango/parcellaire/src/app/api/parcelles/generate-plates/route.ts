import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles, plateTemplates } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { generatePlateWithTemplate } from "@/lib/plate-generator";
import type { VariantDesign } from "@/db/schema";

// POST - Assign variant and generate plates for one or multiple parcelles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parcelleIds, templateId, variantIndex } = body;

    if (!parcelleIds || !Array.isArray(parcelleIds) || parcelleIds.length === 0) {
      return NextResponse.json(
        { error: "Au moins une parcelle requise" },
        { status: 400 }
      );
    }

    if (!templateId) {
      return NextResponse.json(
        { error: "Template requis" },
        { status: 400 }
      );
    }

    if (variantIndex === undefined || variantIndex === null) {
      return NextResponse.json(
        { error: "Index de variante requis" },
        { status: 400 }
      );
    }

    // Get template
    const [template] = await db
      .select()
      .from(plateTemplates)
      .where(eq(plateTemplates.id, templateId))
      .limit(1);

    if (!template) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    const variants = (typeof template.variants === "string"
      ? JSON.parse(template.variants)
      : template.variants) as VariantDesign[];

    if (variantIndex < 0 || variantIndex >= variants.length) {
      return NextResponse.json(
        { error: "Index de variante invalide" },
        { status: 400 }
      );
    }

    const variant = variants[variantIndex];


    // Get parcelles
    const targetParcelles = await db
      .select()
      .from(parcelles)
      .where(inArray(parcelles.id, parcelleIds));

    if (targetParcelles.length === 0) {
      return NextResponse.json(
        { error: "Aucune parcelle trouvée" },
        { status: 404 }
      );
    }

    // Check that none already have a variant assigned (immutable once set)
    const alreadyAssigned = targetParcelles.filter(
      (p) => p.variantIndex !== null && p.templateId !== null
    );

    if (alreadyAssigned.length > 0) {
      return NextResponse.json(
        {
          error: `${alreadyAssigned.length} parcelle(s) ont déjà une variante assignée (non modifiable)`,
          alreadyAssigned: alreadyAssigned.map((p) => p.id),
        },
        { status: 409 }
      );
    }

    // Only validated parcelles can get plates
    const notValidated = targetParcelles.filter(
      (p) => p.statutValidation !== "valide"
    );

    if (notValidated.length > 0) {
      return NextResponse.json(
        {
          error: `${notValidated.length} parcelle(s) ne sont pas validées`,
          notValidated: notValidated.map((p) => p.id),
        },
        { status: 400 }
      );
    }

    // Generate plates for each parcelle
    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const parcelle of targetParcelles) {
      try {
        const { plaqueUrl, qrCodeUrl } = await generatePlateWithTemplate(
          {
            id: parcelle.id,
            commune: parcelle.commune,
            quartier: parcelle.quartier,
            avenue: parcelle.avenue,
            numero: parcelle.numero,
          },
          {
            variant,
            flagUrl: template.flagUrl,
            sealUrl: template.sealUrl,
          }
        );

        // Update parcelle with template assignment + generated plate
        await db
          .update(parcelles)
          .set({
            templateId,
            variantIndex,
            plaqueImageUrl: plaqueUrl,
            qrCodeUrl,
            misAJour: new Date(),
            modifiePar: "admin (génération plaque template)",
          })
          .where(eq(parcelles.id, parcelle.id));

        results.push({ id: parcelle.id, success: true });
      } catch (err) {
        results.push({
          id: parcelle.id,
          success: false,
          error: err instanceof Error ? err.message : "Erreur inconnue",
        });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      generated: succeeded,
      failed,
      results,
    });
  } catch (error) {
    console.error("Generate plates error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
