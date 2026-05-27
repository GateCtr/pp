import { db } from "@/db";
import { parcelles, agentsCollecteurs } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, Users } from "lucide-react";

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
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "En Attente",
      value: brouillons.count,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Validées",
      value: validees.count,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Agents Actifs",
      value: totalAgents.count,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de Bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
