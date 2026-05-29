"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { type ParcelleFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  MapPin,
  User,
  Home,
  Users,
  Calendar,
  Clock,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  QrCode,
  RefreshCw,
  ExternalLink,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import type { Parcelle, Menage, AgentCollecteur } from "@/db/schema";
import { PlatePreviewModal } from "@/components/admin/plate-preview-modal";


const statusConfig = {
  brouillon: {
    label: "En attente",
    class: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  valide: {
    label: "Validée",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
  },
  rejete: {
    label: "Rejetée",
    class: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-400",
  },
};

const statutJuridiqueLabels: Record<string, string> = {
  certificat_enregistrement: "Certificat d'enregistrement",
  titre_foncier: "Titre foncier",
  occupation_coutumiere: "Occupation coutumière",
  autre: "Autre",
};

const typeLogementLabels: Record<string, string> = {
  maison_individuelle: "Maison individuelle",
  immeuble: "Immeuble",
  habitat_collectif: "Habitat collectif",
  autre: "Autre",
};

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


interface ParcelleDetailClientProps {
  parcelle: Parcelle;
  menages: Menage[];
  agent: AgentCollecteur | null;
}

export function ParcelleDetailClient({
  parcelle,
  menages: initialMenages,
  agent,
}: ParcelleDetailClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState<"valide" | "rejete" | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [resettingPlate, setResettingPlate] = useState(false);
  const [showPlatePreview, setShowPlatePreview] = useState(false);

  const status = statusConfig[parcelle.statutValidation];

  const form = useForm<ParcelleFormData>({
    defaultValues: {
      district: parcelle.district || "",
      commune: parcelle.commune,
      secteur: parcelle.secteur || "",
      cite: parcelle.cite || "",
      quartier: parcelle.quartier,
      avenue: parcelle.avenue,
      numero: parcelle.numero,
      proprietaireNom: parcelle.proprietaireNom,
      proprietaireTel: parcelle.proprietaireTel || "",
      statutJuridique: parcelle.statutJuridique || undefined,
      typeLogement: parcelle.typeLogement || undefined,
      nombreMenages: parcelle.nombreMenages || 0,
      nombreLocataires: parcelle.nombreLocataires || 0,
      valeurLocative: parcelle.valeurLocative || "",
      menages: initialMenages.map((m) => ({
        nomResponsable: m.nomResponsable,
        telephone: m.telephone || "",
        tailleMenage: m.tailleMenage || 1,
      })),
    },
  });


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "menages",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = form;

  async function onSave(data: ParcelleFormData) {
    setSaving(true);
    try {
      const res = await fetch(`/api/parcelles/${parcelle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, modifiePar: "admin" }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la sauvegarde");
        return;
      }

      toast.success("Parcelle mise à jour avec succès");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  }

  async function handleValidation(action: "valide" | "rejete") {
    setValidating(action);
    try {
      const res = await fetch(`/api/parcelles/${parcelle.id}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: action }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur");
        return;
      }

      toast.success(
        action === "valide"
          ? "Parcelle validée ! Vous pouvez maintenant assigner un template et générer la plaque."
          : "Parcelle rejetée."
      );
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setValidating(null);
    }
  }


  function handleCancel() {
    reset();
    setIsEditing(false);
  }

  async function handleRegeneratePlate() {
    if (!window.confirm("Régénérer la plaque (duplicata) ? L'ancienne plaque sera remplacée.")) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await fetch(`/api/parcelles/${parcelle.id}/regenerate-plate`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la régénération");
        return;
      }

      toast.success("Plaque régénérée avec succès (duplicata) !");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleResetPlate() {
    if (!window.confirm("Supprimer la plaque et réinitialiser ? Vous pourrez ensuite assigner un nouveau template et régénérer.")) {
      return;
    }
    setResettingPlate(true);
    try {
      const res = await fetch(`/api/parcelles/${parcelle.id}/reset-plate`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur");
        return;
      }

      toast.success("Plaque supprimée. Vous pouvez maintenant régénérer avec un autre template.");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setResettingPlate(false);
    }
  }

  // ============ VIEW MODE ============
  if (!isEditing) {
    return (
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/parcelles")}
              className="h-9 px-3"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Retour
            </Button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {parcelle.avenue} N° {parcelle.numero}
              </h2>
              <p className="text-sm text-gray-500">
                {parcelle.commune} &bull; Q. {parcelle.quartier}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${status.class} border text-xs font-semibold px-2.5 py-1`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
              {status.label}
            </Badge>
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Edit3 className="w-4 h-4 mr-1.5" />
              Modifier
            </Button>
          </div>
        </div>


        {/* Validation Actions for brouillons */}
        {parcelle.statutValidation === "brouillon" && (
          <div className="flex items-center gap-2 mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Cette parcelle est en attente de validation
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Collectée par {agent?.nom || "Agent inconnu"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 px-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-medium shadow-sm shadow-emerald-500/20"
                onClick={() => handleValidation("valide")}
                disabled={validating !== null}
              >
                {validating === "valide" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                )}
                Valider
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleValidation("rejete")}
                disabled={validating !== null}
              >
                {validating === "rejete" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                )}
                Rejeter
              </Button>
            </div>
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Localisation */}
          <Card className="border-0 shadow-md shadow-gray-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <CardTitle className="text-sm font-semibold">Localisation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="District" value={parcelle.district} />
                <InfoField label="Commune" value={parcelle.commune} />
                <InfoField label="Secteur" value={parcelle.secteur} />
                <InfoField label="Cité" value={parcelle.cite} />
                <InfoField label="Quartier" value={parcelle.quartier} />
                <InfoField label="Avenue" value={parcelle.avenue} />
                <InfoField label="Numéro" value={parcelle.numero} />
              </div>
            </CardContent>
          </Card>

          {/* Propriétaire */}
          <Card className="border-0 shadow-md shadow-gray-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                  <User className="w-4.5 h-4.5 text-violet-600" />
                </div>
                <CardTitle className="text-sm font-semibold">Propriétaire</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoField label="Nom complet" value={parcelle.proprietaireNom} />
              <InfoField label="Téléphone" value={parcelle.proprietaireTel} />
              <InfoField
                label="Statut juridique"
                value={
                  parcelle.statutJuridique
                    ? statutJuridiqueLabels[parcelle.statutJuridique]
                    : null
                }
              />
            </CardContent>
          </Card>


          {/* Occupation */}
          <Card className="border-0 shadow-md shadow-gray-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Home className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <CardTitle className="text-sm font-semibold">Occupation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoField
                label="Type de logement"
                value={
                  parcelle.typeLogement
                    ? typeLogementLabels[parcelle.typeLogement]
                    : null
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <InfoField
                  label="Nombre de ménages"
                  value={String(parcelle.nombreMenages || 0)}
                />
                <InfoField
                  label="Nombre de locataires"
                  value={String(parcelle.nombreLocataires || 0)}
                />
              </div>
              <InfoField
                label="Valeur locative"
                value={parcelle.valeurLocative ? `${parcelle.valeurLocative} USD` : null}
              />
            </CardContent>
          </Card>

          {/* Ménages */}
          <Card className="border-0 shadow-md shadow-gray-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Ménages ({initialMenages.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {initialMenages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Aucun ménage enregistré
                </p>
              ) : (
                <div className="space-y-2">
                  {initialMenages.map((m, i) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {m.nomResponsable}
                        </p>
                        <p className="text-xs text-gray-500">
                          {m.telephone || "Pas de téléphone"} &bull; {m.tailleMenage} personne(s)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Plaque & QR Code */}
        {parcelle.statutValidation === "valide" && (
          <Card className="border-0 shadow-md shadow-gray-200/50 mt-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <QrCode className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Plaque & QR Code</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={handleRegeneratePlate}
                    disabled={regenerating || resettingPlate}
                  >
                    {regenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Duplicata
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleResetPlate}
                    disabled={regenerating || resettingPlate}
                  >
                    {resettingPlate ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Supprimer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {parcelle.plaqueImageUrl && (
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-2">Plaque parcellaire</p>
                    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={parcelle.plaqueImageUrl}
                        alt="Plaque parcellaire"
                        className="w-full max-w-md rounded-lg"
                      />
                    </div>
                    <a
                      href={parcelle.plaqueImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ouvrir en plein écran
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3 text-xs ml-3 mt-3"
                      onClick={() => setShowPlatePreview(true)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Voir en grand
                    </Button>
                  </div>
                )}
                {parcelle.qrCodeUrl && (
                  <div className="flex-shrink-0">
                    <p className="text-xs font-medium text-gray-600 mb-2">QR Code de vérification</p>
                    <div className="rounded-xl border border-gray-200 bg-white p-3 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={parcelle.qrCodeUrl}
                        alt="QR Code"
                        className="w-28 h-28"
                      />
                    </div>
                  </div>
                )}
                {!parcelle.plaqueImageUrl && !parcelle.qrCodeUrl && (
                  <div className="text-center py-6 w-full">
                    <QrCode className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucune plaque générée</p>
                    <p className="text-xs text-gray-300 mt-1">
                      Cliquez &quot;Régénérer&quot; pour créer la plaque
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plate Preview Modal */}
        {showPlatePreview && parcelle.plaqueImageUrl && (
          <PlatePreviewModal
            plaqueImageUrl={parcelle.plaqueImageUrl}
            parcelle={{
              commune: parcelle.commune,
              quartier: parcelle.quartier,
              avenue: parcelle.avenue,
              numero: parcelle.numero,
            }}
            onClose={() => setShowPlatePreview(false)}
          />
        )}

        {/* Audit Info */}
        <Card className="border-0 shadow-md shadow-gray-200/50 mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-gray-600" />
              </div>
              <CardTitle className="text-sm font-semibold">Audit & Suivi</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">Date collecte</span>
                </div>
                <p className="text-sm text-gray-900">{formatDate(parcelle.dateCollecte)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">Date validation</span>
                </div>
                <p className="text-sm text-gray-900">{formatDate(parcelle.dateValidation)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">Dernière modification</span>
                </div>
                <p className="text-sm text-gray-900">{formatDate(parcelle.misAJour)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">Modifié par</span>
                </div>
                <p className="text-sm text-gray-900">{parcelle.modifiePar || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  // ============ EDIT MODE ============
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="h-9 px-3"
          >
            <X className="w-4 h-4 mr-1.5" />
            Annuler
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Modifier la parcelle
            </h2>
            <p className="text-sm text-gray-500">
              {parcelle.avenue} N° {parcelle.numero}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleSubmit(onSave)}
          disabled={saving}
          className="h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : (
            <Save className="w-4 h-4 mr-1.5" />
          )}
          Enregistrer
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">


        {/* Localisation */}
        <Card className="border-0 shadow-md shadow-gray-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <MapPin className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <CardTitle className="text-sm font-semibold">Localisation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">District</Label>
                <Input {...register("district")} className="h-11 bg-gray-50/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Commune <span className="text-red-400">*</span>
                </Label>
                <Input {...register("commune")} className="h-11 bg-gray-50/50" />
                {errors.commune && (
                  <p className="text-red-500 text-xs">{errors.commune.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Secteur</Label>
                <Input {...register("secteur")} className="h-11 bg-gray-50/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Cité</Label>
                <Input {...register("cite")} className="h-11 bg-gray-50/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">
                Quartier <span className="text-red-400">*</span>
              </Label>
              <Input {...register("quartier")} className="h-11 bg-gray-50/50" />
              {errors.quartier && (
                <p className="text-red-500 text-xs">{errors.quartier.message}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Avenue / Rue <span className="text-red-400">*</span>
                </Label>
                <Input {...register("avenue")} className="h-11 bg-gray-50/50" />
                {errors.avenue && (
                  <p className="text-red-500 text-xs">{errors.avenue.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  N° <span className="text-red-400">*</span>
                </Label>
                <Input
                  {...register("numero")}
                  className="h-11 bg-gray-50/50 text-center font-semibold"
                />
                {errors.numero && (
                  <p className="text-red-500 text-xs">{errors.numero.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Propriétaire */}
        <Card className="border-0 shadow-md shadow-gray-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <User className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <CardTitle className="text-sm font-semibold">Propriétaire</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">
                Nom complet <span className="text-red-400">*</span>
              </Label>
              <Input {...register("proprietaireNom")} className="h-11 bg-gray-50/50" />
              {errors.proprietaireNom && (
                <p className="text-red-500 text-xs">{errors.proprietaireNom.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Téléphone</Label>
              <Input {...register("proprietaireTel")} type="tel" className="h-11 bg-gray-50/50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Statut juridique</Label>
              <Select
                onValueChange={(v) =>
                  setValue("statutJuridique", v as ParcelleFormData["statutJuridique"])
                }
                defaultValue={watch("statutJuridique") || undefined}
              >
                <SelectTrigger className="h-11 bg-gray-50/50">
                  <SelectValue placeholder="Sélectionner le statut..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificat_enregistrement">
                    Certificat d&apos;enregistrement
                  </SelectItem>
                  <SelectItem value="titre_foncier">Titre foncier</SelectItem>
                  <SelectItem value="occupation_coutumiere">
                    Occupation coutumière
                  </SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>


        {/* Occupation */}
        <Card className="border-0 shadow-md shadow-gray-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Home className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <CardTitle className="text-sm font-semibold">Occupation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Type de logement</Label>
              <Select
                onValueChange={(v) =>
                  setValue("typeLogement", v as ParcelleFormData["typeLogement"])
                }
                defaultValue={watch("typeLogement") || undefined}
              >
                <SelectTrigger className="h-11 bg-gray-50/50">
                  <SelectValue placeholder="Sélectionner le type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maison_individuelle">Maison individuelle</SelectItem>
                  <SelectItem value="immeuble">Immeuble</SelectItem>
                  <SelectItem value="habitat_collectif">Habitat collectif</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Nb. ménages</Label>
                <Input
                  {...register("nombreMenages")}
                  type="number"
                  min={0}
                  className="h-11 bg-gray-50/50 text-center"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Nb. locataires</Label>
                <Input
                  {...register("nombreLocataires")}
                  type="number"
                  min={0}
                  className="h-11 bg-gray-50/50 text-center"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Valeur locative (USD)</Label>
              <Input {...register("valeurLocative")} className="h-11 bg-gray-50/50" />
            </div>
          </CardContent>
        </Card>


        {/* Ménages */}
        <Card className="border-0 shadow-md shadow-gray-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <CardTitle className="text-sm font-semibold">
                Ménages ({fields.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      {index + 1}
                    </div>
                    Ménage {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Input
                    {...register(`menages.${index}.nomResponsable`)}
                    placeholder="Nom du responsable"
                    className="h-10 bg-white text-sm"
                  />
                  {errors.menages?.[index]?.nomResponsable && (
                    <p className="text-red-500 text-xs">
                      {errors.menages[index].nomResponsable?.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    {...register(`menages.${index}.telephone`)}
                    placeholder="Téléphone"
                    className="h-10 bg-white text-sm"
                  />
                  <Input
                    {...register(`menages.${index}.tailleMenage`)}
                    type="number"
                    min={1}
                    placeholder="Taille"
                    className="h-10 bg-white text-sm text-center"
                  />
                </div>
              </div>
            ))}

            {fields.length < 10 && (
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-dashed border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-gray-500 hover:text-emerald-700 transition-colors"
                onClick={() =>
                  append({ nomResponsable: "", telephone: "", tailleMenage: 1 })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un ménage ({fields.length}/10)
              </Button>
            )}
          </CardContent>
        </Card>


        {/* Bottom save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-11 px-6"
          >
            <X className="w-4 h-4 mr-1.5" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}

// ============ HELPER COMPONENTS ============

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <p className="text-sm text-gray-900 mt-0.5">{value || "—"}</p>
    </div>
  );
}
