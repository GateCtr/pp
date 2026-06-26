import { NextResponse } from "next/server";
import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCollectorSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCollectorSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const results = await db
      .select()
      .from(parcelles)
      .where(
        and(
          eq(parcelles.agentId, session.agentId),
          eq(parcelles.statutValidation, "brouillon")
        )
      )
      .orderBy(desc(parcelles.creeLe));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Get mes brouillons error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
