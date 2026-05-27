import { ParcelleForm } from "@/components/forms/parcelle-form";

export default function CollecteurPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Nouvelle Collecte Parcellaire
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Remplissez le formulaire pour enregistrer une nouvelle parcelle
        </p>
      </div>
      <ParcelleForm />
    </div>
  );
}
