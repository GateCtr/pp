"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { type ParcelleFormData } from "@/lib/validations";
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
import { Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  "Identification",
  "Propriétaire",
  "Occupation",
  "Ménages",
  "Validation",
];

export function ParcelleForm() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ParcelleFormData>({
    defaultValues: {
      district: "",
      commune: "",
      secteur: "",
      cite: "",
      quartier: "",
      avenue: "",
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

  async function onSubmit(data: ParcelleFormData) {
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
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Collecte Enregistrée !
          </h2>
          <p className="text-gray-600 mb-6">
            La fiche a été soumise en tant que brouillon en attente de validation.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setStep(0);
              form.reset();
            }}
          >
            Nouvelle Collecte
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 text-xs font-medium ${
              i === step
                ? "text-blue-700"
                : i < step
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                i === step
                  ? "bg-blue-700 text-white"
                  : i < step
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className="hidden sm:inline">{s}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Identification */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">A. Identification de la Parcelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="district">District</Label>
                  <Input {...register("district")} placeholder="ex: Funa" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="commune">Commune *</Label>
                  <Input
                    {...register("commune")}
                    placeholder="ex: Ngiri Ngiri"
                  />
                  {errors.commune && (
                    <p className="text-red-500 text-xs">{errors.commune.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Secteur</Label>
                  <Input {...register("secteur")} />
                </div>
                <div className="space-y-1">
                  <Label>Cité</Label>
                  <Input {...register("cite")} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Quartier *</Label>
                <Input
                  {...register("quartier")}
                  placeholder="ex: Elengesa"
                />
                {errors.quartier && (
                  <p className="text-red-500 text-xs">{errors.quartier.message}</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label>Avenue / Rue *</Label>
                  <Input
                    {...register("avenue")}
                    placeholder="ex: Avenue Elengesa"
                  />
                  {errors.avenue && (
                    <p className="text-red-500 text-xs">{errors.avenue.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>N° Parcelle *</Label>
                  <Input {...register("numero")} placeholder="ex: 6" />
                  {errors.numero && (
                    <p className="text-red-500 text-xs">{errors.numero.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Proprietaire */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">B. Informations sur le Propriétaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Nom complet *</Label>
                <Input
                  {...register("proprietaireNom")}
                  placeholder="Nom du propriétaire"
                />
                {errors.proprietaireNom && (
                  <p className="text-red-500 text-xs">
                    {errors.proprietaireNom.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Contact Téléphone</Label>
                <Input
                  {...register("proprietaireTel")}
                  placeholder="+243..."
                  type="tel"
                />
              </div>
              <div className="space-y-1">
                <Label>Statut juridique</Label>
                <Select
                  onValueChange={(v) =>
                    setValue("statutJuridique", v as ParcelleFormData["statutJuridique"])
                  }
                  defaultValue={watch("statutJuridique") || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">C. Occupation et Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Type de logement</Label>
                <Select
                  onValueChange={(v) =>
                    setValue("typeLogement", v as ParcelleFormData["typeLogement"])
                  }
                  defaultValue={watch("typeLogement") || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maison_individuelle">
                      Maison individuelle
                    </SelectItem>
                    <SelectItem value="immeuble">Immeuble</SelectItem>
                    <SelectItem value="habitat_collectif">
                      Habitat collectif
                    </SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Nombre de ménages</Label>
                  <Input
                    {...register("nombreMenages")}
                    type="number"
                    min={0}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Nombre de locataires</Label>
                  <Input
                    {...register("nombreLocataires")}
                    type="number"
                    min={0}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Valeur locative moyenne (facultatif)</Label>
                <Input
                  {...register("valeurLocative")}
                  placeholder="En USD"
                  type="text"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Ménages */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">D. Informations sur les Locataires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg bg-gray-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-700">
                      Ménage {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <Label>Nom du responsable *</Label>
                    <Input
                      {...register(`menages.${index}.nomResponsable`)}
                      placeholder="Nom complet"
                    />
                    {errors.menages?.[index]?.nomResponsable && (
                      <p className="text-red-500 text-xs">
                        {errors.menages[index].nomResponsable?.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Téléphone</Label>
                      <Input
                        {...register(`menages.${index}.telephone`)}
                        placeholder="+243..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Taille ménage</Label>
                      <Input
                        {...register(`menages.${index}.tailleMenage`)}
                        type="number"
                        min={1}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {fields.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    append({ nomResponsable: "", telephone: "", tailleMenage: 1 })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un ménage ({fields.length}/10)
                </Button>
              )}

              {fields.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Aucun ménage ajouté. Cliquez le bouton ci-dessus pour en ajouter.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Validation */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">E. Validation de la Collecte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-blue-800">
                  <strong>Commune :</strong> {watch("commune")}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Quartier :</strong> {watch("quartier")}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Avenue :</strong> {watch("avenue")} N° {watch("numero")}
                </p>
                <Separator />
                <p className="text-sm text-blue-800">
                  <strong>Propriétaire :</strong> {watch("proprietaireNom")}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Ménages :</strong> {fields.length} enregistré(s)
                </p>
              </div>
              <p className="text-xs text-gray-500">
                La fiche sera enregistrée en tant que <strong>brouillon</strong> et
                devra être validée par un administrateur avant la génération de la
                plaque parcellaire.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            Précédent
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            >
              Suivant
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Soumettre la Fiche"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
