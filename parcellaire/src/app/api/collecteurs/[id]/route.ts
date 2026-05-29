import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agentsCollecteurs } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Fetch a single collector
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [agent] = await db
      .select()
      .from(agentsCollecteurs)
      .where(eq(agentsCollecteurs.id, id))
      .limit(1);

    if (!agent) {
      return NextResponse.json(
        { error: "Collecteur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Get collector error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT - Update collector (edit, suspend, revoke, regenerate code, archive)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, ...data } = body;

    const [existing] = await db
      .select()
      .from(agentsCollecteurs)
      .where(eq(agentsCollecteurs.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Collecteur non trouvé" },
        { status: 404 }
      );
    }

    const now = new Date();

    switch (action) {
      case "edit": {
        await db
          .update(agentsCollecteurs)
          .set({
            nom: data.nom || existing.nom,
            telephone: data.telephone !== undefined ? data.telephone : existing.telephone,
            misAJour: now,
            modifiePar: data.modifiePar || "admin",
          })
          .where(eq(agentsCollecteurs.id, id));
        break;
      }

      case "suspendre": {
        await db
          .update(agentsCollecteurs)
          .set({
            statut: "suspendu",
            actif: false,
            misAJour: now,
            modifiePar: data.modifiePar || "admin",
          })
          .where(eq(agentsCollecteurs.id, id));
        break;
      }

      case "reactiver": {
        await db
          .update(agentsCollecteurs)
          .set({
            statut: "actif",
            actif: true,
            misAJour: now,
            modifiePar: data.modifiePar || "admin",
          })
          .where(eq(agentsCollecteurs.id, id));
        break;
      }

      case "revoquer": {
        await db
          .update(agentsCollecteurs)
          .set({
            statut: "revoque",
            actif: false,
            misAJour: now,
            modifiePar: data.modifiePar || "admin",
          })
          .where(eq(agentsCollecteurs.id, id));
        break;
      }

      case "regenerer_code": {
        const newCode = `AGT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await db
          .update(agentsCollecteurs)
          .set({
            codeAcces: newCode,
            misAJour: now,
            modifiePar: data.modifiePar || "admin",
          })
          .where(eq(agentsCollecteurs.id, id));
        return NextResponse.json({ success: true, newCode });
      }

      case "archiver": {
        await db
          .update(agentsCollecteurs)
          .set({
            statut: "archive",
            actif: false,
            misAJour: now,
            modifiePar: data.modifiePar || "admin",
          })
          .where(eq(agentsCollecteurs.id, id));
        break;
      }

      default:
        return NextResponse.json(
          { error: "Action invalide" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update collector error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a collector
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db
      .delete(agentsCollecteurs)
      .where(eq(agentsCollecteurs.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete collector error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
