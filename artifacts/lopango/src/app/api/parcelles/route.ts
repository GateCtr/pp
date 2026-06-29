import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles, menages } from "@/db/schema";
import { getCollectorSession } from "@/lib/auth";
import { parcelleFormSchema } from "@/lib/validations";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getCollectorSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parcelleFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Insert parcelle
    const [newParcelle] = await db
      .insert(parcelles)
      .values({
        district: data.district || null,
        commune: data.commune,
        secteur: data.secteur || null,
        cite: data.cite || null,
        quartier: data.quartier,
        avenue: data.avenue,
        numero: data.numero,
        avenueId: data.avenueId || null,
        proprietaireNom: data.proprietaireNom,
        proprietaireTel: data.proprietaireTel || null,
        statutJuridique: data.statutJuridique || null,
        typeLogement: data.typeLogement || null,
        nombreMenages: data.nombreMenages,
        nombreLocataires: data.nombreLocataires,
        valeurLocative: data.valeurLocative || null,
        statutValidation: "brouillon",
        agentId: session.agentId,
      })
      .returning();

    // Insert menages
    if (data.menages && data.menages.length > 0) {
      await db.insert(menages).values(
        data.menages.map((m, i) => ({
          parcelleId: newParcelle.id,
          nomResponsable: m.nomResponsable,
          telephone: m.telephone || null,
          tailleMenage: m.tailleMenage,
          ordre: i + 1,
        }))
      );
    }

    return NextResponse.json({ success: true, id: newParcelle.id });
  } catch (error) {
    console.error("Create parcelle error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get("statut");

    if (statut) {
      const results = await db
        .select()
        .from(parcelles)
        .where(eq(parcelles.statutValidation, statut as "brouillon" | "valide" | "rejete"))
        .orderBy(desc(parcelles.creeLe));
      return NextResponse.json(results);
    }

    const results = await db.select().from(parcelles).orderBy(desc(parcelles.creeLe));
    return NextResponse.json(results);
  } catch (error) {
    console.error("Get parcelles error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
