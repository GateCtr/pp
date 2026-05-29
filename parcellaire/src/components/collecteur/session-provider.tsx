"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/collector/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      } else {
        setSession(null);
        if (pathname !== "/collecteur/login") {
          router.replace("/collecteur/login");
        }
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  // Vérifie la session au mount ET à chaque changement de route
  useEffect(() => {
    checkSession();
  }, [checkSession, pathname]);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
}
