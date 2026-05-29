import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Collecteur protected routes (NOT login page)
const isCollecteurProtectedRoute = createRouteMatcher([
  "/collecteur",
  "/collecteur/nouvelle",
  "/collecteur/editer(.*)",
]);

// Public routes that should NEVER be blocked
const isPublicRoute = createRouteMatcher([
  "/",
  "/collecteur/login",
  "/verification(.*)",
  "/api/auth/collector",
  "/api/auth/collector/logout",
  "/admin/sign-in(.*)",
]);

const COLLECTOR_SECRET = new TextEncoder().encode(
  process.env.COLLECTOR_JWT_SECRET || "lopango-collector-secret-key-2024"
);

/**
 * Next.js 16 Proxy (proxy.ts)
 *
 * Protection des routes :
 * - /admin/* → Auth Clerk (administrateurs)
 * - /collecteur/* (sauf login) → JWT cookie (agents collecteurs)
 * - /verification/* → Public (scan QR Code)
 * - /collecteur/login → Public (page de connexion)
 * - / → Public (landing page)
 */
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Inject pathname in headers for layout detection
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  // ===== PUBLIC ROUTES =====
  if (isPublicRoute(req)) {
    return response;
  }

  // ===== ADMIN ROUTES → Clerk Auth =====
  if (isAdminRoute(req)) {
    await auth.protect();
    return response;
  }

  // ===== COLLECTEUR PROTECTED ROUTES → JWT Cookie =====
  if (isCollecteurProtectedRoute(req)) {
    const token = req.cookies.get("collector-session")?.value;

    if (!token) {
      const loginUrl = new URL("/collecteur/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, COLLECTOR_SECRET);
      return response;
    } catch {
      // Token expired or invalid → redirect to login
      const loginUrl = new URL("/collecteur/login", req.url);
      const res = NextResponse.redirect(loginUrl);
      // Clear the bad cookie
      res.cookies.delete("collector-session");
      return res;
    }
  }

  // ===== API ROUTES (collecteur protected) =====
  if (pathname.startsWith("/api/parcelles") && req.method === "POST" && !pathname.includes("validate") && !pathname.includes("generate-plates") && !pathname.includes("regenerate-plate")) {
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

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
