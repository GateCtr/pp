import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affectationsAgents, avenues, lieuxGeo } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/agents/[id]/affectation — get active affectation for an agent
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: agentId } = await params;

    const rows = await db
      .select({
        id: affectationsAgents.id,
        agentId: affectationsAgents.agentId,
        avenueId: affectationsAgents.avenueId,
        avenueNom: avenues.nom,
        quartierId: affectationsAgents.quartierId,
        quartierNom: lieuxGeo.nom,
        actif: affectationsAgents.actif,
        dateDebut: affectationsAgents.dateDebut,
      })
      .from(affectationsAgents)
      .leftJoin(avenues, eq(affectationsAgents.avenueId, avenues.id))
      .leftJoin(lieuxGeo, eq(affectationsAgents.quartierId, lieuxGeo.id))
      .where(
        and(
          eq(affectationsAgents.agentId, agentId),
          eq(affectationsAgents.actif, true)
        )
      );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[api/admin/agents/affectation] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/admin/agents/[id]/affectation — assign agent to a zone
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();
    const { avenueId, quartierId } = body;

    if (!avenueId && !quartierId) {
      return NextResponse.json(
        { error: "avenueId ou quartierId requis" },
        { status: 400 }
      );
    }

    const [affectation] = await db
      .insert(affectationsAgents)
      .values({
        agentId,
        avenueId: avenueId || null,
        quartierId: quartierId || null,
        actif: true,
      })
      .returning();

    return NextResponse.json(affectation, { status: 201 });
  } catch (error) {
    console.error("[api/admin/agents/affectation] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/admin/agents/[id]/affectation?affectationId=<uuid> — deactivate an affectation
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id: agentId } = await params;
    const { searchParams } = new URL(request.url);
    const affectationId = searchParams.get("affectationId");

    if (!affectationId) {
      // Deactivate ALL active affectations for this agent
      await db
        .update(affectationsAgents)
        .set({ actif: false, dateFin: new Date() })
        .where(
          and(
            eq(affectationsAgents.agentId, agentId),
            eq(affectationsAgents.actif, true)
          )
        );
    } else {
      await db
        .update(affectationsAgents)
        .set({ actif: false, dateFin: new Date() })
        .where(eq(affectationsAgents.id, affectationId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/agents/affectation] DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
