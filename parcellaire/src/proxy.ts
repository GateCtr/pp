import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Public routes that should NEVER be blocked by any auth
const isPublicRoute = createRouteMatcher([
  "/",
  "/collecteur/login",
  "/verification(.*)",
  "/api/auth/(.*)",
  "/admin/sign-in(.*)",
]);

// ALL collecteur routes (protected by JWT, NOT by Clerk)
const isCollecteurRoute = createRouteMatcher([
  "/collecteur(.*)",
]);

const COLLECTOR_SECRET = new TextEncoder().encode(
  process.env.COLLECTOR_JWT_SECRET || "lopango-collector-secret-key-2024"
);

/**
 * Next.js 16 Proxy (proxy.ts)
 *
 * Protection des routes :
 * - /admin/* (sauf sign-in) → Auth Clerk (administrateurs)
 * - /collecteur/* (sauf login) → JWT cookie (agents collecteurs)
 * - /verification/* → Public (scan QR Code)
 * - /collecteur/login → Public (page de connexion)
 * - / → Public (landing page)
 */
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // ===== PUBLIC ROUTES — no auth at all =====
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // ===== COLLECTEUR ROUTES → JWT Cookie (NOT Clerk) =====
  // Must be checked BEFORE admin routes to avoid Clerk interference
  if (isCollecteurRoute(req)) {
    // /collecteur/login is already handled as public above
    const token = req.cookies.get("collector-session")?.value;

    if (!token) {
      const loginUrl = new URL("/collecteur/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, COLLECTOR_SECRET);
      return NextResponse.next();
    } catch {
      // Token expired or invalid → redirect to login
      const loginUrl = new URL("/collecteur/login", req.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("collector-session");
      return res;
    }
  }

  // ===== ADMIN ROUTES → Clerk Auth =====
  if (isAdminRoute(req)) {
    await auth.protect();
    return NextResponse.next();
  }

  // ===== API ROUTES for collecteur (POST /api/parcelles) =====
  if (pathname.startsWith("/api/parcelles") && req.method === "POST") {
    // Skip admin-only API actions
    if (pathname.includes("validate") || pathname.includes("generate-plates") || pathname.includes("regenerate-plate") || pathname.includes("archive")) {
      return NextResponse.next();
    }

    const token = req.cookies.get("collector-session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    try {
      await jwtVerify(token, COLLECTOR_SECRET);
    } catch {
      return NextResponse.json({ error: "Session expirée" }, { status: 401 });
    }
  }

  // ===== API PUT for parcelles (collecteur editing brouillons) =====
  if (pathname.startsWith("/api/parcelles") && req.method === "PUT") {
    const token = req.cookies.get("collector-session")?.value;
    if (token) {
      try {
        await jwtVerify(token, COLLECTOR_SECRET);
        return NextResponse.next();
      } catch {
        // Invalid token, let it through (admin might be calling)
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
