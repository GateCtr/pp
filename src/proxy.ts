import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const isAdminSignIn = createRouteMatcher(["/admin/sign-in(.*)"]);

/**
 * Collecteur auth handler — vérifie juste la PRÉSENCE du cookie.
 * La vérification JWT complète est faite par getCollectorSession() dans les server components.
 * Ceci évite les problèmes d'env vars Edge vs Node runtime.
 */
async function collecteurAuth(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  // Public pages — no auth needed
  if (
    pathname === "/" ||
    pathname === "/collecteur/login" ||
    pathname.startsWith("/verification") ||
    pathname.startsWith("/api/auth/collector")
  ) {
    return NextResponse.next();
  }

  // Collecteur pages — check cookie exists
  // IMPORTANT: Ne PAS rediriger les RSC fetch (soft navigation).
  // Un 302/307 sur un RSC fetch est interprété par Next.js comme
  // une redirection de page → déconnexion de l'utilisateur.
  // Seules les navigations directes (full page load) sont redirigées.
  if (pathname.startsWith("/collecteur")) {
    const token = req.cookies.get("collector-session")?.value;
    const isRSCFetch = req.headers.get("rsc") === "1"
      || req.headers.get("next-router-state-tree") !== null
      || req.headers.get("next-url") !== null;

    if (!token && !isRSCFetch) {
      // Navigation directe sans cookie → redirect login
      return NextResponse.redirect(new URL("/collecteur/login", req.url));
    }

    // Cookie présent OU RSC fetch → laisser passer
    // Le SessionProvider client vérifie la session et redirige si nécessaire
    return NextResponse.next();
  }

  // Collecteur API — POST /api/parcelles (create)
  if (pathname === "/api/parcelles" && req.method === "POST") {
    const token = req.cookies.get("collector-session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    // Juste vérifier la présence — le server vérifie le JWT complet
    return NextResponse.next();
  }

  // Collecteur API — GET /api/parcelles/mes-brouillons
  if (pathname === "/api/parcelles/mes-brouillons") {
    const token = req.cookies.get("collector-session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Collecteur API — PUT /api/parcelles/[id] (edit brouillon)
  if (pathname.match(/^\/api\/parcelles\/[^/]+$/) && req.method === "PUT") {
    const token = req.cookies.get("collector-session")?.value;
    if (token) {
      return NextResponse.next();
    }
    return null; // Let Clerk handle (admin)
  }

  // Not a collecteur route → let Clerk handle
  return null;
}

/**
 * Main proxy export.
 * 
 * Strategy:
 * 1. Try collecteur auth first (independent of Clerk)
 * 2. If not a collecteur route, pass to Clerk for admin auth
 */
const clerk = clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Admin sign-in is public
  if (isAdminSignIn(req)) {
    return NextResponse.next();
  }

  // Admin routes require Clerk auth
  if (pathname.startsWith("/admin")) {
    await auth.protect();
  }

  return NextResponse.next();
});

export default async function proxy(
  req: NextRequest,
  event: NextFetchEvent
) {
  // Step 1: Handle collecteur routes WITHOUT Clerk
  const collecteurResponse = await collecteurAuth(req);
  if (collecteurResponse) {
    return collecteurResponse;
  }

  // Step 2: Everything else goes through Clerk
  return clerk(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
