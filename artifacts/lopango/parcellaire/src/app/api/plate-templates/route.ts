import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plateTemplates } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET - List all plate templates
export async function GET() {
  try {
    const templates = await db
      .select()
      .from(plateTemplates)
      .orderBy(desc(plateTemplates.creeLe));

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Get plate templates error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Create a new plate template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, description, variants, flagUrl, sealUrl } = body;

    if (!nom) {
      return NextResponse.json(
        { error: "Le nom du template est requis" },
        { status: 400 }
      );
    }

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "Au moins une variante est requise" },
        { status: 400 }
      );
    }

    if (variants.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 variantes autorisées" },
        { status: 400 }
      );
    }

    const [template] = await db
      .insert(plateTemplates)
      .values({
        nom,
        description: description || null,
        variants: JSON.stringify(variants),
        flagUrl: flagUrl || null,
        sealUrl: sealUrl || null,
      })
      .returning();

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Create plate template error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
