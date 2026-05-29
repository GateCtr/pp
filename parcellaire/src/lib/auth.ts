import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.COLLECTOR_JWT_SECRET || "lopango-collector-secret-key-2024"
);

export interface CollectorSession {
  agentId: string;
  nom: string;
  role: "collecteur";
}

export async function getCollectorSession(): Promise<CollectorSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("collector-session")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as CollectorSession;
  } catch (error) {
    // Log en production pour debug
    console.error("[auth] getCollectorSession failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function requireCollectorSession(): Promise<CollectorSession> {
  const session = await getCollectorSession();
  if (!session) {
    throw new Error("Non authentifié");
  }
  return session;
}
