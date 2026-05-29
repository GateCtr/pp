import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MapPin, Shield, QrCode } from "lucide-react";
import Image from "next/image";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-blue-500/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg mb-3">
            <Image
              src="/favicon-96x96.png"
              alt="Lopango"
              width={36}
              height={36}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Green badge */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-semibold text-sm">
              Parcelle Enregistrée
            </span>
          </div>
          <p className="text-blue-200/50 text-xs mt-2">
            Enregistrement officiel vérifié
          </p>
        </div>

        {/* Main card */}
        <Card className="border-0 rounded-2xl shadow-2xl overflow-hidden">
          {/* Plate thumbnail */}
          {parcelle.plaqueImageUrl && (
            <div className="px-5 pt-5 pb-0">
              <div className="rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={parcelle.plaqueImageUrl}
                  alt="Plaque parcellaire"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* Blue header section */}
          <div className="bg-gradient-to-r from-[#1a3a6b] to-[#1e4080] p-5 text-center mt-0">
            <p className="text-blue-200/70 text-[10px] font-medium tracking-widest uppercase">
              Commune de
            </p>
            <p className="text-white font-bold text-lg mt-0.5">
              {parcelle.commune.toUpperCase()}
            </p>
            <p className="text-blue-300/80 text-xs font-medium mt-1">
              Quartier {parcelle.quartier}
            </p>
          </div>

          <CardContent className="p-5 space-y-4">
            {/* Address */}
            <div className="text-center py-3 border-b border-gray-100">
              <p className="text-gray-500 text-xs mb-1">Adresse</p>
              <p className="text-gray-900 font-semibold text-base">
                {parcelle.avenue}
              </p>
              <p className="text-blue-700 font-bold text-2xl mt-1">
                N° {parcelle.numero}
              </p>
            </div>

            {/* Details grid */}
            <div className="space-y-3">
              {/* Status */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">
                    Statut
                  </p>
                  <p className="text-emerald-800 font-semibold text-sm">
                    Enregistrement Validé
                  </p>
                </div>
              </div>

              {/* District */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">
                    District
                  </p>
                  <p className="text-blue-800 font-semibold text-sm">
                    {parcelle.district || parcelle.commune}
                  </p>
                </div>
              </div>

              {/* Date validation */}
              {parcelle.dateValidation && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                      Validée le
                    </p>
                    <p className="text-gray-800 font-semibold text-sm">
                      {new Date(parcelle.dateValidation).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                <Image
                  src="/favicon-96x96.png"
                  alt="Lopango"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded"
                />
                <span className="text-[10px] text-gray-500 font-medium">
                  Lopango — Cartographie &amp; Recensement RDC
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
