# Parcellaire RDC — Système Digital de Cartographie et Recensement

Plateforme web et mobile (PWA) pour la dématérialisation de la collecte des données foncières, le recensement des ménages et l'adressage urbain en République Démocratique du Congo.

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Agent Terrain  │────▶│  Next.js API │────▶│ Neon Postgres│
│  (PWA Mobile)   │     │  (Vercel)    │     │  (Database)  │
└─────────────────┘     └──────┬───────┘     └─────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐       ┌──────▼──────┐
              │   Clerk    │       │ Cloudflare  │
              │(Admin Auth)│       │  R2 (Files) │
              └───────────┘       └─────────────┘
```

## Stack Technique

| Composant | Technologie |
|-----------|------------|
| Frontend + API | **Next.js 15** (App Router) + **Tailwind CSS** + **shadcn/ui** |
| Base de données | **Neon Postgres** (via Drizzle ORM) |
| Auth Admin | **Clerk** |
| Auth Collecteurs | JWT custom (cookies HTTP-Only) |
| Stockage fichiers | **Cloudflare R2** |
| Génération plaques | SVG dynamique + QRCode |
| Hébergement | **Vercel** (gratuit) |

## Fonctionnalités

### Pour les Agents Collecteurs
- Formulaire multi-étapes responsive (5 rubriques)
- Mode hors-ligne (PWA/Service Worker)
- Enregistrement de parcelles comme brouillon
- Gestion de jusqu'à 10 ménages par parcelle

### Pour les Administrateurs
- Tableau de bord avec statistiques en temps réel
- Validation/rejet des fiches de collecte
- Génération automatique de plaques parcellaires bleues
- Gestion des agents collecteurs (création, codes d'accès)

### Plaque Parcellaire Numérique
- Conforme au modèle officiel RDC
- Drapeau national + armoiries
- Commune / Quartier / Avenue / Numéro
- QR Code intelligent renvoyant vers la page de vérification

## Installation

```bash
# Cloner le repo
git clone https://github.com/GateCtr/pp.git
cd pp/parcellaire

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env.local
# Remplir les variables dans .env.local

# Générer les migrations
pnpm drizzle-kit generate

# Appliquer les migrations
pnpm drizzle-kit push

# Lancer en développement
pnpm dev
```

## Variables d'Environnement

| Variable | Description |
|----------|------------|
| `DATABASE_URL` | URL de connexion Neon Postgres |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk |
| `CLERK_SECRET_KEY` | Clé secrète Clerk |
| `COLLECTOR_JWT_SECRET` | Secret pour les tokens JWT collecteurs |
| `NEXT_PUBLIC_APP_URL` | URL de base de l'application |
| `R2_ACCOUNT_ID` | ID compte Cloudflare |
| `R2_ACCESS_KEY_ID` | Clé d'accès R2 |
| `R2_SECRET_ACCESS_KEY` | Secret R2 |
| `R2_BUCKET_NAME` | Nom du bucket R2 |

## Déploiement sur Vercel

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer — le build Next.js est automatique

## Structure du Projet

```
src/
├── app/
│   ├── page.tsx                    # Page d'accueil
│   ├── collecteur/                 # Interface collecteur
│   │   ├── login/page.tsx         # Connexion par code
│   │   └── page.tsx               # Formulaire de collecte
│   ├── admin/                      # Dashboard admin (Clerk)
│   │   ├── page.tsx               # Tableau de bord
│   │   ├── parcelles/page.tsx     # Gestion parcelles
│   │   └── collecteurs/page.tsx   # Gestion agents
│   ├── verification/[id]/page.tsx  # Page scan QR (publique)
│   └── api/
│       ├── auth/collector/         # Auth custom collecteur
│       ├── parcelles/              # CRUD parcelles
│       ├── collecteurs/            # CRUD agents
│       └── plate-image/[id]/       # Rendu plaque SVG
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── forms/                      # Formulaires
│   ├── admin/                      # Composants admin
│   └── plate/                      # Rendu plaque
├── db/
│   ├── schema.ts                   # Schéma Drizzle
│   └── index.ts                    # Connexion DB
└── lib/
    ├── auth.ts                     # Helpers auth collecteur
    ├── validations.ts              # Schémas Zod
    └── plate-generator.ts          # Moteur de génération plaque
```

## Licence

Projet propriétaire — Tous droits réservés.
