import { db } from "@/db";
import { parcelles, agentsCollecteurs } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalParcelles] = await db.select({ count: count() }).from(parcelles);
  const [brouillons] = await db
    .select({ count: count() })
    .from(parcelles)
    .where(eq(parcelles.statutValidation, "brouillon"));
  const [validees] = await db
    .select({ count: count() })
    .from(parcelles)
    .where(eq(parcelles.statutValidation, "valide"));
  const [totalAgents] = await db
    .select({ count: count() })
    .from(agentsCollecteurs);

  const stats = [
    {
      title: "Total Parcelles",
      value: totalParcelles.count,
      icon: FileText,
      gradient: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      title: "En Attente",
      value: brouillons.count,
      icon: Clock,
      gradient: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      title: "Validées",
      value: validees.count,
      icon: CheckCircle,
      gradient: "from-emerald-400 to-green-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      title: "Agents Actifs",
      value: totalAgents.count,
      icon: Users,
      gradient: "from-violet-400 to-purple-500",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord</h2>
        <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble du système DIGIPARC</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat, i) => (
          <Card key={i} className="border-0 shadow-md shadow-gray-200/50 hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick info */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md shadow-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Actions Rapides</h3>
            </div>
            <div className="space-y-2">
              <a
                href="/admin/parcelles"
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-700">Fiches en attente de validation</span>
                </div>
                <span className="text-sm font-bold text-amber-600">{brouillons.count}</span>
              </a>
              <a
                href="/admin/collecteurs"
                className="flex items-center justify-between p-3 rounded-xl bg-violet-50/50 border border-violet-100 hover:bg-violet-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-gray-700">Gérer les agents collecteurs</span>
                </div>
                <span className="text-sm font-bold text-violet-600">{totalAgents.count}</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md shadow-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Système</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Taux de validation</span>
                <span className="font-medium text-gray-900">
                  {totalParcelles.count > 0
                    ? Math.round((validees.count / totalParcelles.count) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${totalParcelles.count > 0 ? (validees.count / totalParcelles.count) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  Validées ({validees.count})
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  En attente ({brouillons.count})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
