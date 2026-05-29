import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COLLECTOR_JWT_SECRET = process.env.COLLECTOR_JWT_SECRET || "parcellaire-collector-secret-key-2024";
const SECRET = new TextEncoder().encode(COLLECTOR_JWT_SECRET);

/**
 * Next.js 16 Proxy (anciennement "middleware.ts")
 *
 * Le fichier proxy.ts remplace middleware.ts à partir de Next.js 16.
 * Il s'exécute à la bordure réseau (Edge Runtime) avant chaque requête.
 *
 * @see https://nextjs.org/docs/app/getting-started/proxy
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes de collecteur
  const isCollectorRoute = pathname.startsWith('/collecteur');
  const isCollectorLogin = pathname === '/collecteur/login';
  const isCollectorAuthAPI = pathname.startsWith('/api/auth/collector');
  const isCollectorLogout = pathname === '/api/auth/collector/logout';

  // Pour les routes de collecteur (sauf login et API auth)
  if (isCollectorRoute && !isCollectorLogin && !isCollectorAuthAPI) {
    // Vérifier le cookie collector-session
    const sessionCookie = request.cookies.get('collector-session');
    
    if (!sessionCookie) {
      // Pas de session, rediriger vers login
      const loginUrl = new URL('/collecteur/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Vérifier le JWT token
      await jwtVerify(sessionCookie.value, SECRET);
      // Token valide, continuer
      return NextResponse.next();
    } catch (error) {
      // Token invalide ou expiré, rediriger vers login
      const loginUrl = new URL('/collecteur/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      // Supprimer le cookie invalide
      response.cookies.delete('collector-session');
      return response;
    }
  }

  // Pour la déconnexion, supprimer le cookie
  if (isCollectorLogout) {
    const response = NextResponse.next();
    response.cookies.delete('collector-session');
    return response;
  }

  // Pour toutes les autres routes, continuer
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
