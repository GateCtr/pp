import { ParcelleForm } from "@/components/forms/parcelle-form";
import { OfflineSyncBanner } from "@/components/offline-sync-banner";

export default function NouvellePage() {
  return (
    <div>
      <OfflineSyncBanner />
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Nouvelle Collecte
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Remplissez les informations de la parcelle étape par étape
        </p>
      </div>
      <ParcelleForm />
    </div>
  );
}
