import { db } from "@/db";
import { agentsCollecteurs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCollectorForm } from "@/components/admin/add-collector-form";
import { User, Phone, Key } from "lucide-react";

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
        {/* Add form */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <AddCollectorForm />
        </div>

        {/* List */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Agents enregistrés
            </h3>
            <span className="text-xs text-gray-400">{agents.length} agent{agents.length !== 1 ? "s" : ""}</span>
          </div>

          {agents.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun collecteur enregistré</p>
                <p className="text-gray-400 text-xs mt-1">Utilisez le formulaire pour en ajouter</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 stagger-children">
              {agents.map((agent) => (
                <Card key={agent.id} className="border-0 shadow-md shadow-gray-200/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">{agent.nom}</p>
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${
                            agent.actif
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          } border`}
                        >
                          {agent.actif ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Key className="w-3 h-3 text-gray-300" />
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                            {agent.codeAcces}
                          </code>
                        </span>
                        {agent.telephone && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Phone className="w-3 h-3" />
                            {agent.telephone}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
