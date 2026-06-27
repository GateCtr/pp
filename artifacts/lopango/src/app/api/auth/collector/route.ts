import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agentsCollecteurs, affectationsAgents, avenues, lieuxGeo } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.COLLECTOR_JWT_SECRET || "lopango-collector-secret-key-2024"
);

export async function POST(request: NextRequest) {
  try {
    const { codeAcces } = await request.json();

    if (!codeAcces) {
      return NextResponse.json(
        { error: "Code d'accès requis" },
        { status: 400 }
      );
    }

    const [agent] = await db
      .select()
      .from(agentsCollecteurs)
      .where(eq(agentsCollecteurs.codeAcces, codeAcces))
      .limit(1);

    if (!agent || !agent.actif || (agent.statut && agent.statut !== "actif")) {
      return NextResponse.json(
        { error: "Code d'accès invalide ou compte désactivé" },
        { status: 401 }
      );
    }

    // Look up the agent's active zone affectation
    const [affectation] = await db
      .select({
        avenueId: affectationsAgents.avenueId,
        avenueNom: avenues.nom,
        quartierId: affectationsAgents.quartierId,
        quartierNom: lieuxGeo.nom,
      })
      .from(affectationsAgents)
      .leftJoin(avenues, eq(affectationsAgents.avenueId, avenues.id))
      .leftJoin(lieuxGeo, eq(affectationsAgents.quartierId, lieuxGeo.id))
      .where(
        and(
          eq(affectationsAgents.agentId, agent.id),
          eq(affectationsAgents.actif, true)
        )
      )
      .limit(1);

    // Build zone info if affectation exists
    let zone: Record<string, string> | undefined;
    if (affectation?.avenueId) {
      // Walk up the geographic hierarchy to get commune and ville/territoire names
      let communeNom = "";
      let villeOuTerritoireNom = "";
      if (affectation.quartierId) {
        const quartierRow = await db
          .select({ parentId: lieuxGeo.parentId })
          .from(lieuxGeo)
          .where(eq(lieuxGeo.id, affectation.quartierId))
          .limit(1);
        const communeId = quartierRow[0]?.parentId;
        if (communeId) {
          const communeRow = await db
            .select({ nom: lieuxGeo.nom, parentId: lieuxGeo.parentId })
            .from(lieuxGeo)
            .where(eq(lieuxGeo.id, communeId))
            .limit(1);
          communeNom = communeRow[0]?.nom ?? "";
          const villeId = communeRow[0]?.parentId;
          if (villeId) {
            const villeRow = await db
              .select({ nom: lieuxGeo.nom })
              .from(lieuxGeo)
              .where(eq(lieuxGeo.id, villeId))
              .limit(1);
            villeOuTerritoireNom = villeRow[0]?.nom ?? "";
          }
        }
      }
      zone = {
        avenueId: affectation.avenueId,
        avenueNom: affectation.avenueNom ?? "",
        quartierId: affectation.quartierId ?? "",
        quartierNom: affectation.quartierNom ?? "",
        communeNom,
        villeOuTerritoireNom,
      };
    }

    // Create JWT token
    const token = await new SignJWT({
      agentId: agent.id,
      nom: agent.nom,
      role: "collecteur",
      ...(zone ? { zone } : {}),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("12h")
      .sign(SECRET);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("collector-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      agent: { id: agent.id, nom: agent.nom },
      zone: zone ?? null,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
