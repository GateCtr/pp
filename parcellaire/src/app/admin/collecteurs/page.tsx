import { db } from "@/db";
import { agentsCollecteurs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AddCollectorForm } from "@/components/admin/add-collector-form";
import { CollecteursList } from "@/components/admin/collecteurs-list";

export const dynamic = "force-dynamic";

export default async function AdminCollecteursPage() {
  const agents = await db
    .select()
    .from(agentsCollecteurs)
    .orderBy(desc(agentsCollecteurs.creeLe));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Collecteurs</h2>
        <p className="text-gray-500 text-sm mt-0.5">Gérez les agents terrain et leurs codes d&apos;accès</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <AddCollectorForm />
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2">
          <CollecteursList agents={agents} />
        </div>
      </div>
    </div>
  );
}
