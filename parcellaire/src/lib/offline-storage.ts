/**
 * Stockage hors-ligne pour les collecteurs.
 * Utilise IndexedDB pour stocker les formulaires en attente de synchronisation.
 */

const DB_NAME = "lopango-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-parcelles";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface OfflineParcelle {
  id?: number;
  data: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
}

/** Sauvegarder un formulaire parcelle en local (offline) */
export async function saveOfflineParcelle(data: Record<string, unknown>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const entry: OfflineParcelle = { data, createdAt: new Date().toISOString(), synced: false };
    const request = store.add(entry);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

/** Récupérer toutes les parcelles en attente de sync */
export async function getPendingParcelles(): Promise<OfflineParcelle[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as OfflineParcelle[];
      resolve(all.filter((p) => !p.synced));
    };
    request.onerror = () => reject(request.error);
  });
}

/** Marquer une parcelle comme synchronisée */
export async function markAsSynced(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const entry = getReq.result;
      if (entry) { entry.synced = true; store.put(entry); }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/** Supprimer les entrées synchronisées */
export async function clearSyncedParcelles(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as OfflineParcelle[];
      all.forEach((entry) => { if (entry.synced && entry.id) store.delete(entry.id); });
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

/** Synchroniser toutes les parcelles en attente avec le serveur */
export async function syncPendingParcelles(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingParcelles();
  let synced = 0;
  let failed = 0;

  for (const entry of pending) {
    try {
      const res = await fetch("/api/parcelles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.data),
      });
      if (res.ok && entry.id) { await markAsSynced(entry.id); synced++; }
      else { failed++; }
    } catch { failed++; }
  }

  if (synced > 0) await clearSyncedParcelles();
  return { synced, failed };
}

/** Vérifier si on est en ligne */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/** Compter les parcelles en attente */
export async function countPending(): Promise<number> {
  const pending = await getPendingParcelles();
  return pending.length;
}
