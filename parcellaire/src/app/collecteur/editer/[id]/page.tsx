import { db } from "@/db";
import { parcelles, menages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCollectorSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EditBrouillonClient } from "./edit-brouillon-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditerBrouillonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCollectorSession();

  // Pas de session → le SessionProvider client gère la redirection
  if (!session) {
    return null;
  }

  const { id } = await params;

  const [parcelle] = await db
    .select()
    .from(parcelles)
    .where(eq(parcelles.id, id))
    .limit(1);

  if (!parcelle) {
    redirect("/collecteur");
  }

  if (parcelle.agentId !== session.agentId) {
    redirect("/collecteur");
  }

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
