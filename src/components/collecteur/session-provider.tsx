"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Session {
  agentId: string;
  nom: string;
  role: string;
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
  const checkedRef = useRef(false);

  useEffect(() => {
    // Ne pas vérifier sur la page login
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
          checkedRef.current = true;
        } else {
          setSession(null);
          // Ne rediriger que si on a déjà vérifié au moins une fois
          // (évite de rediriger pendant le premier rendu après login)
          if (checkedRef.current) {
            router.replace("/collecteur/login");
          }
        }
      } catch {
        // Erreur réseau — ne pas déconnecter (mode offline possible)
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
