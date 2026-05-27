import { db } from "@/db";
import { agentsCollecteurs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCollectorForm } from "@/components/admin/add-collector-form";

export const dynamic = "force-dynamic";

export default async function AdminCollecteursPage() {
  const agents = await db
    .select()
    .from(agentsCollecteurs)
    .orderBy(desc(agentsCollecteurs.creeLe));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Collecteurs
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add form */}
        <div className="lg:col-span-1">
          <AddCollectorForm />
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-gray-700 mb-3">
            Agents enregistrés ({agents.length})
          </h2>
          {agents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Aucun collecteur enregistré.
              </CardContent>
            </Card>
          ) : (
            agents.map((agent) => (
              <Card key={agent.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{agent.nom}</p>
                    <p className="text-sm text-gray-500">
                      Code: <code className="bg-gray-100 px-1 rounded">{agent.codeAcces}</code>
                    </p>
                    {agent.telephone && (
                      <p className="text-xs text-gray-400">{agent.telephone}</p>
                    )}
                  </div>
                  <Badge
                    className={
                      agent.actif
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {agent.actif ? "Actif" : "Inactif"}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
