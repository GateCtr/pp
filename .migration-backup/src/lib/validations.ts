import { z } from "zod";

export const menageSchema = z.object({
  nomResponsable: z.string().min(2, "Nom requis (min 2 caractères)"),
  telephone: z.string().optional(),
  tailleMenage: z.coerce.number().min(1, "Minimum 1 personne").default(1),
});

export const parcelleFormSchema = z.object({
  // A. Identification
  district: z.string().optional(),
  commune: z.string().min(2, "Commune requise"),
  secteur: z.string().optional(),
  cite: z.string().optional(),
  quartier: z.string().min(2, "Quartier requis"),
  avenue: z.string().min(2, "Avenue/Rue requise"),
  numero: z.string().min(1, "Numéro requis"),
  // B. Propriétaire
  proprietaireNom: z.string().min(2, "Nom du propriétaire requis"),
  proprietaireTel: z.string().optional(),
  statutJuridique: z
    .enum([
      "certificat_enregistrement",
      "titre_foncier",
      "occupation_coutumiere",
      "autre",
    ])
    .optional(),
  // C. Occupation
  typeLogement: z
    .enum(["maison_individuelle", "immeuble", "habitat_collectif", "autre"])
    .optional(),
  nombreMenages: z.coerce.number().min(0).default(0),
  nombreLocataires: z.coerce.number().min(0).default(0),
  valeurLocative: z.string().optional(),
  // D. Ménages
  menages: z.array(menageSchema).default([]),
});

export type ParcelleFormData = z.infer<typeof parcelleFormSchema>;
