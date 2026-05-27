import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VerificationPage({
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

  if (!parcelle || parcelle.statutValidation !== "valide") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Parcelle Enregistrée
          </h1>
          <p className="text-sm text-gray-500">
            Cette parcelle est officiellement enregistrée dans le système de cartographie parcellaire
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Localisation
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Commune</span>
                <span className="font-medium">{parcelle.commune}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quartier</span>
                <span className="font-medium">{parcelle.quartier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avenue</span>
                <span className="font-medium">{parcelle.avenue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Numéro</span>
                <span className="font-medium text-lg">N° {parcelle.numero}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Shield className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs font-medium text-green-800">Statut</p>
              <Badge className="bg-green-100 text-green-800 mt-1">
                Enregistrement Validé
              </Badge>
            </div>
          </div>

          {parcelle.dateValidation && (
            <p className="text-xs text-center text-gray-400">
              Validée le{" "}
              {new Date(parcelle.dateValidation).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          <div className="pt-2 text-center">
            <p className="text-xs text-gray-400">
              Système Digital de Cartographie Parcellaire — RDC
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
