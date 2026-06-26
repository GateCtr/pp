CREATE TYPE "public"."statut_juridique" AS ENUM('certificat_enregistrement', 'titre_foncier', 'occupation_coutumiere', 'autre');--> statement-breakpoint
CREATE TYPE "public"."statut_validation" AS ENUM('brouillon', 'valide', 'rejete');--> statement-breakpoint
CREATE TYPE "public"."type_logement" AS ENUM('maison_individuelle', 'immeuble', 'habitat_collectif', 'autre');--> statement-breakpoint
CREATE TABLE "agents_collecteurs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar(255) NOT NULL,
	"telephone" varchar(20),
	"code_acces" varchar(50) NOT NULL,
	"actif" boolean DEFAULT true,
	"cree_le" timestamp DEFAULT now(),
	CONSTRAINT "agents_collecteurs_code_acces_unique" UNIQUE("code_acces")
);
--> statement-breakpoint
CREATE TABLE "menages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parcelle_id" uuid NOT NULL,
	"nom_responsable" varchar(255) NOT NULL,
	"telephone" varchar(20),
	"taille_menage" integer DEFAULT 1,
	"ordre" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "parcelles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"district" varchar(255),
	"commune" varchar(255) NOT NULL,
	"secteur" varchar(255),
	"cite" varchar(255),
	"quartier" varchar(255) NOT NULL,
	"avenue" varchar(255) NOT NULL,
	"numero" varchar(50) NOT NULL,
	"proprietaire_nom" varchar(255) NOT NULL,
	"proprietaire_tel" varchar(20),
	"statut_juridique" "statut_juridique",
	"type_logement" "type_logement",
	"nombre_menages" integer DEFAULT 0,
	"nombre_locataires" integer DEFAULT 0,
	"valeur_locative" numeric(12, 2),
	"statut_validation" "statut_validation" DEFAULT 'brouillon' NOT NULL,
	"agent_id" uuid,
	"date_collecte" timestamp DEFAULT now(),
	"date_validation" timestamp,
	"signature_numerique" text,
	"qr_code_url" text,
	"plaque_image_url" text,
	"cree_le" timestamp DEFAULT now(),
	"mis_a_jour" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "menages" ADD CONSTRAINT "menages_parcelle_id_parcelles_id_fk" FOREIGN KEY ("parcelle_id") REFERENCES "public"."parcelles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcelles" ADD CONSTRAINT "parcelles_agent_id_agents_collecteurs_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents_collecteurs"("id") ON DELETE no action ON UPDATE no action;