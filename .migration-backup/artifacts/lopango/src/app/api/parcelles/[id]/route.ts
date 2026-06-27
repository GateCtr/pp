import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles, menages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parcelleFormSchema } from "@/lib/validations";

// GET - Fetch a single parcelle with its menages
export async function GET(
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

    const parcelMenages = await db
      .select()
      .from(menages)
      .where(eq(menages.parcelleId, id))
      .orderBy(menages.ordre);

    return NextResponse.json({ parcelle, menages: parcelMenages });
  } catch (error) {
    console.error("Get parcelle error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT - Update a parcelle (admin or collector for brouillons)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, modifiePar } = body;

    const parsed = parcelleFormSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const formData = parsed.data;

    // Check parcelle exists
    const [existing] = await db
      .select()
      .from(parcelles)
      .where(eq(parcelles.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Parcelle non trouvée" },
        { status: 404 }
      );
    }

    // Update parcelle
    await db
      .update(parcelles)
      .set({
        district: formData.district || null,
        commune: formData.commune,
        secteur: formData.secteur || null,
        cite: formData.cite || null,
        quartier: formData.quartier,
        avenue: formData.avenue,
        numero: formData.numero,
        proprietaireNom: formData.proprietaireNom,
        proprietaireTel: formData.proprietaireTel || null,
        statutJuridique: formData.statutJuridique || null,
        typeLogement: formData.typeLogement || null,
        nombreMenages: formData.nombreMenages,
        nombreLocataires: formData.nombreLocataires,
        valeurLocative: formData.valeurLocative || null,
        misAJour: new Date(),
        modifiePar: modifiePar || "admin",
      })
      .where(eq(parcelles.id, id));

    // Delete existing menages and re-insert
    await db.delete(menages).where(eq(menages.parcelleId, id));

    if (formData.menages && formData.menages.length > 0) {
      await db.insert(menages).values(
        formData.menages.map((m, i) => ({
          parcelleId: id,
          nomResponsable: m.nomResponsable,
          telephone: m.telephone || null,
          tailleMenage: m.tailleMenage,
          ordre: i + 1,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update parcelle error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
