import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plateTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Get a single plate template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [template] = await db
      .select()
      .from(plateTemplates)
      .where(eq(plateTemplates.id, id))
      .limit(1);

    if (!template) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Get plate template error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT - Update a plate template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nom, description, variants, flagUrl, sealUrl, actif } = body;

    const [existing] = await db
      .select()
      .from(plateTemplates)
      .where(eq(plateTemplates.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      misAJour: new Date(),
    };

    if (nom !== undefined) updateData.nom = nom;
    if (description !== undefined) updateData.description = description;
    if (variants !== undefined) {
      if (!Array.isArray(variants) || variants.length > 5) {
        return NextResponse.json(
          { error: "Maximum 5 variantes autorisées" },
          { status: 400 }
        );
      }
      updateData.variants = JSON.stringify(variants);
    }
    if (flagUrl !== undefined) updateData.flagUrl = flagUrl;
    if (sealUrl !== undefined) updateData.sealUrl = sealUrl;
    if (actif !== undefined) updateData.actif = actif;

    await db
      .update(plateTemplates)
      .set(updateData)
      .where(eq(plateTemplates.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update plate template error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a plate template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db
      .delete(plateTemplates)
      .where(eq(plateTemplates.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete plate template error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
