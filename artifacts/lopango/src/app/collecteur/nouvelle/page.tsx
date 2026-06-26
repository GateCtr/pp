import { ParcelleForm } from "@/components/forms/parcelle-form";
import { OfflineSyncBanner } from "@/components/offline-sync-banner";
import { getCollectorSession } from "@/lib/auth";

export default async function NouvellePage() {
  const session = await getCollectorSession();

  return (
    <div>
      <OfflineSyncBanner />
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Nouvelle Collecte
        </h1>
        {session?.zone ? (
          <p className="text-gray-500 text-sm mt-1">
            Zone affectée :{" "}
            <span className="font-semibold text-blue-600">
              {session.zone.avenueNom}
            </span>
            {session.zone.quartierNom && (
              <span className="text-gray-400"> — {session.zone.quartierNom}</span>
            )}
          </p>
        ) : (
          <p className="text-gray-500 text-sm mt-1">
            Remplissez les informations de la parcelle étape par étape
          </p>
        )}
      </div>
      <ParcelleForm zone={session?.zone} />
    </div>
  );
}
