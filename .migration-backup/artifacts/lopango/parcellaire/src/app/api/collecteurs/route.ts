import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agentsCollecteurs } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { nom, telephone, codeAcces } = await request.json();

    if (!nom || !codeAcces) {
      return NextResponse.json(
        { error: "Nom et code d'accès requis" },
        { status: 400 }
      );
    }

    const [agent] = await db
      .insert(agentsCollecteurs)
      .values({
        nom,
        telephone: telephone || null,
        codeAcces,
        actif: true,
      })
      .returning();

    return NextResponse.json({ success: true, agent });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("unique")
    ) {
      return NextResponse.json(
        { error: "Ce code d'accès existe déjà" },
        { status: 409 }
      );
    }
    console.error("Create collector error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
