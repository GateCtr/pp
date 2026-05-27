# 🇨🇩 Parcellaire RDC — Système Digital de Cartographie, Recensement et Signalétique Parcellaire

> Plateforme web et mobile (PWA) intégrée pour la dématérialisation et la sécurisation de la collecte des données foncières, le recensement des ménages et l'adressage urbain en République Démocratique du Congo.

---

## 🎯 Vision du Projet

Ce système remplace les formulaires physiques de collecte terrain par une application digitale qui :

- **Optimise** le travail des agents collecteurs sur le terrain via smartphone
- **Centralise** les données sous forme de brouillons en attente de validation administrative
- **Automatise** la génération de plaques parcellaires connectées équipées de QR Codes
- **Sécurise** l'ensemble du processus par une double authentification (Admin / Collecteur)

---

## 🏗️ Architecture Système

```
┌─────────────────────┐        ┌───────────────────┐        ┌─────────────────┐
│   Agent Terrain     │        │    Next.js 15     │        │  Neon Postgres  │
│  (PWA Smartphone)   │───────▶│  API + Frontend   │───────▶│   (Database)    │
│                     │        │    (Vercel)       │        │   500 Mo Free   │
└─────────────────────┘        └────────┬──────────┘        └─────────────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                   ┌─────▼─────┐  ┌─────▼─────┐  ┌───▼───────────┐
                   │   Clerk   │  │ QR + SVG  │  │ Cloudflare R2 │
                   │(Auth Admin)│  │ Generator │  │ (Stockage)    │
                   └───────────┘  └───────────┘  │  10 Go Free   │
                                                  └───────────────┘
```

---

## 🛠️ Stack Technique (100% Gratuit au lancement)

| Composant | Technologie | Plan |
|-----------|------------|------|
| Frontend + API | **Next.js 15** (App Router) + **Tailwind CSS v4** + **shadcn/ui** | — |
| Base de données | **Neon Postgres** (via **Drizzle ORM**) | Free 500 Mo |
| Auth Administrateurs | **Clerk** (email / Google) | Free 10k MAU |
| Auth Collecteurs | **JWT custom** (cookies HTTP-Only, 12h) | — |
| Stockage plaques/QR | **Cloudflare R2** (zéro frais de transfert sortant) | Free 10 Go |
| Génération plaques | **SVG dynamique** + **qrcode** (Node.js) | — |
| Hébergement | **Vercel** | Free Hobby |
| Validation données | **Zod v4** | — |
| Formulaires | **React Hook Form** | — |

---

## 📋 Spécifications des Données (5 Rubriques)

Le formulaire numérique retranscrit exactement la structure du formulaire terrain officiel :

### A. Identification de la Parcelle
| Champ | Exemple |
|-------|---------|
| District | Funa, Lukunga... |
| Commune * | Ngiri Ngiri |
| Secteur | — |
| Cité | — |
| Quartier * | Elengesa |
| Avenue / Rue * | Avenue Elengesa |
| N° Parcelle * | 6 |

### B. Informations sur le Propriétaire
| Champ | Type |
|-------|------|
| Nom complet * | Texte |
| Contact Tél. | Téléphone |
| Statut juridique | Certificat d'enregistrement / Titre foncier / Occupation coutumière / Autre |

### C. Occupation et Usage de la Parcelle
| Champ | Type |
|-------|------|
| Type de logement | Maison individuelle / Immeuble / Habitat collectif / Autre |
| Nombre de ménages résidents | Nombre |
| Nombre de locataires | Nombre |
| Valeur locative moyenne | USD (facultatif) |

### D. Informations sur les Locataires (jusqu'à 10 ménages)
| Champ | Type |
|-------|------|
| Nom du responsable de Ménage * | Texte |
| Téléphone | Téléphone |
| Taille de ménage | Nombre |

### E. Validation de la Collecte
| Champ | Mode |
|-------|------|
| Nom de l'agent collecteur | Automatique (session) |
| Date et heure de collecte | Horodatage auto |
| Signature numérique | Optionnelle |

---

## 🏷️ Plaque Parcellaire Numérique

Dès validation administrative d'une fiche, le moteur génère automatiquement une **plaque bleue normalisée** conforme au modèle officiel :

```
┌──────────────────────────────────────────────────┐
│  🇨🇩 [Drapeau]     COMMUNE DE          [Armoiries]│
│                  NGIRI NGIRI                      │
│              QUARTIER ELENGESA                    │
│  ─────────────────────────────────────────────── │
│              AVENUE ELENGESA                      │
│  ─────────────────────────────────────────────── │
│                   N° 6              [QR Code]     │
└──────────────────────────────────────────────────┘
```

**Éléments affichés :**
1. 🇨🇩 Drapeau national RDC (haut gauche)
2. Armoiries / Sceau officiel (haut droite)
3. Nom de la Commune (dynamique)
4. Quartier
5. Avenue / Rue
6. Numéro d'habitation (mis en évidence)
7. QR Code intelligent → page de vérification publique (lecture seule, sans données sensibles)

---

## ✨ Fonctionnalités

### 📱 Pour les Agents Collecteurs
- Connexion par **code d'accès unique** (pas de compte à créer)
- Formulaire **multi-étapes responsive** optimisé smartphone
- Gestion de **jusqu'à 10 ménages** par parcelle
- Mode **hors-ligne** (PWA avec Service Worker)
- Soumission automatique en **brouillon**

### 🖥️ Pour les Administrateurs
- **Tableau de bord** avec statistiques temps réel (total, en attente, validées, agents)
- **Validation / Rejet** des fiches de collecte
- **Génération automatique** des plaques parcellaires SVG + QR Code
- **Gestion des agents** collecteurs (création, codes d'accès auto-générés, activation/désactivation)
- Lien direct vers la plaque générée

### 🔍 Page de Vérification (Publique)
- Accessible par scan du QR Code sur la plaque physique
- Confirme l'enregistrement officiel de la parcelle
- **Aucune donnée sensible exposée** (ni noms, ni téléphones des locataires)
- Affiche uniquement : Commune, Quartier, Avenue, N°, statut et date de validation

---

## 🚀 Installation & Développement

### Prérequis
- Node.js 18+
- pnpm 8+
- Un compte [Neon](https://neon.tech) (base PostgreSQL gratuite)
- Un compte [Clerk](https://clerk.com) (authentification admin gratuite)

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/GateCtr/pp.git
cd pp/parcellaire

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Remplir les variables (voir section ci-dessous)

# 4. Créer les tables en base
pnpm drizzle-kit push

# 5. Lancer le serveur de développement
pnpm dev
```

L'application sera disponible sur `http://localhost:3000`

---

## 🔐 Variables d'Environnement

| Variable | Description | Obligatoire |
|----------|------------|:-----------:|
| `DATABASE_URL` | URL connexion Neon Postgres (avec `?sslmode=require`) | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk | ✅ |
| `CLERK_SECRET_KEY` | Clé secrète Clerk | ✅ |
| `COLLECTOR_JWT_SECRET` | Secret pour signer les tokens JWT collecteurs | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL de base (ex: `https://votre-app.vercel.app`) | ✅ |
| `R2_ACCOUNT_ID` | ID compte Cloudflare (pour stockage plaques) | ❌ |
| `R2_ACCESS_KEY_ID` | Clé d'accès R2 | ❌ |
| `R2_SECRET_ACCESS_KEY` | Secret R2 | ❌ |
| `R2_BUCKET_NAME` | Nom du bucket R2 | ❌ |
| `R2_PUBLIC_URL` | URL publique du bucket R2 | ❌ |

> **Note :** Sans R2 configuré, les plaques sont stockées en base de données encodées en base64 (suffisant pour la phase de lancement).

---

## ☁️ Déploiement sur Vercel (Gratuit)

1. **Connecter** le repo GitHub à [Vercel](https://vercel.com)
2. **Définir** le Root Directory : `parcellaire`
3. **Configurer** les variables d'environnement dans les Settings
4. **Déployer** — le build Next.js est automatique
5. **Mettre à jour** `NEXT_PUBLIC_APP_URL` avec l'URL Vercel générée

---

## 📂 Structure du Projet

```
parcellaire/
├── drizzle.config.ts               # Configuration Drizzle Kit
├── public/
│   ├── manifest.json               # PWA manifest
│   └── sw.js                       # Service Worker (offline)
├── src/
│   ├── app/
│   │   ├── page.tsx                # Page d'accueil (choix Collecteur/Admin)
│   │   ├── layout.tsx              # Layout global (Clerk + PWA + Toaster)
│   │   ├── collecteur/
│   │   │   ├── login/page.tsx      # Connexion par code d'accès
│   │   │   ├── layout.tsx          # Layout protégé collecteur
│   │   │   └── page.tsx            # Formulaire de collecte (5 étapes)
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Layout admin (sidebar + Clerk)
│   │   │   ├── page.tsx            # Tableau de bord (statistiques)
│   │   │   ├── parcelles/page.tsx  # Liste + validation des parcelles
│   │   │   └── collecteurs/page.tsx# Gestion des agents
│   │   ├── verification/
│   │   │   └── [id]/page.tsx       # Page publique scan QR
│   │   └── api/
│   │       ├── auth/collector/     # POST login / GET logout
│   │       ├── parcelles/          # GET list / POST create
│   │       ├── parcelles/[id]/validate/ # POST valider/rejeter
│   │       ├── collecteurs/        # POST créer agent
│   │       └── plate-image/[id]/   # GET rendu SVG plaque
│   ├── components/
│   │   ├── ui/                     # shadcn/ui (button, card, input, select...)
│   │   ├── forms/parcelle-form.tsx # Formulaire multi-étapes
│   │   ├── admin/                  # Actions admin + form ajout agent
│   │   └── pwa-register.tsx        # Enregistrement Service Worker
│   ├── db/
│   │   ├── schema.ts              # Tables: parcelles, menages, agents_collecteurs
│   │   └── index.ts               # Connexion Neon + Drizzle
│   ├── lib/
│   │   ├── auth.ts                # Helpers session collecteur (JWT)
│   │   ├── validations.ts         # Schémas Zod (formulaire)
│   │   └── plate-generator.ts     # Moteur génération SVG + QR Code
│   └── middleware.ts              # Clerk middleware (protection /admin)
├── .env.example                    # Template variables d'environnement
├── package.json
└── tsconfig.json
```

---

## 🗃️ Schéma Base de Données

```
┌─────────────────────┐       ┌──────────────────┐
│  agents_collecteurs │       │     parcelles    │
├─────────────────────┤       ├──────────────────┤
│ id (uuid PK)        │◀──┐   │ id (uuid PK)     │
│ nom                  │   │   │ district         │
│ telephone            │   │   │ commune          │
│ code_acces (unique)  │   │   │ quartier         │
│ actif (bool)         │   │   │ avenue           │
│ cree_le              │   └───│ agent_id (FK)    │
└─────────────────────┘       │ statut_validation│
                              │ plaque_image_url │
                              │ qr_code_url      │
                              │ ...              │
                              └────────┬─────────┘
                                       │ 1:N
                              ┌────────▼─────────┐
                              │     menages      │
                              ├──────────────────┤
                              │ id (uuid PK)     │
                              │ parcelle_id (FK) │
                              │ nom_responsable  │
                              │ telephone        │
                              │ taille_menage    │
                              │ ordre            │
                              └──────────────────┘
```

**Statuts de validation :** `brouillon` → `valide` | `rejete`

---

## 🔄 Flux de Travail

```
1. L'admin crée un Agent Collecteur → code d'accès généré
2. L'agent se connecte sur terrain (smartphone, PWA)
3. L'agent remplit le formulaire 5 étapes → soumission en "brouillon"
4. L'admin consulte les fiches en attente dans le dashboard
5. L'admin VALIDE → plaque SVG + QR Code générés automatiquement
        ou REJETTE → fiche marquée rejetée
6. La plaque est imprimable et le QR redirige vers /verification/[id]
7. Tout citoyen scannant le QR voit la confirmation officielle
```

---

## 📄 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Serveur de développement (port 3000) |
| `pnpm build` | Build de production |
| `pnpm start` | Démarrer en production |
| `pnpm lint` | Linter ESLint |
| `pnpm drizzle-kit generate` | Générer les fichiers de migration |
| `pnpm drizzle-kit push` | Appliquer le schéma directement en base |
| `pnpm drizzle-kit studio` | Interface visuelle pour explorer la DB |

---

## 🛡️ Sécurité

- **Admin** : Authentification Clerk (OAuth, MFA possible)
- **Collecteur** : JWT signé en cookie HTTP-Only, SameSite=Lax, Secure en prod
- **Middleware** : Toutes les routes `/admin/*` protégées côté serveur
- **Validation** : Schémas Zod côté serveur pour toutes les entrées API
- **QR Public** : Aucune donnée personnelle exposée (ni noms ni téléphones des résidents)

---

## 📱 PWA (Progressive Web App)

L'application est installable sur smartphone :
1. Ouvrir l'URL dans Chrome/Safari mobile
2. Menu → "Ajouter à l'écran d'accueil"
3. L'app fonctionne comme une application native
4. Cache hors-ligne pour les pages déjà visitées

---

## 🗺️ Roadmap

- [ ] Export CSV/Excel des données parcellaires
- [ ] Géolocalisation GPS automatique lors de la collecte
- [ ] Upload de photos de la parcelle
- [ ] Notifications push lors de la validation
- [ ] Tableau de bord statistiques avancé (graphiques par commune)
- [ ] Migration vers Cloudflare R2 pour stockage des plaques en production
- [ ] Mode multi-langue (Lingala, Swahili)
- [ ] Impression batch de plaques (PDF multi-pages)

---

## 📜 Licence

Projet propriétaire — Tous droits réservés.  
République Démocratique du Congo.
