# DIGIPARC — Système de Cartographie & Recensement (RDC)

Application Next.js de gestion des plaques parcellaires pour les communes de la RDC. Permet de générer des plaques SVG vectorielles avec QR code, de gérer des templates de design multi-variantes, et de cartographier les parcelles.

> **Ce projet est déjà configuré pour Replit.** Ne pas relancer de migration.

## Run & Operate

- `cd artifacts/lopango && PORT=3000 pnpm dev` — serveur de développement (port 3000)
- `pnpm run typecheck` — vérification TypeScript complète
- `pnpm run build` — typecheck + build tous les packages
- Env requis : `DATABASE_URL` (PostgreSQL), `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

## Stack

- **Framework** : Next.js 16 (App Router, Turbopack) — `artifacts/lopango/`
- **Runtime** : Node.js 24, TypeScript 5.9, pnpm workspaces
- **DB** : PostgreSQL (Neon) + Drizzle ORM — schema dans `artifacts/lopango/src/db/schema.ts`
- **Auth** : Clerk (`@clerk/nextjs`)
- **Génération plaques** : SVG vectoriel 2400×1100px — `artifacts/lopango/src/lib/plate-generator.ts`
- **UI** : Tailwind CSS v4, shadcn/ui, Lucide

## Où sont les fichiers

- **Source principale** : `artifacts/lopango/src/`
- **Générateur de plaques SVG** : `artifacts/lopango/src/lib/plate-generator.ts`
- **Schéma DB** : `artifacts/lopango/src/db/schema.ts`
- **Templates admin** : `artifacts/lopango/src/app/admin/plaques-templates/`
- **API routes** : `artifacts/lopango/src/app/api/`

## Architecture — décisions clés

- Plaques générées en SVG vectoriel (pas PNG) pour qualité d'impression maximale
- `VariantDesign` stocké en JSON dans la colonne `variants` de `plateTemplates`
- Nouvelles couleurs individuelles par élément : `communeNameColor`, `avenueTextColor`, `numeroLabelColor`, `numeroColor`, `hLineColor`, `vLineColor` — toutes avec fallback rétrocompatible
- Le workflow Replit lance `PORT=3000 pnpm dev` depuis `artifacts/lopango/`

## User preferences

- Utiliser le français dans les réponses
- Les fichiers sources du projet sont dans `artifacts/lopango/src/`
- Ne pas relancer de migration Replit — le projet est déjà natif

## Gotchas

- Le port par défaut dans `package.json` est 24203 — toujours passer `PORT=3000` dans le workflow
- `pnpm install` doit être lancé à la **racine** du workspace (pas dans `artifacts/lopango/`)
- Les Google Fonts dans les SVG ne se chargent que côté navigateur (pas lors de la conversion canvas→PNG)
- La conversion PNG dans `plate-preview-modal.tsx` utilise `canvas height=1200` — la vraie hauteur est 1100
