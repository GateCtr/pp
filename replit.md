# Lopango

Plateforme digitale de cartographie, recensement et signalétique parcellaire pour la République Démocratique du Congo.

## ⚠️ NE PAS CONVERTIR — Projet Next.js

**Ce projet est en Next.js et doit rester en Next.js.** Ne jamais tenter de convertir vers Vite + React ou tout autre framework. L'artifact `artifacts/lopango/` est une application Next.js 16 autonome.

## Run & Operate

- `pnpm --filter @workspace/lopango run dev` — démarrer l'app Next.js (port 24203)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- **Frontend/Backend**: Next.js 16 (App Router), React 19, TypeScript
- **Auth admin**: Clerk (`@clerk/nextjs`)
- **Auth collecteur**: JWT custom (cookie `collector-session`)
- **DB**: PostgreSQL + Drizzle ORM + Neon Serverless
- **CSS**: Tailwind CSS v4
- **PWA**: Service Worker, manifest, offline support

## Where things live

- `artifacts/lopango/src/app/` — Next.js App Router (pages + API routes)
- `artifacts/lopango/src/app/api/` — API routes Next.js (auth, parcelles, collecteurs, geo, plates)
- `artifacts/lopango/src/components/` — Composants React partagés
- `artifacts/lopango/src/db/` — Schema Drizzle + connexion Neon
- `artifacts/lopango/src/lib/` — Utilitaires (auth, plate-generator, validations)
- `artifacts/lopango/public/` — Assets PWA (icons, manifest, service worker)

## Routes principales

- `/` — Landing page publique
- `/admin` — Dashboard administrateur (protégé Clerk)
- `/admin/parcelles` — Gestion des parcelles
- `/admin/collecteurs` — Gestion des agents
- `/admin/geo` — Arbre géographique
- `/admin/plaques-templates` — Templates de plaques
- `/collecteur` — App mobile agent (protégé JWT)
- `/collecteur/login` — Connexion agent par code d'accès
- `/verification/[id]` — Vérification publique d'une parcelle (QR code)

## Variables d'environnement requises

- `DATABASE_URL` — Connexion Postgres (Neon)
- `CLERK_SECRET_KEY` — Clé secrète Clerk (admin auth)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clé publique Clerk
- `COLLECTOR_JWT_SECRET` — Secret JWT pour les agents collecteurs
- `NEXT_PUBLIC_APP_URL` — URL publique de l'app
- `CLOUDFLARE_R2_*` — Stockage des assets (flag, seal, plate images)

## Architecture decisions

- Next.js App Router avec RSC (React Server Components) pour les pages admin
- JWT cookie-based auth pour les collecteurs (sans Clerk, pour usage mobile offline)
- PWA avec service worker pour collecte terrain hors ligne
- Drizzle ORM sur Neon (postgres serverless)

## User preferences

- Le projet est Next.js et doit rester Next.js — ne jamais convertir vers Vite/React SPA
- Ne pas modifier la structure du projet sans instruction explicite

## Gotchas

- Les pages admin (`/admin/*`) sont des Server Components qui font des requêtes DB directes
- Les routes API Next.js (`/api/*`) gèrent auth, parcelles, geo, collecteurs et plate generation
- Le service worker (`public/sw.js`) gère le mode offline pour les collecteurs
- `artifacts/lopango/parcellaire/` est une sous-app distincte (ne pas confondre avec `src/`)
