import { db } from "@/db";
import { parcelles, menages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCollectorSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EditBrouillonClient } from "./edit-brouillon-client";

export const dynamic = "force-dynamic";

export default async function EditerBrouillonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCollectorSession();
  if (!session) redirect("/collecteur/login");

  const { id } = await params;

  const [parcelle] = await db
    .select()
    .from(parcelles)
    .where(eq(parcelles.id, id))
    .limit(1);

  if (!parcelle) {
    redirect("/collecteur");
  }

  // Verify ownership
  if (parcelle.agentId !== session.agentId) {
    redirect("/collecteur");
  }

  // Verify still a brouillon
  if (parcelle.statutValidation !== "brouillon") {
    redirect("/collecteur");
  }

  const parcelMenages = await db
    .select()
    .from(menages)
    .where(eq(menages.parcelleId, id))
    .orderBy(menages.ordre);

  return (
    <EditBrouillonClient
      parcelle={parcelle}
      menages={parcelMenages}
      sessionNom={session.nom}
    />
  );
}
