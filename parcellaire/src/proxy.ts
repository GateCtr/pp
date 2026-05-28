import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

/**
 * Next.js 16 Proxy (anciennement "middleware.ts")
 *
 * Le fichier proxy.ts remplace middleware.ts à partir de Next.js 16.
 * Il s'exécute à la bordure réseau (Edge Runtime) avant chaque requête.
 *
 * @see https://nextjs.org/docs/app/getting-started/proxy
 * @see https://clerk.com/docs/nextjs/getting-started/quickstart
 */
export default clerkMiddleware(async (auth, req) => {
  // Les routes /admin/* exigent une authentification Clerk
  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
