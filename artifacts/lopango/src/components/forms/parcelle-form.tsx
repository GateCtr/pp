"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { type ParcelleFormData } from "@/lib/validations";
import { type ZoneInfo } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  MapPin,
  User,
  Home,
  Users,
  Send,
  ChevronLeft,
  ChevronRight,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { GeoSelector, type GeoSelection } from "@/components/forms/geo-selector";
import { toast } from "sonner";

const STEPS = [
  { label: "Localisation", icon: MapPin, color: "blue" },
  { label: "Propriétaire", icon: User, color: "violet" },
  { label: "Occupation", icon: Home, color: "amber" },
  { label: "Ménages", icon: Users, color: "emerald" },
  { label: "Envoi", icon: Send, color: "indigo" },
];

interface Props {
  zone?: ZoneInfo;
}

export function ParcelleForm({ zone }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [numeroExists, setNumeroExists] = useState(false);
  const [checkingNumero, setCheckingNumero] = useState(false);
  const [geoSelection, setGeoSelection] = useState<GeoSelection | null>(null);

  const hasZone = Boolean(zone?.avenueId);
  // effective avenueId: either from locked zone or from manually selected geo
  const effectiveAvenueId = zone?.avenueId ?? geoSelection?.avenueId ?? "";

  const form = useForm<ParcelleFormData>({
    defaultValues: {
      district: zone?.villeOuTerritoireNom ?? "",
      commune: zone?.communeNom ?? "",
      secteur: "",
      cite: "",
      quartier: zone?.quartierNom ?? "",
      avenue: zone?.avenueNom ?? "",
      avenueId: zone?.avenueId ?? "",
      numero: "",
      proprietaireNom: "",
      proprietaireTel: "",
      nombreMenages: 0,
      nombreLocataires: 0,
      valeurLocative: "",
      menages: [],
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
  } = form;

  const watchNumero = watch("numero");

  const checkDuplicate = useCallback(
    async (numero: string) => {
      if (!effectiveAvenueId || !numero.trim()) {
        setNumeroExists(false);
        return;
      }
      setCheckingNumero(true);
      try {
        const res = await fetch(
          `/api/parcelles/check-numero?avenueId=${encodeURIComponent(effectiveAvenueId)}&numero=${encodeURIComponent(numero)}`
        );
        const data = await res.json();
        setNumeroExists(data.exists);
      } catch {
        // offline — skip check
      } finally {
        setCheckingNumero(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveAvenueId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchNumero) checkDuplicate(watchNumero);
    }, 500);
    return () => clearTimeout(timer);
  }, [watchNumero, checkDuplicate]);

  async function onSubmit(data: ParcelleFormData) {
    if (numeroExists) {
      toast.error("Ce numéro existe déjà sur cette avenue — vérifiez avant de soumettre.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/parcelles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de l'enregistrement");
        return;
      }

      setSubmitted(true);
      toast.success("Parcelle enregistrée avec succès !");
    } catch {
      try {
        const { saveOfflineParcelle } = await import("@/lib/offline-storage");
        await saveOfflineParcelle(data as unknown as Record<string, unknown>);
        setSubmitted(true);
        toast.success("Sauvegardé hors-ligne ! Sera synchronisé dès le retour de la connexion.");
      } catch {
        toast.error("Erreur de connexion au serveur");
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Collecte Enregistrée !</h2>
        <p className="text-gray-500 text-center mb-8 max-w-xs">
          La fiche a été soumise en tant que brouillon en attente de validation administrative.
        </p>
        <Button
          onClick={() => {
            setSubmitted(false);
            setStep(0);
            form.reset({
              district: zone?.villeOuTerritoireNom ?? "",
              commune: zone?.communeNom ?? "",
              secteur: "",
              cite: "",
              quartier: zone?.quartierNom ?? "",
              avenue: zone?.avenueNom ?? "",
              avenueId: zone?.avenueId ?? "",
              numero: "",
              proprietaireNom: "",
              proprietaireTel: "",
              nombreMenages: 0,
              nombreLocataires: 0,
              valeurLocative: "",
              menages: [],
            });
            setNumeroExists(false);
            setGeoSelection(null);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Collecte
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Step Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500">
            Étape {step + 1} sur {STEPS.length}
          </span>
          <span className="text-xs font-semibold text-blue-600">
            {STEPS[step].label}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="hidden sm:flex items-center justify-between mt-4">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                i === step
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : i < step
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === step
                    ? "bg-blue-600 text-white"
                    : i < step
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className="hidden lg:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Step 0: Identification */}
        {step === 0 && (
          <Card className="border-0 shadow-lg shadow-gray-200/50 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Identification de la Parcelle</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Localisation géographique</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Zone locked banner */}
              {hasZone ? (
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    Zone affectée — pré-remplie automatiquement
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="text-gray-400">Ville / Territoire</span>
                      <p className="font-semibold text-gray-800">{zone?.villeOuTerritoireNom || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Commune</span>
                      <p className="font-semibold text-gray-800">{zone?.communeNom || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Quartier</span>
                      <p className="font-semibold text-gray-800">{zone?.quartierNom || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Avenue</span>
                      <p className="font-semibold text-gray-800">{zone?.avenueNom || "—"}</p>
                    </div>
                  </div>

                  {/* Hidden fields */}
                  <input type="hidden" {...register("avenueId")} />
                  <input type="hidden" {...register("commune")} />
                  <input type="hidden" {...register("quartier")} />
                  <input type="hidden" {...register("avenue")} />
                  <input type="hidden" {...register("district")} />

                  {/* Only numero is editable */}
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Numéro de parcelle <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        {...register("numero")}
                        placeholder="ex: 47"
                        className={`h-12 text-lg font-bold text-center ${
                          numeroExists
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "bg-white border-blue-200 focus:border-blue-400"
                        }`}
                        autoFocus
                      />
                      {checkingNumero && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                        </div>
                      )}
                    </div>
                    {errors.numero && (
                      <p className="text-red-500 text-xs">{errors.numero.message}</p>
                    )}
                    {numeroExists && !checkingNumero && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>
                          Ce numéro existe déjà sur cette avenue. Vérifiez sur le terrain avant de continuer.
                        </span>
                      </div>
                    )}
                    {!numeroExists && watchNumero && !checkingNumero && zone?.avenueId && (
                      <p className="text-emerald-600 text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Numéro disponible
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* No zone — cascading geo tree selector */
                <>
                  {/* Hidden form fields kept in sync by the GeoSelector */}
                  <input type="hidden" {...register("avenueId")} />
                  <input type="hidden" {...register("commune")} />
                  <input type="hidden" {...register("secteur")} />
                  <input type="hidden" {...register("quartier")} />
                  <input type="hidden" {...register("avenue")} />
                  <input type="hidden" {...register("district")} />

                  <GeoSelector
                    selected={geoSelection}
                    onSelect={(sel) => {
                      setGeoSelection(sel);
                      setValue("avenueId", sel.avenueId);
                      setValue("commune", sel.commune);
                      setValue("secteur", sel.secteur);
                      setValue("quartier", sel.quartier);
                      setValue("avenue", sel.avenueNom);
                      setValue("district", sel.district);
                      setNumeroExists(false);
                    }}
                    onClear={() => {
                      setGeoSelection(null);
                      setValue("avenueId", "");
                      setValue("commune", "");
                      setValue("secteur", "");
                      setValue("quartier", "");
                      setValue("avenue", "");
                      setValue("district", "");
                      setValue("numero", "");
                      setNumeroExists(false);
                    }}
                  />

                  {/* Numero input — only shown once an avenue is selected */}
                  {geoSelection && (
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-semibold text-gray-700">
                        Numéro de parcelle <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          {...register("numero")}
                          placeholder="ex: 47"
                          className={`h-12 text-lg font-bold text-center ${
                            numeroExists
                              ? "border-red-300 bg-red-50 text-red-700"
                              : "bg-white border-blue-200 focus:border-blue-400"
                          }`}
                          autoFocus
                        />
                        {checkingNumero && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                          </div>
                        )}
                      </div>
                      {errors.numero && (
                        <p className="text-red-500 text-xs">{errors.numero.message}</p>
                      )}
                      {numeroExists && !checkingNumero && (
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>Ce numéro existe déjà sur cette avenue. Vérifiez sur le terrain avant de continuer.</span>
                        </div>
                      )}
                      {!numeroExists && watchNumero && !checkingNumero && (
                        <p className="text-emerald-600 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Numéro disponible
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 1: Proprietaire */}
        {step === 1 && (
          <Card className="border-0 shadow-lg shadow-gray-200/50 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Informations Propriétaire</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Identité et statut juridique</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Nom complet <span className="text-red-400">*</span>
                </Label>
                <Input
                  {...register("proprietaireNom")}
                  placeholder="Nom du propriétaire"
                  className="h-11 bg-gray-50/50"
                />
                {errors.proprietaireNom && (
                  <p className="text-red-500 text-xs">{errors.proprietaireNom.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Téléphone</Label>
                <Input
                  {...register("proprietaireTel")}
                  placeholder="+243 ..."
                  type="tel"
                  className="h-11 bg-gray-50/50"
                />
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
        )}

        {/* Step 2: Occupation */}
        {step === 2 && (
          <Card className="border-0 shadow-lg shadow-gray-200/50 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Home className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Occupation & Usage</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Type de logement et habitants</p>
                </div>
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
                <Label className="text-xs font-medium text-gray-600">
                  Valeur locative moyenne <span className="text-gray-400">(facultatif)</span>
                </Label>
                <Input
                  {...register("valeurLocative")}
                  placeholder="En USD"
                  className="h-11 bg-gray-50/50"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Ménages */}
        {step === 3 && (
          <Card className="border-0 shadow-lg shadow-gray-200/50 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Locataires & Ménages</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Jusqu&apos;à 10 ménages par parcelle</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 space-y-3 animate-fade-in"
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

              {fields.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Aucun ménage ajouté</p>
                  <p className="text-gray-300 text-xs mt-1">Cliquez le bouton ci-dessus pour en ajouter</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Validation */}
        {step === 4 && (
          <Card className="border-0 shadow-lg shadow-gray-200/50 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Send className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Récapitulatif & Envoi</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Vérifiez avant de soumettre</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {hasZone ? (
                    <>
                      <div>
                        <span className="text-gray-500 text-xs">Ville / Territoire</span>
                        <p className="font-medium text-gray-900">{zone?.villeOuTerritoireNom || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Commune</span>
                        <p className="font-medium text-gray-900">{zone?.communeNom || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Quartier</span>
                        <p className="font-medium text-gray-900">{zone?.quartierNom || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Avenue</span>
                        <p className="font-medium text-gray-900">{zone?.avenueNom || "—"}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-500 text-xs">Commune</span>
                        <p className="font-medium text-gray-900">{watch("commune") || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Quartier</span>
                        <p className="font-medium text-gray-900">{watch("quartier") || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Avenue</span>
                        <p className="font-medium text-gray-900">{watch("avenue") || "—"}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-gray-500 text-xs">Numéro</span>
                    <p className="font-bold text-lg text-blue-700">N° {watch("numero") || "—"}</p>
                  </div>
                </div>
                <Separator className="bg-blue-200/50" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Propriétaire</span>
                    <p className="font-medium text-gray-900">{watch("proprietaireNom") || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Ménages</span>
                    <p className="font-medium text-gray-900">{fields.length} enregistré(s)</p>
                  </div>
                </div>
              </div>

              {numeroExists && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">
                    <strong>Attention :</strong> Le numéro N°{watch("numero")} existe déjà sur {zone?.avenueNom}. Retournez à l&apos;étape 1 pour corriger.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-700 text-xs font-bold">!</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  La fiche sera enregistrée en <strong>brouillon</strong> et devra être validée
                  par un administrateur avant la génération de la plaque parcellaire.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="h-11 px-4 sm:px-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Précédent</span>
            <span className="sm:hidden">Retour</span>
          </Button>

          <div className="flex items-center gap-1.5 sm:hidden">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-blue-500" : i < step ? "w-1.5 bg-emerald-400" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              className="h-11 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
            >
              <span className="hidden sm:inline">Suivant</span>
              <span className="sm:hidden">Suite</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={loading || numeroExists}
              onClick={handleSubmit(onSubmit)}
              className="h-11 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Soumettre
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
