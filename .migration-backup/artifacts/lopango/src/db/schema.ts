import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
  boolean,
  numeric,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

// Enums
export const statutValidationEnum = pgEnum("statut_validation", [
  "brouillon",
  "valide",
  "rejete",
]);

export const statutJuridiqueEnum = pgEnum("statut_juridique", [
  "certificat_enregistrement",
  "titre_foncier",
  "occupation_coutumiere",
  "autre",
]);

export const typeLogementEnum = pgEnum("type_logement", [
  "maison_individuelle",
  "immeuble",
  "habitat_collectif",
  "autre",
]);

export const statutAgentEnum = pgEnum("statut_agent", [
  "actif",
  "suspendu",
  "revoque",
  "archive",
]);

export const typeLieuEnum = pgEnum("type_lieu", [
  "ville",
  "territoire",
  "commune",
  "secteur",
  "chefferie",
  "cite",
  "quartier",
  "village",
]);

// ─── Geographic hierarchy (Kongo Central) ────────────────────────────────────

export const lieuxGeo = pgTable("lieux_geo", {
  id: uuid("id").defaultRandom().primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  type: typeLieuEnum("type").notNull(),
  // self-referencing: ville/territoire → commune/secteur → quartier/village
  parentId: uuid("parent_id"),
  code: varchar("code", { length: 50 }),
  actif: boolean("actif").default(true).notNull(),
  creeLe: timestamp("cree_le").defaultNow(),
});

export const avenues = pgTable("avenues", {
  id: uuid("id").defaultRandom().primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  quartierId: uuid("quartier_id")
    .references(() => lieuxGeo.id, { onDelete: "cascade" })
    .notNull(),
  actif: boolean("actif").default(true).notNull(),
  creeLe: timestamp("cree_le").defaultNow(),
});

// Tables
export const agentsCollecteurs = pgTable("agents_collecteurs", {
  id: uuid("id").defaultRandom().primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 20 }),
  codeAcces: varchar("code_acces", { length: 50 }).notNull().unique(),
  actif: boolean("actif").default(true),
  statut: statutAgentEnum("statut").default("actif").notNull(),
  creeLe: timestamp("cree_le").defaultNow(),
  misAJour: timestamp("mis_a_jour").defaultNow(),
  modifiePar: varchar("modifie_par", { length: 255 }),
});

// Zone assignments — one agent can cover multiple avenues/quartiers
export const affectationsAgents = pgTable("affectations_agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id")
    .references(() => agentsCollecteurs.id, { onDelete: "cascade" })
    .notNull(),
  avenueId: uuid("avenue_id").references(() => avenues.id),
  quartierId: uuid("quartier_id").references(() => lieuxGeo.id),
  actif: boolean("actif").default(true).notNull(),
  dateDebut: timestamp("date_debut").defaultNow(),
  dateFin: timestamp("date_fin"),
  creeLe: timestamp("cree_le").defaultNow(),
});

export const parcelles = pgTable("parcelles", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Identification
  district: varchar("district", { length: 255 }),
  commune: varchar("commune", { length: 255 }).notNull(),
  secteur: varchar("secteur", { length: 255 }),
  cite: varchar("cite", { length: 255 }),
  quartier: varchar("quartier", { length: 255 }).notNull(),
  avenue: varchar("avenue", { length: 255 }).notNull(),
  numero: varchar("numero", { length: 50 }).notNull(),
  // FK to structured geo (set when agent has an affectation)
  avenueId: uuid("avenue_id").references(() => avenues.id),
  // Propriétaire
  proprietaireNom: varchar("proprietaire_nom", { length: 255 }).notNull(),
  proprietaireTel: varchar("proprietaire_tel", { length: 20 }),
  statutJuridique: statutJuridiqueEnum("statut_juridique"),
  // Occupation
  typeLogement: typeLogementEnum("type_logement"),
  nombreMenages: integer("nombre_menages").default(0),
  nombreLocataires: integer("nombre_locataires").default(0),
  valeurLocative: numeric("valeur_locative", { precision: 12, scale: 2 }),
  // Validation
  statutValidation: statutValidationEnum("statut_validation")
    .default("brouillon")
    .notNull(),
  agentId: uuid("agent_id").references(() => agentsCollecteurs.id),
  dateCollecte: timestamp("date_collecte").defaultNow(),
  dateValidation: timestamp("date_validation"),
  signatureNumerique: text("signature_numerique"),
  // QR / Plaque
  qrCodeUrl: text("qr_code_url"),
  plaqueImageUrl: text("plaque_image_url"),
  templateId: uuid("template_id").references(() => plateTemplates.id),
  variantIndex: integer("variant_index"),
  // Audit
  creeLe: timestamp("cree_le").defaultNow(),
  misAJour: timestamp("mis_a_jour").defaultNow(),
  modifiePar: varchar("modifie_par", { length: 255 }),
  motifModification: text("motif_modification"),
}, (t) => ({
  avenueNumeroUnique: unique("parcelle_avenue_numero_unique").on(t.avenueId, t.numero),
}));

// Plate Templates
export const plateTemplates = pgTable("plate_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  description: text("description"),
  // Design config (JSON with colors, fonts, shapes per variant)
  variants: jsonb("variants").notNull().default("[]"),
  // Shared assets
  flagUrl: text("flag_url"),
  sealUrl: text("seal_url"),
  // Status
  actif: boolean("actif").default(true),
  creeLe: timestamp("cree_le").defaultNow(),
  misAJour: timestamp("mis_a_jour").defaultNow(),
});

// Assets (uploaded files tracked in DB)
export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 20 }).notNull(), // "flag" | "seal"
  url: text("url").notNull(),
  filename: varchar("filename", { length: 255 }),
  creeLe: timestamp("cree_le").defaultNow(),
});

export const menages = pgTable("menages", {
  id: uuid("id").defaultRandom().primaryKey(),
  parcelleId: uuid("parcelle_id")
    .references(() => parcelles.id, { onDelete: "cascade" })
    .notNull(),
  nomResponsable: varchar("nom_responsable", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 20 }),
  tailleMenage: integer("taille_menage").default(1),
  ordre: integer("ordre").default(1),
});

// Types
export type AgentCollecteur = typeof agentsCollecteurs.$inferSelect;
export type NewAgentCollecteur = typeof agentsCollecteurs.$inferInsert;
export type Parcelle = typeof parcelles.$inferSelect;
export type NewParcelle = typeof parcelles.$inferInsert;
export type Menage = typeof menages.$inferSelect;
export type NewMenage = typeof menages.$inferInsert;
export type PlateTemplate = typeof plateTemplates.$inferSelect;
export type NewPlateTemplate = typeof plateTemplates.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type LieuGeo = typeof lieuxGeo.$inferSelect;
export type NewLieuGeo = typeof lieuxGeo.$inferInsert;
export type Avenue = typeof avenues.$inferSelect;
export type NewAvenue = typeof avenues.$inferInsert;
export type AffectationAgent = typeof affectationsAgents.$inferSelect;

// Variant design type
export interface VariantDesign {
  name: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  shape: "rectangle" | "rounded" | "rounded-lg";
  avenueColor?: string;
  headerColor?: string;
  // Couleurs individuelles par élément
  communeNameColor?: string;   // nom de la commune (ex: KISANTU)
  avenueTextColor?: string;    // texte de l'avenue (ex: AVENUE KINGOMA)
  numeroLabelColor?: string;   // libellé "N°"
  numeroColor?: string;        // le chiffre du numéro
  hLineColor?: string;         // ligne horizontale séparant l'en-tête
  vLineColor?: string;         // ligne verticale séparant N° et QR code
}
