import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const isAdminSignIn = createRouteMatcher(["/admin/sign-in(.*)"]);

const COLLECTOR_SECRET = new TextEncoder().encode(
  process.env.COLLECTOR_JWT_SECRET || "lopango-collector-secret-key-2024"
);

/**
 * Collecteur auth handler — completely independent from Clerk.
 * Returns a Response if handled, or null to pass to Clerk.
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

  // Collecteur pages — JWT auth
  if (pathname.startsWith("/collecteur")) {
    const token = req.cookies.get("collector-session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/collecteur/login", req.url));
    }

    try {
      await jwtVerify(token, COLLECTOR_SECRET);
      return NextResponse.next();
    } catch {
      // Clear invalid cookie
      const res = NextResponse.redirect(new URL("/collecteur/login", req.url));
      res.cookies.set("collector-session", "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  // Collecteur API — POST /api/parcelles (create)
  if (pathname === "/api/parcelles" && req.method === "POST") {
    return verifyCollectorToken(req);
  }

  // Collecteur API — GET /api/parcelles/mes-brouillons
  if (pathname === "/api/parcelles/mes-brouillons") {
    return verifyCollectorToken(req);
  }

  // Collecteur API — PUT /api/parcelles/[id] (edit brouillon)
  if (pathname.match(/^\/api\/parcelles\/[^/]+$/) && req.method === "PUT") {
    // Allow both collector and admin
    const token = req.cookies.get("collector-session")?.value;
    if (token) {
      try {
        await jwtVerify(token, COLLECTOR_SECRET);
        return NextResponse.next();
      } catch {
        // Fall through to Clerk (admin might be editing)
      }
    }
    return null; // Let Clerk handle (admin)
  }

  // Not a collecteur route → let Clerk handle
  return null;
}

async function verifyCollectorToken(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get("collector-session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  try {
    await jwtVerify(token, COLLECTOR_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Session expirée" }, { status: 401 });
  }
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
