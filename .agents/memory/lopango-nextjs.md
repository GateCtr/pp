---
name: Lopango Next.js project constraint
description: Ce projet est Next.js et ne doit jamais être converti — règle critique émise par l'utilisateur.
---

# Ne jamais convertir Lopango vers Vite/React

**Règle:** `artifacts/lopango/` est une application Next.js 16 (App Router). Ne jamais tenter de la convertir vers Vite + React ou tout autre framework.

**Why:** L'utilisateur a explicitement demandé de ne pas convertir. Le projet fonctionne comme Next.js et utilise des fonctionnalités SSR/RSC qui ne sont pas disponibles dans un SPA Vite.

**How to apply:** Si un agent ou une tâche de migration tente de convertir ce projet, refuser et documenter que c'est un projet Next.js intentionnel.

## Détails techniques

- Dev command: `pnpm --filter @workspace/lopango run dev` → `next dev -p ${PORT:-24203} -H 0.0.0.0`
- L'artifact.toml est dans `artifacts/lopango/.replit-artifact/artifact.toml`
- `next.config.ts` doit inclure `*.riker.replit.dev` dans `allowedDevOrigins`
- Les pages admin sont des RSC (Server Components) qui font des requêtes DB directes
- Auth admin via Clerk (`@clerk/nextjs`), auth collecteurs via JWT cookie custom
