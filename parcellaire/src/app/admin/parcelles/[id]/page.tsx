import { db } from "@/db";
import { parcelles, menages, agentsCollecteurs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ParcelleDetailClient } from "./parcelle-detail-client";

export const dynamic = "force-dynamic";

export default async function AdminParcelleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [parcelle] = await db
    .select()
    .from(parcelles)
    .where(eq(parcelles.id, id))
    .limit(1);

  if (!parcelle) {
    notFound();
  }

  const parcelMenages = await db
    .select()
    .from(menages)
    .where(eq(menages.parcelleId, id))
    .orderBy(menages.ordre);

  // Fetch agent info if available
  let agent = null;
  if (parcelle.agentId) {
    const [agentData] = await db
      .select()
      .from(agentsCollecteurs)
      .where(eq(agentsCollecteurs.id, parcelle.agentId))
      .limit(1);
    agent = agentData || null;
  }

  return (
    <ParcelleDetailClient
      parcelle={parcelle}
      menages={parcelMenages}
      agent={agent}
    />
  );
}
