import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agentsCollecteurs } from "@/db/schema";
import { eq } from "drizzle-orm";
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

    // Create JWT token
    const token = await new SignJWT({
      agentId: agent.id,
      nom: agent.nom,
      role: "collecteur",
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
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
