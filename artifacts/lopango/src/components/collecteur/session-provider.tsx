"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ZoneInfo {
  avenueId: string;
  avenueNom: string;
  quartierId: string;
  quartierNom: string;
  communeNom: string;
  villeOuTerritoireNom: string;
}

interface Session {
  agentId: string;
  nom: string;
  role: string;
  zone?: ZoneInfo;
}

interface SessionContextType {
  session: Session | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
});

export function useCollectorSession() {
  return useContext(SessionContext);
}

export function CollectorSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Page login — pas de vérification
    if (pathname === "/collecteur/login") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/collector/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setSession(data);
        } else {
          // 401 = pas de session valide ET on est en ligne → redirect login
          setSession(null);
          if (navigator.onLine) {
            router.replace("/collecteur/login");
          }
          // Offline → on ne redirige pas, l'app fonctionne en local
        }
      } catch {
        // Fetch échoue (offline) → garder la session existante, ne pas déconnecter
        if (cancelled) return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkSession();
    return () => { cancelled = true; };
  }, [pathname, router]);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
}
