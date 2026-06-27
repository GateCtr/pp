import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const isAdminSignIn = createRouteMatcher(["/admin/sign-in(.*)"]);

/**
 * Next.js 16 Proxy
 * 
 * Les routes /collecteur/* ne sont PAS protégées par le proxy.
 * La protection est gérée côté CLIENT par le SessionProvider
 * (compatibilité mode offline + soft navigation + cache RSC).
 * 
 * Le proxy ne gère que :
 * - Admin auth (Clerk)
 * - Routes publiques (pass-through)
 */
async function collecteurAuth(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  // Routes publiques
  if (
    pathname === "/" ||
    pathname.startsWith("/collecteur") ||
    pathname.startsWith("/verification") ||
    pathname.startsWith("/api/auth/collector")
  ) {
    return NextResponse.next();
  }

  // API parcelles — laisser passer (auth vérifiée dans les route handlers)
  if (pathname.startsWith("/api/parcelles")) {
    return NextResponse.next();
  }

  // API plate-templates, uploads — laisser passer
  if (pathname.startsWith("/api/plate-templates") || pathname.startsWith("/api/uploads")) {
    return NextResponse.next();
  }

  // API collecteurs — laisser passer
  if (pathname.startsWith("/api/collecteurs")) {
    return NextResponse.next();
  }

  return null;
}

const clerk = clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (isAdminSignIn(req)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    await auth.protect();
  }

  return NextResponse.next();
});

export default async function proxy(
  req: NextRequest,
  event: NextFetchEvent
) {
  const collecteurResponse = await collecteurAuth(req);
  if (collecteurResponse) {
    return collecteurResponse;
  }

  return clerk(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
