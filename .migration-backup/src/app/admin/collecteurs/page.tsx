import { db } from "@/db";
import { agentsCollecteurs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AddCollectorModal } from "@/components/admin/add-collector-form";
import { CollecteursList } from "@/components/admin/collecteurs-list";

export const dynamic = "force-dynamic";

export default async function AdminCollecteursPage() {
  const agents = await db
    .select()
    .from(agentsCollecteurs)
    .orderBy(desc(agentsCollecteurs.creeLe));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collecteurs</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Gérez les agents terrain et leurs codes d&apos;accès
          </p>
        </div>
        <AddCollectorModal />
      </div>

      <CollecteursList agents={agents} />
    </div>
  );
}
